'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import { OrderStatusBadge } from '@/components/admin/Badge';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, generateOrderNumber } from '@/lib/utils';
import {
  Search, Plus, FileText, Truck, RefreshCw, ChevronDown,
  Package, User, Phone, MapPin, Edit2, X, Save, Hash,
} from 'lucide-react';

interface OrderItem {
  productName: string;
  variantArticle: string;
  variantColor: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; phone: string; email: string; city: string; address: string };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  warehouse: string;
  ttn?: string;
  invoiceNumber?: string;
  source: string;
  createdAt: string;
}

const STATUSES = ['all', 'new', 'processing', 'invoice_created', 'shipped', 'in_transit', 'delivered', 'received', 'paid', 'cancelled'];
const NEXT_STATUS: Record<string, string> = {
  new: 'processing', processing: 'invoice_created', invoice_created: 'shipped',
  shipped: 'in_transit', in_transit: 'delivered', delivered: 'received', received: 'paid',
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get('status') || 'all';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTtn, setEditTtn] = useState('');
  const [editWarehouse, setEditWarehouse] = useState('warehouse1');

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search) params.set('search', search);
    params.set('limit', '100');
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, search]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setOrders(prev => prev.map(o => o._id === id ? updated : o));
  };

  const saveOrder = async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttn: editTtn, warehouse: editWarehouse }),
    });
    const updated = await res.json();
    setOrders(prev => prev.map(o => o._id === id ? updated : o));
    setEditing(null);
  };

  const generateInvoice = async (order: Order) => {
    const invoiceNumber = `ФП-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    await fetch(`/api/orders/${order._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceNumber, status: 'invoice_created' }),
    });
    setOrders(prev => prev.map(o =>
      o._id === order._id ? { ...o, invoiceNumber, status: 'invoice_created' } : o
    ));
  };

  return (
    <div className="fade-in">
      <Breadcrumbs custom={[{ label: 'Адмін', href: '/admin' }, { label: 'Замовлення' }]} />
      <PageHeader
        title="Замовлення"
        subtitle={`${orders.length} замовлень`}
      />

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => {
              const url = new URL(window.location.href);
              if (s !== 'all') url.searchParams.set('status', s);
              else url.searchParams.delete('status');
              router.push(url.pathname + url.search);
            }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-[#161b27] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {s === 'all' ? 'Всі' : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Пошук за номером, клієнтом, телефоном..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[#161b27] border border-white/8 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />Завантаження...
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const isExp = expanded === order._id;
            const isEdit = editing === order._id;
            const nextStatus = NEXT_STATUS[order.status];

            return (
              <div key={order._id} className="bg-[#161b27] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-all">
                {/* Main row */}
                <div className="flex items-center gap-4 p-4">
                  <button onClick={() => setExpanded(isExp ? null : order._id)} className="text-slate-500 hover:text-slate-300">
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExp ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-200 font-mono text-sm font-medium">{order.orderNumber}</span>
                      <OrderStatusBadge status={order.status} />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.warehouse === 'warehouse1' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-purple-500/15 text-purple-400'}`}>
                        {order.warehouse === 'warehouse1' ? 'Склад 1' : 'Склад 2'}
                      </span>
                      {order.source === 'store' && <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">Магазин</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{order.customer.name}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.customer.phone}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.customer.city}</span>
                    </div>
                    {order.ttn && (
                      <p className="text-xs text-amber-400 mt-0.5 flex items-center gap-1">
                        <Truck className="w-3 h-3" />ТТН: {order.ttn}
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-slate-500 text-xs">{formatDate(order.createdAt)}</p>
                    <p className="text-slate-500 text-xs">{order.items.reduce((s, i) => s + i.quantity, 0)} шт</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(order._id, nextStatus)}
                        className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs rounded-lg transition-colors"
                      >
                        {ORDER_STATUS_LABELS[nextStatus]}
                      </button>
                    )}
                    {!order.invoiceNumber && (
                      <button
                        onClick={() => generateInvoice(order)}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                        title="Згенерувати рахунок"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => { setEditing(isEdit ? null : order._id); setEditTtn(order.ttn || ''); setEditWarehouse(order.warehouse); }}
                      className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Edit row */}
                {isEdit && (
                  <div className="border-t border-white/5 p-4 bg-[#0d1117] flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">ТТН Нова Пошта</label>
                      <input
                        type="text"
                        value={editTtn}
                        onChange={e => setEditTtn(e.target.value)}
                        placeholder="590001234567890"
                        className="px-3 py-2 bg-[#161b27] border border-white/8 rounded-lg text-sm text-white w-52 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Склад</label>
                      <select
                        value={editWarehouse}
                        onChange={e => setEditWarehouse(e.target.value)}
                        className="px-3 py-2 bg-[#161b27] border border-white/8 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50"
                      >
                        <option value="warehouse1">Склад 1</option>
                        <option value="warehouse2">Склад 2</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveOrder(order._id)} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">
                        <Save className="w-3.5 h-3.5" />Зберегти
                      </button>
                      <button onClick={() => setEditing(null)} className="px-3 py-2 bg-[#161b27] border border-white/8 text-slate-400 text-sm rounded-lg hover:text-white transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded details */}
                {isExp && (
                  <div className="border-t border-white/5 p-4 bg-[#0d1117]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Товари</h4>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#161b27] border border-white/5">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                                  <Package className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                  <p className="text-slate-200 text-xs font-medium">{item.productName}</p>
                                  <p className="text-slate-500 text-[10px]">{item.variantColor} · {item.variantArticle}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-white text-xs font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                <p className="text-slate-500 text-[10px]">{item.quantity} × {formatCurrency(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Клієнт та доставка</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex gap-2"><User className="w-4 h-4 text-slate-500 flex-shrink-0" /><span className="text-slate-300">{order.customer.name}</span></div>
                          <div className="flex gap-2"><Phone className="w-4 h-4 text-slate-500 flex-shrink-0" /><span className="text-slate-300">{order.customer.phone}</span></div>
                          <div className="flex gap-2"><MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" /><span className="text-slate-300">{order.customer.city}, {order.customer.address}</span></div>
                          {order.ttn && <div className="flex gap-2"><Truck className="w-4 h-4 text-amber-400 flex-shrink-0" /><span className="text-amber-400">{order.ttn}</span></div>}
                          {order.invoiceNumber && <div className="flex gap-2"><Hash className="w-4 h-4 text-emerald-400 flex-shrink-0" /><span className="text-emerald-400">Рахунок: {order.invoiceNumber}</span></div>}
                        </div>
                        {/* Status timeline */}
                        <div className="mt-4">
                          <h5 className="text-slate-500 text-xs mb-2">Статус замовлення</h5>
                          <div className="flex flex-wrap gap-1">
                            {['new', 'processing', 'invoice_created', 'shipped', 'in_transit', 'delivered', 'received', 'paid'].map(s => {
                              const statuses = ['new', 'processing', 'invoice_created', 'shipped', 'in_transit', 'delivered', 'received', 'paid', 'cancelled'];
                              const currentIdx = statuses.indexOf(order.status);
                              const thisIdx = statuses.indexOf(s);
                              const isDone = thisIdx <= currentIdx;
                              return (
                                <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full ${isDone ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/3 text-slate-600'}`}>
                                  {ORDER_STATUS_LABELS[s]}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {orders.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Замовлень не знайдено</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-40 text-slate-400"><RefreshCw className="w-4 h-4 animate-spin mr-2" />Завантаження...</div>}>
      <OrdersContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import { formatCurrency } from '@/lib/utils';
import { Warehouse, Search, AlertTriangle, RefreshCw, Edit2, Save, X } from 'lucide-react';

interface InventoryItem {
  _id: string;
  productName: string;
  variantArticle: string;
  variantColor: string;
  warehouse: string;
  quantity: number;
  reservedQuantity: number;
  minQuantity: number;
}

function InventoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const warehouseFilter = searchParams.get('warehouse') || '';
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(0);
  const [editMin, setEditMin] = useState(0);

  const fetchInventory = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (warehouseFilter) params.set('warehouse', warehouseFilter);
    const res = await fetch(`/api/inventory?${params}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, [warehouseFilter]);

  const filtered = items.filter(item =>
    !search ||
    item.productName.toLowerCase().includes(search.toLowerCase()) ||
    item.variantArticle.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (item: InventoryItem) => {
    setEditing(item._id);
    setEditQty(item.quantity);
    setEditMin(item.minQuantity);
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: editQty, minQuantity: editMin }),
    });
    setItems(prev => prev.map(i => i._id === id ? { ...i, quantity: editQty, minQuantity: editMin } : i));
    setEditing(null);
  };

  const totalW1 = items.filter(i => i.warehouse === 'warehouse1').reduce((s, i) => s + i.quantity, 0);
  const totalW2 = items.filter(i => i.warehouse === 'warehouse2').reduce((s, i) => s + i.quantity, 0);
  const lowStock = items.filter(i => i.quantity <= i.minQuantity);

  const tabs = [
    { label: 'Всі склади', value: '' },
    { label: `Склад 1 (${totalW1} шт)`, value: 'warehouse1' },
    { label: `Склад 2 (${totalW2} шт)`, value: 'warehouse2' },
  ];

  return (
    <div className="fade-in">
      <Breadcrumbs custom={[{ label: 'Адмін', href: '/admin' }, { label: 'Облік товарів' }]} />
      <PageHeader title="Облік товарів" subtitle={`${items.length} позицій на складах`} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/15"><Warehouse className="w-5 h-5 text-indigo-400" /></div>
          <div>
            <p className="text-slate-400 text-xs">Склад 1</p>
            <p className="text-white font-bold text-xl">{totalW1} шт</p>
          </div>
        </div>
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/15"><Warehouse className="w-5 h-5 text-purple-400" /></div>
          <div>
            <p className="text-slate-400 text-xs">Склад 2</p>
            <p className="text-white font-bold text-xl">{totalW2} шт</p>
          </div>
        </div>
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-500/15"><AlertTriangle className="w-5 h-5 text-rose-400" /></div>
          <div>
            <p className="text-slate-400 text-xs">Критичний залишок</p>
            <p className="text-white font-bold text-xl">{lowStock.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              const url = new URL(window.location.href);
              if (tab.value) url.searchParams.set('warehouse', tab.value);
              else url.searchParams.delete('warehouse');
              router.push(url.pathname + url.search);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              warehouseFilter === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-[#161b27] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Пошук за товаром або артикулом..."
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
        <div className="bg-[#161b27] rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Товар</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Артикул</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Склад</th>
                <th className="text-right px-4 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Кількість</th>
                <th className="text-right px-4 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Резерв</th>
                <th className="text-right px-4 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Мінімум</th>
                <th className="text-right px-4 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {filtered.map(item => {
                const isLow = item.quantity <= item.minQuantity;
                const isEdit = editing === item._id;
                return (
                  <tr key={item._id} className={`hover:bg-white/2 transition-colors ${isLow ? 'bg-rose-500/3' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-slate-200 text-sm">{item.productName}</p>
                      <p className="text-slate-500 text-xs">{item.variantColor}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm font-mono">{item.variantArticle}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.warehouse === 'warehouse1' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-purple-500/15 text-purple-400'}`}>
                        {item.warehouse === 'warehouse1' ? 'Склад 1' : 'Склад 2'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEdit ? (
                        <input type="number" min={0} value={editQty} onChange={e => setEditQty(Number(e.target.value))} className="w-20 px-2 py-1 bg-[#0d1117] border border-indigo-500/50 rounded text-sm text-white text-right" />
                      ) : (
                        <span className={`font-bold text-sm ${isLow ? 'text-rose-400' : 'text-white'}`}>{item.quantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-sm">{item.reservedQuantity}</td>
                    <td className="px-4 py-3 text-right">
                      {isEdit ? (
                        <input type="number" min={0} value={editMin} onChange={e => setEditMin(Number(e.target.value))} className="w-16 px-2 py-1 bg-[#0d1117] border border-indigo-500/50 rounded text-sm text-white text-right" />
                      ) : (
                        <span className="text-slate-500 text-sm">{item.minQuantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isLow ? (
                        <span className="flex items-center justify-end gap-1 text-rose-400 text-xs"><AlertTriangle className="w-3 h-3" />Критично</span>
                      ) : (
                        <span className="text-emerald-400 text-xs">Норма</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isEdit ? (
                          <>
                            <button onClick={() => saveEdit(item._id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded"><Save className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditing(null)} className="p-1.5 text-slate-400 hover:bg-white/5 rounded"><X className="w-3.5 h-3.5" /></button>
                          </>
                        ) : (
                          <button onClick={() => startEdit(item)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Warehouse className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Позицій не знайдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-40 text-slate-400"><RefreshCw className="w-4 h-4 animate-spin mr-2" />Завантаження...</div>}>
      <InventoryContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, Search, Plus, Star, Phone, Mail, MapPin, ShoppingCart, DollarSign, RefreshCw, X } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
}

const inputClass = "w-full px-3 py-2.5 bg-[#0d1117] border border-white/8 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/customers?${params}`);
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const addCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const c = await res.json();
      setCustomers(prev => [c, ...prev]);
      setForm({ name: '', email: '', phone: '', city: '', notes: '' });
      setShowAdd(false);
    }
    setSaving(false);
  };

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3);

  return (
    <div className="fade-in">
      <Breadcrumbs custom={[{ label: 'Адмін', href: '/admin' }, { label: 'Клієнти' }]} />
      <PageHeader
        title="Каталог клієнтів"
        subtitle={`${customers.length} клієнтів`}
        actions={
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Додати клієнта
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/15"><Users className="w-5 h-5 text-indigo-400" /></div>
          <div><p className="text-slate-500 text-xs">Всього клієнтів</p><p className="text-white font-bold text-lg">{customers.length}</p></div>
        </div>
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/15"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
          <div><p className="text-slate-500 text-xs">Загальна виручка</p><p className="text-white font-bold text-lg">{formatCurrency(totalRevenue)}</p></div>
        </div>
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/15"><Star className="w-5 h-5 text-amber-400" /></div>
          <div><p className="text-slate-500 text-xs">Топ клієнт</p><p className="text-white font-bold text-sm truncate">{topCustomers[0]?.name || '—'}</p></div>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-[#161b27] rounded-xl border border-indigo-500/30 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Новий клієнт</h3>
            <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={addCustomer} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Ім&apos;я *</label>
              <input required type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="Тетяна Мельник" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Телефон *</label>
              <input required type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="+380671234567" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Місто</label>
              <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={inputClass} placeholder="Київ" />
            </div>
            <div className="col-span-2">
              <label className="text-slate-400 text-xs mb-1 block">Нотатки</label>
              <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={inputClass} />
            </div>
            <div className="col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Збереження...' : 'Зберегти'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Пошук за ім'ям, телефоном або email..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map((customer, i) => {
            const isTop = topCustomers.some(t => t._id === customer._id);
            return (
              <div key={customer._id} className={`bg-[#161b27] rounded-xl border p-4 hover:border-white/10 transition-all ${isTop ? 'border-amber-500/20' : 'border-white/5'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm flex items-center gap-1">
                        {customer.name}
                        {isTop && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      </p>
                      <p className="text-slate-500 text-xs">Клієнт з {formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.city && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{customer.city}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-indigo-400 font-bold text-lg">{customer.totalOrders}</p>
                    <p className="text-slate-500 text-xs flex items-center justify-center gap-1"><ShoppingCart className="w-3 h-3" />замовлень</p>
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-400 font-bold text-sm">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-slate-500 text-xs flex items-center justify-center gap-1"><DollarSign className="w-3 h-3" />витрачено</p>
                  </div>
                </div>
              </div>
            );
          })}

          {customers.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Клієнтів не знайдено</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

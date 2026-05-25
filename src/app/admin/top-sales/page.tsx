'use client';

import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Medal, Tag, RefreshCw, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';

interface TopProduct {
  _id: string;
  name: string;
  revenue: number;
  sold: number;
}

interface Stats {
  topProducts: TopProduct[];
  salesByMonth: { _id: number; revenue: number; orders: number }[];
  salesByDay: { _id: string; revenue: number; orders: number }[];
}

const MONTHS = ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв', 'Лип', 'Серп', 'Вер', 'Жовт', 'Лист', 'Груд'];
const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2535] border border-white/10 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.name.includes('Виручка') ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export default function TopSalesPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-slate-400">
      <RefreshCw className="w-4 h-4 animate-spin mr-2" />Завантаження...
    </div>
  );

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const found = stats?.salesByMonth.find(s => s._id === i + 1);
    return { month: MONTHS[i], revenue: found?.revenue || 0, orders: found?.orders || 0 };
  });

  const weekData = stats?.salesByDay.slice(-7).map(d => ({
    date: d._id.slice(5),
    revenue: d.revenue,
    orders: d.orders,
  })) || [];

  type ChartPoint = { label: string; revenue: number; orders: number };
  const chartData: ChartPoint[] = period === 'year'
    ? monthlyData.map(d => ({ label: d.month, revenue: d.revenue, orders: d.orders }))
    : period === 'week'
    ? weekData.map(d => ({ label: d.date, revenue: d.revenue, orders: d.orders }))
    : (stats?.salesByDay.slice(-30) || []).map(d => ({ label: d._id.slice(5), revenue: d.revenue, orders: d.orders }));

  const topProducts = stats?.topProducts || [];

  return (
    <div className="fade-in">
      <Breadcrumbs custom={[{ label: 'Адмін', href: '/admin' }, { label: 'Топ продажів' }]} />
      <PageHeader title="Топ продажів" subtitle="Аналітика найкращих товарів" />

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {(['week', 'month', 'year'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p ? 'bg-indigo-600 text-white' : 'bg-[#161b27] text-slate-400 border border-white/5 hover:text-white'
            }`}
          >
            {p === 'week' ? 'Тиждень' : p === 'month' ? 'Місяць' : 'Рік'}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
          <h3 className="text-white font-semibold mb-1">Динаміка продажів</h3>
          <p className="text-slate-500 text-xs mb-4">Виручка за вибраний період</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Виручка (грн)" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
          <h3 className="text-white font-semibold mb-1">Кількість замовлень</h3>
          <p className="text-slate-500 text-xs mb-4">За вибраний період</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => <span className="text-slate-400 text-xs">{v}</span>} />
              <Line type="monotone" dataKey="orders" name="Замовлення" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
        <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Топ товарів
        </h3>
        <p className="text-slate-500 text-xs mb-5">За загальною виручкою</p>
        <div className="space-y-4">
          {topProducts.map((product, i) => {
            const maxRevenue = topProducts[0]?.revenue || 1;
            const pct = Math.round((product.revenue / maxRevenue) * 100);
            return (
              <div key={product._id} className="group">
                <div className="flex items-center gap-4 mb-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {i < 3 ? (
                      <Medal className={`w-4 h-4 flex-shrink-0 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : 'text-amber-700'}`} />
                    ) : (
                      <span className="w-4 text-center text-slate-600 text-xs font-bold flex-shrink-0">{i + 1}</span>
                    )}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-slate-200 text-sm font-medium truncate">{product.name}</span>
                      <span className="text-xs bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />Топ продажів
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{formatCurrency(product.revenue)}</p>
                    <p className="text-slate-500 text-xs">{product.sold} шт продано</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-slate-500 text-xs w-8 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}

          {topProducts.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Немає даних про продажі
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

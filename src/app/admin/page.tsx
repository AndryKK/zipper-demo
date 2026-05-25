'use client';

import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCart, Users, Package, DollarSign, TrendingUp,
  AlertTriangle, Warehouse, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadialBarChart, RadialBar,
} from 'recharts';

const MONTHS = ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв', 'Лип', 'Серп', 'Вер', 'Жовт', 'Лист', 'Груд'];

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface Stats {
  kpis: {
    totalOrders: number;
    monthOrders: number;
    lastMonthOrders: number;
    totalRevenue: number;
    monthRevenue: number;
    weekOrders: number;
    totalProducts: number;
    totalCustomers: number;
    lowStockCount: number;
  };
  salesByDay: { _id: string; revenue: number; orders: number }[];
  salesByMonth: { _id: number; revenue: number; orders: number }[];
  topProducts: { _id: string; name: string; revenue: number; sold: number }[];
  ordersByStatus: { _id: string; count: number }[];
  lowStockItems: { productName: string; variantArticle: string; quantity: number; minQuantity: number; warehouse: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Нові', processing: 'В обробці', invoice_created: 'Накладна',
  shipped: 'Відправлено', in_transit: 'В дорозі', delivered: 'Доставлено',
  received: 'Отримано', paid: 'Оплачено', cancelled: 'Скасовано',
};

function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2535] border border-white/10 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.name === 'revenue' || p.name === 'Виручка'
            ? formatCurrency(p.value)
            : p.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Завантаження...
        </div>
      </div>
    );
  }

  const kpis = stats?.kpis;
  const monthTrend = kpis && kpis.lastMonthOrders > 0
    ? Math.round(((kpis.monthOrders - kpis.lastMonthOrders) / kpis.lastMonthOrders) * 100)
    : 0;

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const found = stats?.salesByMonth.find(s => s._id === i + 1);
    return { month: MONTHS[i], revenue: found?.revenue || 0, orders: found?.orders || 0 };
  });

  const last30Days = stats?.salesByDay.slice(-14).map(d => ({
    date: d._id.slice(5),
    revenue: d.revenue,
    orders: d.orders,
  })) || [];

  const pieData = stats?.ordersByStatus.map(s => ({
    name: STATUS_LABELS[s._id] || s._id,
    value: s.count,
  })) || [];

  const topProductsRadial = stats?.topProducts.slice(0, 5).map((p, i) => ({
    name: p.name.slice(0, 20) + (p.name.length > 20 ? '…' : ''),
    revenue: p.revenue,
    fill: COLORS[i],
  })) || [];

  return (
    <div className="fade-in">
      <Breadcrumbs custom={[{ label: 'Адмін' }, { label: 'Дашборд' }]} />

      <PageHeader
        title="Дашборд"
        subtitle="Аналітика та статистика магазину"
        actions={
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Оновити
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Виручка (місяць)"
          value={formatCurrency(kpis?.monthRevenue || 0)}
          subtitle="Поточний місяць"
          icon={DollarSign}
          trend={monthTrend}
          color="indigo"
        />
        <StatCard
          title="Замовлень (місяць)"
          value={kpis?.monthOrders || 0}
          subtitle={`За тиждень: ${kpis?.weekOrders || 0}`}
          icon={ShoppingCart}
          trend={monthTrend}
          color="purple"
        />
        <StatCard
          title="Загальна виручка"
          value={formatCurrency(kpis?.totalRevenue || 0)}
          subtitle={`${kpis?.totalOrders || 0} замовлень`}
          icon={TrendingUp}
          color="cyan"
        />
        <StatCard
          title="Клієнти"
          value={kpis?.totalCustomers || 0}
          subtitle={`Товарів: ${kpis?.totalProducts || 0}`}
          icon={Users}
          color="emerald"
        />
      </div>

      {/* Alerts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Малий залишок"
          value={kpis?.lowStockCount || 0}
          subtitle="Позиції нижче мінімуму"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Всього товарів"
          value={kpis?.totalProducts || 0}
          subtitle="Активні позиції"
          icon={Package}
          color="amber"
        />
        <StatCard
          title="Складів"
          value={2}
          subtitle="Активні склади"
          icon={Warehouse}
          color="indigo"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Area chart - revenue by month */}
        <div className="lg:col-span-2 bg-[#161b27] rounded-xl border border-white/5 p-5">
          <h3 className="text-white font-semibold mb-1">Виручка по місяцях</h3>
          <p className="text-slate-500 text-xs mb-4">Поточний рік</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Виручка" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - orders by status */}
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
          <h3 className="text-white font-semibold mb-1">Статуси замовлень</h3>
          <p className="text-slate-500 text-xs mb-4">Розподіл</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-1 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart last 14 days */}
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
          <h3 className="text-white font-semibold mb-1">Останні 14 днів</h3>
          <p className="text-slate-500 text-xs mb-4">Замовлення та виручка</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last30Days} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="revenue" name="Виручка" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="orders" name="Замовлення" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
          <h3 className="text-white font-semibold mb-1">Топ товарів</h3>
          <p className="text-slate-500 text-xs mb-4">За виручкою</p>
          <div className="space-y-3">
            {stats?.topProducts.slice(0, 5).map((p, i) => {
              const maxRevenue = stats.topProducts[0]?.revenue || 1;
              const pct = Math.round((p.revenue / maxRevenue) * 100);
              return (
                <div key={p._id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-xs truncate max-w-[70%]">
                      <span className="text-slate-500 mr-1">#{i + 1}</span>
                      {p.name}
                    </span>
                    <span className="text-white text-xs font-semibold">{formatCurrency(p.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: COLORS[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders trend line */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-[#161b27] rounded-xl border border-white/5 p-5">
          <h3 className="text-white font-semibold mb-1">Динаміка замовлень</h3>
          <p className="text-slate-500 text-xs mb-4">Кількість та виручка останні 14 днів</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={last30Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span className="text-slate-400 text-xs">{v}</span>} />
              <Line type="monotone" dataKey="orders" name="Замовлення" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock alerts */}
        <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
          <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Критичний залишок
          </h3>
          <p className="text-slate-500 text-xs mb-4">Поповніть запаси</p>
          <div className="space-y-2.5">
            {stats?.lowStockItems.length === 0 && (
              <p className="text-slate-500 text-sm">Всі запаси в нормі</p>
            )}
            {stats?.lowStockItems.slice(0, 6).map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-slate-300 text-xs truncate">{item.productName}</p>
                  <p className="text-slate-500 text-[10px]">{item.variantArticle} · {item.warehouse === 'warehouse1' ? 'Склад 1' : 'Склад 2'}</p>
                </div>
                <span className={`text-xs font-bold flex-shrink-0 ${item.quantity <= 2 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {item.quantity} шт
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

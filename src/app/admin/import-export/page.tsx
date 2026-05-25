'use client';

import { useState } from 'react';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import { FileDown, FileUp, FileText, Table2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportExportPage() {
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const exportCSV = async (type: 'orders' | 'products' | 'customers') => {
    setExporting(true);
    setSuccess(null);
    try {
      const res = await fetch(`/api/${type}`);
      const data = await res.json();

      let headers: string[] = [];
      let rows: string[][] = [];

      if (type === 'orders') {
        headers = ['Номер', 'Клієнт', 'Телефон', 'Місто', 'Сума', 'Статус', 'Дата', 'ТТН'];
        rows = data.map((o: { orderNumber: string; customer: { name: string; phone: string; city: string }; totalAmount: number; status: string; createdAt: string; ttn?: string }) => [
          o.orderNumber, o.customer.name, o.customer.phone, o.customer.city,
          String(o.totalAmount), o.status,
          new Date(o.createdAt).toLocaleDateString('uk-UA'),
          o.ttn || '',
        ]);
      } else if (type === 'products') {
        headers = ['Назва', 'Категорія', 'Артикул', 'Колір', 'Ціна', 'Статус'];
        rows = data.flatMap((p: { name: string; category: string; isActive: boolean; variants: { article: string; color: string; price: number }[] }) =>
          p.variants.map((v: { article: string; color: string; price: number }) => [
            p.name, p.category, v.article, v.color, String(v.price), p.isActive ? 'Активний' : 'Неактивний',
          ])
        );
      } else {
        headers = ['Ім\'я', 'Телефон', 'Email', 'Місто', 'Замовлень', 'Витрачено'];
        rows = data.map((c: { name: string; phone: string; email: string; city: string; totalOrders: number; totalSpent: number }) => [
          c.name, c.phone, c.email, c.city, String(c.totalOrders), String(c.totalSpent),
        ]);
      }

      const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zipper_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(`${type === 'orders' ? 'Замовлення' : type === 'products' ? 'Товари' : 'Клієнти'} успішно експортовано`);
    } finally {
      setExporting(false);
    }
  };

  const exportInvoices = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/orders?status=paid&limit=100');
      const orders = await res.json();

      const lines = [
        '=== РЕЄСТР РАХУНКІВ ZIPPER ===',
        `Дата: ${new Date().toLocaleDateString('uk-UA')}`,
        '',
        'ОПЛАЧЕНІ ЗАМОВЛЕННЯ (для ФОП):',
        '-'.repeat(60),
        ...orders.map((o: { invoiceNumber?: string; orderNumber: string; customer: { name: string }; totalAmount: number; createdAt: string }) => [
          `Рахунок: ${o.invoiceNumber || 'Не згенеровано'}`,
          `Замовлення: ${o.orderNumber}`,
          `Клієнт: ${o.customer.name}`,
          `Сума: ${o.totalAmount} грн`,
          `Дата: ${new Date(o.createdAt).toLocaleDateString('uk-UA')}`,
          '',
        ].join('\n')),
        '-'.repeat(60),
        `Разом: ${orders.reduce((s: number, o: { totalAmount: number }) => s + o.totalAmount, 0)} грн`,
      ].join('\n');

      const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zipper_invoices_${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess('Реєстр рахунків (ФОП) успішно експортовано');
    } finally {
      setExporting(false);
    }
  };

  const exportCard = (
    icon: React.ElementType,
    title: string,
    description: string,
    action: () => void,
    color: string,
    badge?: string,
  ) => {
    const Icon = icon;
    return (
      <div className={`bg-[#161b27] rounded-xl border border-white/5 p-5 hover:border-white/10 transition-all group`}>
        <div className={`p-3 rounded-lg ${color} w-fit mb-4`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold">{title}</h3>
          {badge && <span className="text-xs bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        <p className="text-slate-400 text-sm mb-4">{description}</p>
        <button
          onClick={action}
          disabled={exporting}
          className="w-full py-2 bg-white/5 hover:bg-indigo-600 disabled:opacity-50 text-slate-300 hover:text-white border border-white/8 hover:border-transparent rounded-lg text-sm font-medium transition-all"
        >
          Експортувати
        </button>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <Breadcrumbs custom={[{ label: 'Адмін', href: '/admin' }, { label: 'Імпорт / Експорт' }]} />
      <PageHeader title="Імпорт / Експорт" subtitle="Управління даними магазину" />

      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm mb-6">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {exportCard(Table2, 'Замовлення CSV', 'Список всіх замовлень: номер, клієнт, сума, статус, ТТН.', () => exportCSV('orders'), 'bg-indigo-500/15 text-indigo-400')}
        {exportCard(Table2, 'Товари CSV', 'Повний каталог товарів з артикулами, цінами та кольорами.', () => exportCSV('products'), 'bg-purple-500/15 text-purple-400')}
        {exportCard(Table2, 'Клієнти CSV', 'База клієнтів: контакти, статистика замовлень.', () => exportCSV('customers'), 'bg-cyan-500/15 text-cyan-400')}
        {exportCard(FileText, 'Реєстр рахунків (ФОП)', 'Текстовий реєстр оплачених замовлень для звітності ФОП.', exportInvoices, 'bg-emerald-500/15 text-emerald-400', 'ФОП')}
      </div>

      {/* Import section */}
      <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-amber-500/15"><FileUp className="w-5 h-5 text-amber-400" /></div>
          <div>
            <h3 className="text-white font-semibold">Імпорт товарів</h3>
            <p className="text-slate-400 text-sm">Завантажте CSV файл для масового імпорту товарів</p>
          </div>
        </div>
        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-indigo-500/30 transition-all cursor-pointer group">
          <FileDown className="w-8 h-8 mx-auto mb-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          <p className="text-slate-400 text-sm mb-2">Перетягніть CSV або натисніть для вибору файлу</p>
          <p className="text-slate-600 text-xs mb-4">Формат: назва, категорія, артикул, колір, ціна</p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Функція імпорту в розробці</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

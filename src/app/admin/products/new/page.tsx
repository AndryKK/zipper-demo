'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import { CATEGORIES, slugify } from '@/lib/utils';
import { Plus, Trash2, Save } from 'lucide-react';

interface Variant {
  color: string;
  colorHex: string;
  article: string;
  price: number;
  comparePrice: number;
  images: string[];
}

const emptyVariant = (): Variant => ({
  color: '', colorHex: '#6366f1', article: '', price: 0, comparePrice: 0, images: [],
});

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: CATEGORIES[0],
    subcategory: '',
    description: '',
    tags: '',
    isActive: true,
    isFeatured: false,
    isTopSale: false,
    topSaleBadge: '',
  });
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: slugify(form.name),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        variants: variants.filter(v => v.color && v.article),
      };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push('/admin/products');
    } finally {
      setSaving(false);
    }
  };

  const updateVariant = (i: number, field: keyof Variant, value: string | number) => {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const inputClass = "w-full px-3 py-2.5 bg-[#0d1117] border border-white/8 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors";

  return (
    <div className="fade-in">
      <Breadcrumbs custom={[
        { label: 'Адмін', href: '/admin' },
        { label: 'Асортимент', href: '/admin/products' },
        { label: 'Новий товар' },
      ]} />
      <PageHeader title="Додати товар" />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
            <h3 className="text-white font-semibold mb-4">Основна інформація</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Назва товару *</label>
                <input required type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="Блискавка спіральна No5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Категорія *</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Підкатегорія</label>
                  <input type="text" value={form.subcategory} onChange={e => setForm(p => ({ ...p, subcategory: e.target.value }))} className={inputClass} placeholder="Спіральні" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Опис</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputClass + ' resize-none'} placeholder="Опис товару..." />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Теги (через кому)</label>
                <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className={inputClass} placeholder="блискавка, спіральна, No5" />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Кольори / Варіанти</h3>
              <button type="button" onClick={() => setVariants(p => [...p, emptyVariant()])} className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="w-4 h-4" /> Додати колір
              </button>
            </div>
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={i} className="p-4 rounded-lg bg-[#0d1117] border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-400 text-xs font-medium">Варіант #{i + 1}</span>
                    {variants.length > 1 && (
                      <button type="button" onClick={() => setVariants(p => p.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 grid grid-cols-[auto_1fr] gap-3 items-end">
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">Колір</label>
                        <input type="color" value={v.colorHex} onChange={e => updateVariant(i, 'colorHex', e.target.value)} className="w-12 h-10 rounded-lg border border-white/8 bg-transparent cursor-pointer p-1" />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">Назва кольору *</label>
                        <input required type="text" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} className={inputClass} placeholder="Чорний" />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Артикул *</label>
                      <input required type="text" value={v.article} onChange={e => updateVariant(i, 'article', e.target.value)} className={inputClass} placeholder="ZS5-BLK-001" />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Ціна (грн) *</label>
                      <input required type="number" min={0} value={v.price} onChange={e => updateVariant(i, 'price', Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Стара ціна (грн)</label>
                      <input type="number" min={0} value={v.comparePrice} onChange={e => updateVariant(i, 'comparePrice', Number(e.target.value))} className={inputClass} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
            <h3 className="text-white font-semibold mb-4">Публікація</h3>
            <div className="space-y-3">
              {[
                { key: 'isActive', label: 'Активний' },
                { key: 'isFeatured', label: 'Рекомендований' },
                { key: 'isTopSale', label: 'Топ продажів' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300 text-sm">{label}</span>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                    className={`w-10 h-5 rounded-full transition-all relative ${form[key as keyof typeof form] ? 'bg-indigo-600' : 'bg-slate-600'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form[key as keyof typeof form] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </label>
              ))}
              {form.isTopSale && (
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Плашка</label>
                  <input type="text" value={form.topSaleBadge} onChange={e => setForm(p => ({ ...p, topSaleBadge: e.target.value }))} className={inputClass} placeholder="Хіт продажів" />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Збереження...' : 'Зберегти товар'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import { CATEGORIES, slugify } from '@/lib/utils';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';

interface Variant {
  _id?: string;
  color: string;
  colorHex: string;
  article: string;
  price: number;
  comparePrice: number;
  images: string[];
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', category: CATEGORIES[0], subcategory: '', description: '',
    tags: '', isActive: true, isFeatured: false, isTopSale: false, topSaleBadge: '',
  });
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          name: data.name, category: data.category, subcategory: data.subcategory || '',
          description: data.description || '', tags: (data.tags || []).join(', '),
          isActive: data.isActive, isFeatured: data.isFeatured, isTopSale: data.isTopSale,
          topSaleBadge: data.topSaleBadge || '',
        });
        setVariants(data.variants.map((v: Variant) => ({ ...v, comparePrice: v.comparePrice || 0 })));
        setLoading(false);
      });
  }, [id]);

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
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push('/admin/products');
    } finally {
      setSaving(false);
    }
  };

  const addVariant = () => setVariants(p => [...p, { color: '', colorHex: '#6366f1', article: '', price: 0, comparePrice: 0, images: [] }]);

  const updateVariant = (i: number, field: keyof Variant, value: string | number) => {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const inputClass = "w-full px-3 py-2.5 bg-[#0d1117] border border-white/8 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors";

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-slate-400">
      <RefreshCw className="w-4 h-4 animate-spin mr-2" />Завантаження...
    </div>
  );

  return (
    <div className="fade-in">
      <Breadcrumbs custom={[
        { label: 'Адмін', href: '/admin' },
        { label: 'Асортимент', href: '/admin/products' },
        { label: 'Редагування' },
      ]} />
      <PageHeader title="Редагування товару" />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
            <h3 className="text-white font-semibold mb-4">Основна інформація</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Назва товару *</label>
                <input required type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Категорія</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Підкатегорія</label>
                  <input type="text" value={form.subcategory} onChange={e => setForm(p => ({ ...p, subcategory: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Опис</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputClass + ' resize-none'} />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Теги</label>
                <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-[#161b27] rounded-xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Кольори / Варіанти</h3>
              <button type="button" onClick={addVariant} className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="w-4 h-4" /> Додати колір
              </button>
            </div>
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={i} className="p-4 rounded-lg bg-[#0d1117] border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border border-white/10" style={{ background: v.colorHex }} />
                      <span className="text-slate-300 text-sm font-medium">{v.color || `Варіант #${i + 1}`}</span>
                    </div>
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
                        <label className="text-slate-400 text-xs mb-1 block">Назва кольору</label>
                        <input type="text" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Артикул</label>
                      <input type="text" value={v.article} onChange={e => updateVariant(i, 'article', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Ціна</label>
                      <input type="number" min={0} value={v.price} onChange={e => updateVariant(i, 'price', Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Стара ціна</label>
                      <input type="number" min={0} value={v.comparePrice} onChange={e => updateVariant(i, 'comparePrice', Number(e.target.value))} className={inputClass} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
                  <input type="text" value={form.topSaleBadge} onChange={e => setForm(p => ({ ...p, topSaleBadge: e.target.value }))} className={inputClass} />
                </div>
              )}
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors">
            <Save className="w-4 h-4" />
            {saving ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>
      </form>
    </div>
  );
}

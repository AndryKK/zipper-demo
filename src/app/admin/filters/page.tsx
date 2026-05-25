'use client';

import { useState } from 'react';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import { CATEGORIES } from '@/lib/utils';
import { Plus, Trash2, Save, SlidersHorizontal } from 'lucide-react';

const DEFAULT_FILTERS = [
  { id: '1', name: 'Категорія', type: 'select', options: CATEGORIES, isActive: true },
  { id: '2', name: 'Ціновий діапазон', type: 'range', options: ['0-50', '50-100', '100-500', '500+'], isActive: true },
  { id: '3', name: 'Наявність', type: 'checkbox', options: ['В наявності', 'Під замовлення'], isActive: true },
  { id: '4', name: 'Колір', type: 'color', options: ['Чорний', 'Білий', 'Синій', 'Червоний', 'Зелений', 'Жовтий'], isActive: true },
  { id: '5', name: 'Тип застібки', type: 'checkbox', options: ['Спіральна', 'Металева', 'Пластикова', 'Рулонна'], isActive: false },
];

export default function FiltersPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [saved, setSaved] = useState(false);

  const toggleFilter = (id: string) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
  };

  const deleteFilter = (id: string) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in">
      <Breadcrumbs custom={[{ label: 'Адмін', href: '/admin' }, { label: 'Фільтри' }]} />
      <PageHeader
        title="Фільтри каталогу"
        subtitle="Управління фільтрами магазину"
        actions={
          <button
            onClick={save}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Збережено!' : 'Зберегти'}
          </button>
        }
      />

      <div className="space-y-3">
        {filters.map(filter => (
          <div key={filter.id} className={`bg-[#161b27] rounded-xl border p-4 transition-all ${filter.isActive ? 'border-white/5' : 'border-white/3 opacity-60'}`}>
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 flex-shrink-0">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-medium">{filter.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{filter.type}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filter.options.map(opt => (
                    <span key={opt} className="text-xs px-2.5 py-1 bg-white/5 rounded-full text-slate-300">{opt}</span>
                  ))}
                  <button className="text-xs px-2.5 py-1 border border-dashed border-white/10 rounded-full text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all flex items-center gap-1">
                    <Plus className="w-2.5 h-2.5" />Додати
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleFilter(filter.id)}
                  className={`w-10 h-5 rounded-full transition-all relative ${filter.isActive ? 'bg-indigo-600' : 'bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${filter.isActive ? 'left-5' : 'left-0.5'}`} />
                </button>
                <button onClick={() => deleteFilter(filter.id)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all">
        <Plus className="w-4 h-4" />
        Додати фільтр
      </button>
    </div>
  );
}

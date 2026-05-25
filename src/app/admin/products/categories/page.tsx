'use client';

import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import { CATEGORIES } from '@/lib/utils';
import { Tag, Package, RefreshCw } from 'lucide-react';

interface CategoryStats {
  category: string;
  count: number;
}

export default function CategoriesPage() {
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((products: { category: string }[]) => {
        const map: Record<string, number> = {};
        products.forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
        const result = CATEGORIES.map(c => ({ category: c, count: map[c] || 0 }));
        setStats(result);
        setLoading(false);
      });
  }, []);

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
        { label: 'Категорії' },
      ]} />
      <PageHeader title="Категорії товарів" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.category} className="bg-[#161b27] rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 w-fit mb-3">
              <Tag className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-white font-medium text-sm mb-1">{s.category}</h3>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Package className="w-3 h-3" />
              <span>{s.count} товарів</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

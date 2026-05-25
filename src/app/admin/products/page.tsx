'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import PageHeader from '@/components/admin/PageHeader';
import { Badge } from '@/components/admin/Badge';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/lib/utils';
import {
  Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight,
  Package, Palette, Tag, RefreshCw,
} from 'lucide-react';

interface Variant {
  _id: string;
  color: string;
  colorHex: string;
  article: string;
  price: number;
  comparePrice?: number;
  images: string[];
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  variants: Variant[];
  isActive: boolean;
  isFeatured: boolean;
  isTopSale: boolean;
  topSaleBadge?: string;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search, category]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Видалити товар?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  const toggleActive = async (product: Product) => {
    const res = await fetch(`/api/products/${product._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    const updated = await res.json();
    setProducts(prev => prev.map(p => p._id === updated._id ? updated : p));
  };

  return (
    <div className="fade-in">
      <Breadcrumbs custom={[{ label: 'Адмін', href: '/admin' }, { label: 'Асортимент' }]} />
      <PageHeader
        title="Асортимент товарів"
        subtitle={`${products.length} товарів`}
        actions={
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Додати товар
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Пошук товарів..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#161b27] border border-white/8 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-4 py-2.5 bg-[#161b27] border border-white/8 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
        >
          <option value="">Всі категорії</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={fetchProducts}
          className="px-3 py-2.5 bg-[#161b27] border border-white/8 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />Завантаження...
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => {
            const isExp = expanded.includes(product._id);
            const minPrice = Math.min(...product.variants.map(v => v.price));
            const maxPrice = Math.max(...product.variants.map(v => v.price));

            return (
              <div key={product._id} className="bg-[#161b27] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-all">
                {/* Main row */}
                <div className="flex items-center gap-4 p-4">
                  <button
                    onClick={() => toggleExpand(product._id)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {isExp ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {/* Color dots */}
                  <div className="flex -space-x-1">
                    {product.variants.slice(0, 4).map(v => (
                      <div
                        key={v._id}
                        className="w-5 h-5 rounded-full border-2 border-[#161b27]"
                        style={{ background: v.colorHex }}
                        title={v.color}
                      />
                    ))}
                    {product.variants.length > 4 && (
                      <div className="w-5 h-5 rounded-full bg-slate-700 border-2 border-[#161b27] flex items-center justify-center text-[8px] text-slate-400">
                        +{product.variants.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-200 font-medium">{product.name}</span>
                      {product.isTopSale && product.topSaleBadge && (
                        <Badge variant="warning">{product.topSaleBadge}</Badge>
                      )}
                      {product.isFeatured && <Badge variant="info">Рекомендований</Badge>}
                      {!product.isActive && <Badge variant="danger">Неактивний</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{product.category}</span>
                      <span className="flex items-center gap-1"><Palette className="w-3 h-3" />{product.variants.length} кол.</span>
                      <span className="flex items-center gap-1"><Package className="w-3 h-3" />{product.variants[0]?.article}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-semibold">
                      {minPrice === maxPrice ? formatCurrency(minPrice) : `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`}
                    </p>
                    <p className="text-slate-500 text-xs">{product.variants.length} варіантів</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`w-8 h-4 rounded-full transition-all relative ${product.isActive ? 'bg-indigo-600' : 'bg-slate-600'}`}
                    >
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${product.isActive ? 'left-4' : 'left-0.5'}`} />
                    </button>
                    <Link
                      href={`/admin/products/${product._id}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded variants */}
                {isExp && (
                  <div className="border-t border-white/5 p-4 bg-[#0d1117]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Кольори / Варіанти</h4>
                      <Link
                        href={`/admin/products/${product._id}?addVariant=1`}
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Додати колір
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {product.variants.map(v => (
                        <div key={v._id} className="flex items-center gap-3 p-3 rounded-lg bg-[#161b27] border border-white/5">
                          <div className="w-8 h-8 rounded-lg border border-white/10 flex-shrink-0" style={{ background: v.colorHex }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm font-medium">{v.color}</p>
                            <p className="text-slate-500 text-xs">{v.article}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-white text-sm font-semibold">{formatCurrency(v.price)}</p>
                            {v.comparePrice && (
                              <p className="text-slate-500 text-xs line-through">{formatCurrency(v.comparePrice)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {products.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Товарів не знайдено</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

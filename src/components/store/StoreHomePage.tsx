'use client';

import { useEffect, useState, Suspense } from 'react';
import { useCart } from '@/lib/CartContext';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/lib/utils';
import { ShoppingCart, Tag, Zap, Star, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

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
  category: string;
  description: string;
  variants: Variant[];
  isActive: boolean;
  isTopSale: boolean;
  isFeatured: boolean;
  topSaleBadge?: string;
}

function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [added, setAdded] = useState(false);

  const variant = product.variants[selectedVariant];
  if (!variant) return null;

  const handleAdd = () => {
    add({
      productId: product._id,
      productName: product.name,
      variantArticle: variant.article,
      variantColor: variant.color,
      colorHex: variant.colorHex,
      image: variant.images[0] || '',
      price: variant.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = variant.comparePrice
    ? Math.round((1 - variant.price / variant.comparePrice) * 100)
    : 0;

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      style={{ background: '#fff', border: '1px solid #e8e4e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden" style={{ background: '#f5f0eb' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-20 h-20 rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${variant.colorHex}30, ${variant.colorHex}60)`, border: `2px solid ${variant.colorHex}40` }}
          >
            <div className="w-full h-full rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 opacity-50" style={{ color: variant.colorHex }} />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isTopSale && product.topSaleBadge && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#f59e0b' }}>
              {product.topSaleBadge}
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#ef4444' }}>
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1" style={{ background: '#6366f1' }}>
              <Star className="w-2.5 h-2.5" />Топ
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all p-2.5 rounded-xl shadow-lg"
          style={{ background: added ? '#10b981' : '#1a1a2e', color: 'white' }}
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex gap-1.5 mb-3">
          {product.variants.map((v, i) => (
            <button
              key={v._id}
              onClick={() => setSelectedVariant(i)}
              className="w-5 h-5 rounded-full transition-all"
              style={{
                background: v.colorHex,
                border: selectedVariant === i ? `2px solid ${v.colorHex}` : '2px solid transparent',
                outline: selectedVariant === i ? '2px solid #e8e4e0' : 'none',
                outlineOffset: '1px',
              }}
              title={v.color}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          <Tag className="w-3 h-3" style={{ color: '#94a3b8' }} />
          <span className="text-xs" style={{ color: '#94a3b8' }}>{product.category}</span>
        </div>

        <h3 className="font-semibold text-sm mb-1 leading-snug" style={{ color: '#1a1a2e' }}>{product.name}</h3>
        <p className="text-xs mb-3 line-clamp-2" style={{ color: '#94a3b8' }}>
          {product.description || `Артикул: ${variant.article}`}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-base" style={{ color: '#1a1a2e' }}>{formatCurrency(variant.price)}</span>
            {variant.comparePrice && (
              <span className="text-xs line-through ml-1.5" style={{ color: '#94a3b8' }}>{formatCurrency(variant.comparePrice)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: added ? '#10b981' : '#1a1a2e', color: 'white' }}
          >
            {added ? 'Додано!' : 'До кошика'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoreHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('active', 'true');
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); });
  }, [category, search]);

  const filtered = priceRange
    ? products.filter(p => {
        const price = Math.min(...p.variants.map(v => v.price));
        if (priceRange === '0-50') return price <= 50;
        if (priceRange === '50-100') return price > 50 && price <= 100;
        if (priceRange === '100-500') return price > 100 && price <= 500;
        if (priceRange === '500+') return price > 500;
        return true;
      })
    : products;

  return (
    <div style={{ background: '#fafaf8' }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-16 px-4" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-4" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
            <Zap className="w-3.5 h-3.5" />
            Якісна фурнітура для шиття
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Zipper — Ваш надійний постачальник</h1>
          <p className="text-lg mb-8" style={{ color: '#94a3b8' }}>Блискавки, тасьма, кнопки, пряжки та багато іншого</p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Знайти товар..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
            />
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: '#6366f1' }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: '#8b5cf6' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <div className="flex items-center gap-2 mr-1">
            <SlidersHorizontal className="w-4 h-4" style={{ color: '#94a3b8' }} />
            <span className="text-sm font-medium" style={{ color: '#64748b' }}>Фільтри:</span>
          </div>
          <button
            onClick={() => setCategory('')}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={category === '' ? { background: '#1a1a2e', color: 'white' } : { background: '#f5f0eb', color: '#64748b', border: '1px solid #e8e4e0' }}
          >
            Всі
          </button>
          {CATEGORIES.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={category === cat ? { background: '#1a1a2e', color: 'white' } : { background: '#f5f0eb', color: '#64748b', border: '1px solid #e8e4e0' }}
            >
              {cat}
            </button>
          ))}
          <select
            value={priceRange}
            onChange={e => setPriceRange(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm focus:outline-none"
            style={{ background: '#f5f0eb', color: '#64748b', border: '1px solid #e8e4e0' }}
          >
            <option value="">Будь-яка ціна</option>
            <option value="0-50">До 50 грн</option>
            <option value="50-100">50–100 грн</option>
            <option value="100-500">100–500 грн</option>
            <option value="500+">500+ грн</option>
          </select>
        </div>

        <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>
          {loading ? 'Завантаження...' : `${filtered.length} товарів`}
          {category && ` у категорії «${category}»`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-40" style={{ color: '#94a3b8' }}>
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />Завантаження...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-4 text-center py-20" style={{ color: '#94a3b8' }}>
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Товарів не знайдено</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

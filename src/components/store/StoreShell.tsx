'use client';

import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { ShoppingCart, Zap, Search } from 'lucide-react';
import { useState } from 'react';
import CartDrawer from './CartDrawer';

export default function StoreShell({ children }: { children: React.ReactNode }) {
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fafaf8', color: '#1a1a2e' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(250,250,248,0.95)', backdropFilter: 'blur(12px)', borderColor: '#e8e4e0' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ color: '#1a1a2e' }}>Zipper</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-4">
            {['Застібки-блискавки', 'Фурнітура', 'Аксесуари', 'Нитки'].map(cat => (
              <Link key={cat} href={`/?category=${encodeURIComponent(cat)}`} className="text-sm font-medium transition-colors" style={{ color: '#64748b' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6366f1')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
              >
                {cat}
              </Link>
            ))}
          </nav>

          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Пошук товарів..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                style={{ background: '#f1ede9', border: '1px solid #e8e4e0', color: '#1a1a2e' }}
              />
            </div>
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="relative ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all"
            style={{ background: '#1a1a2e', color: 'white' }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Кошик</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer with mode toggle */}
      <footer className="border-t py-8" style={{ borderColor: '#e8e4e0', background: '#f5f0eb' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <span className="font-bold" style={{ color: '#1a1a2e' }}>Zipper</span>
              <span className="text-sm" style={{ color: '#94a3b8' }}>© 2026 Всі права захищені</span>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ borderColor: '#e8e4e0', background: '#fff' }}>
              <span className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white">
                Клієнт
              </span>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ color: '#64748b' }}
              >
                Адмін
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  TrendingUp,
  FileDown,
  SlidersHorizontal,
  Zap,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Дашборд', href: '/admin', icon: LayoutDashboard },
  {
    label: 'Асортимент',
    icon: Package,
    children: [
      { label: 'Всі товари', href: '/admin/products' },
      { label: 'Категорії', href: '/admin/products/categories' },
      { label: 'Додати товар', href: '/admin/products/new' },
    ],
  },
  {
    label: 'Облік товарів',
    icon: Boxes,
    children: [
      { label: 'Склад 1', href: '/admin/inventory?warehouse=warehouse1' },
      { label: 'Склад 2', href: '/admin/inventory?warehouse=warehouse2' },
      { label: 'Всі залишки', href: '/admin/inventory' },
    ],
  },
  {
    label: 'Замовлення',
    icon: ShoppingCart,
    children: [
      { label: 'Всі замовлення', href: '/admin/orders' },
      { label: 'Нові', href: '/admin/orders?status=new' },
      { label: 'В обробці', href: '/admin/orders?status=processing' },
      { label: 'Відправлені', href: '/admin/orders?status=shipped' },
    ],
  },
  { label: 'Клієнти', href: '/admin/customers', icon: Users },
  { label: 'Топ продажів', href: '/admin/top-sales', icon: TrendingUp },
  { label: 'Фільтри', href: '/admin/filters', icon: SlidersHorizontal },
  { label: 'Імпорт / Експорт', href: '/admin/import-export', icon: FileDown },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(['Асортимент', 'Замовлення']);

  const toggle = (label: string) => {
    setExpanded(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#0d1117] border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg animated-gradient flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">Zipper</span>
            <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const hasChildren = !!item.children;
            const isOpen = expanded.includes(item.label);
            const active = item.href ? isActive(item.href) : item.children?.some(c => isActive(c.href));

            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggle(item.label)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        active
                          ? 'text-white bg-white/8'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-indigo-400')} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                    {isOpen && (
                      <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-white/5 pl-3">
                        {item.children!.map(child => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                'block px-3 py-2 rounded-lg text-sm transition-all',
                                isActive(child.href)
                                  ? 'text-indigo-400 bg-indigo-500/10 font-medium'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive(item.href!)
                        ? 'text-white bg-indigo-500/15 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0', isActive(item.href!) && 'text-indigo-400')} />
                    <span>{item.label}</span>
                    {isActive(item.href!) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 text-xs transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Перейти до магазину</span>
        </Link>
      </div>
    </aside>
  );
}

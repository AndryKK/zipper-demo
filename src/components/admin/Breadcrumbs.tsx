'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  admin: 'Адмін',
  dashboard: 'Дашборд',
  products: 'Асортимент',
  categories: 'Категорії',
  new: 'Новий товар',
  inventory: 'Облік товарів',
  orders: 'Замовлення',
  customers: 'Клієнти',
  'top-sales': 'Топ продажів',
  filters: 'Фільтри',
  'import-export': 'Імпорт / Експорт',
};

interface BreadcrumbsProps {
  custom?: { label: string; href?: string }[];
}

export default function Breadcrumbs({ custom }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = custom || segments.map((seg, i) => ({
    label: routeLabels[seg] || decodeURIComponent(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6 flex-wrap">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-slate-300 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
          {i === crumbs.length - 1 || !crumb.href ? (
            <span className="text-slate-300 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-slate-300 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

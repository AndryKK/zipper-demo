'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  color?: 'indigo' | 'purple' | 'cyan' | 'emerald' | 'rose' | 'amber';
  className?: string;
}

const colorMap = {
  indigo: { bg: 'bg-indigo-500/15', icon: 'text-indigo-400', border: 'border-indigo-500/20' },
  purple: { bg: 'bg-purple-500/15', icon: 'text-purple-400', border: 'border-purple-500/20' },
  cyan: { bg: 'bg-cyan-500/15', icon: 'text-cyan-400', border: 'border-cyan-500/20' },
  emerald: { bg: 'bg-emerald-500/15', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
  rose: { bg: 'bg-rose-500/15', icon: 'text-rose-400', border: 'border-rose-500/20' },
  amber: { bg: 'bg-amber-500/15', icon: 'text-amber-400', border: 'border-amber-500/20' },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
  className,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-5 border transition-all hover:scale-[1.01]',
        'bg-[#161b27] border-white/5 hover:border-white/10',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-white tracking-tight truncate">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend >= 0 ? 'text-emerald-400' : 'text-rose-400'
            )}>
              {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(trend)}% vs минулий місяць</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg flex-shrink-0', colors.bg)}>
          <Icon className={cn('w-5 h-5', colors.icon)} />
        </div>
      </div>
      {/* Subtle gradient overlay */}
      <div className={cn('absolute inset-0 opacity-5 pointer-events-none rounded-xl', colors.bg)} />
    </div>
  );
}

import { cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';

interface BadgeProps {
  children?: React.ReactNode;
  status?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantMap = {
  default: 'bg-slate-700/60 text-slate-300',
  success: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-rose-500/15 text-rose-400',
  info: 'bg-indigo-500/15 text-indigo-400',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantMap[variant],
      className
    )}>
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      ORDER_STATUS_COLORS[status] || 'bg-slate-700/60 text-slate-300'
    )}>
      {ORDER_STATUS_LABELS[status] || status}
    </span>
  );
}

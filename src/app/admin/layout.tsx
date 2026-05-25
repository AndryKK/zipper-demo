import Sidebar from '@/components/admin/Sidebar';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Sidebar />
      <main className="ml-[260px] min-h-screen flex flex-col">
        <div className="flex-1 max-w-7xl w-full mx-auto p-6">
          {children}
        </div>
        {/* Footer mode toggle */}
        <footer className="ml-0 border-t border-white/5 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Zipper Admin Panel</span>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/3 border border-white/5">
              <Link
                href="/"
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Клієнт
              </Link>
              <span className="px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white">
                Адмін
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

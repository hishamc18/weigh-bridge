'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Scale, LayoutDashboard, LogOut } from 'lucide-react';

export default function Header() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out');
    router.push('/login');
  }

  return (
    <header className="border-b border-black px-6 py-4 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        <Scale size={50} strokeWidth={1.5} />
        <span className="hidden md:block text-lg font-bold tracking-widest uppercase">Weigh Bridge</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors tracking-widest uppercase"
        >
          <LayoutDashboard size={14} />
          Dashboard
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors tracking-widest uppercase"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, LogOut, Home } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar, { Tab } from '@/components/dashboard/Sidebar';
import ShopsTab from '@/components/dashboard/ShopsTab';
import HistoryTab from '@/components/dashboard/HistoryTab';
import SettingsTab from '@/components/dashboard/SettingsTab';

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('history');
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out');
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-black px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Scale size={50} strokeWidth={1.5} />
        <span className="hidden md:block text-lg font-bold tracking-widest uppercase">Weigh Bridge</span>
      </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/home')}
            className="flex cursor-pointer items-center gap-2 text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors tracking-widest uppercase"
          >
            <Home size={14} />
            Home
          </button>
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2 text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors tracking-widest uppercase"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col lg:flex-row flex-1 border-b border-black">
        <Sidebar active={tab} onChange={setTab} />
        <main className="flex-1 overflow-y-auto">
          {tab === 'history' && <HistoryTab />}
          {tab === 'shops' && <ShopsTab />}
          {tab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}
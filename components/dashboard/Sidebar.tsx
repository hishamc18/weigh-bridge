'use client';

import { Store, History, Settings } from 'lucide-react';

export type Tab = 'shops' | 'history' | 'settings';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'shops', label: 'Shops', Icon: Store },
  { id: 'history', label: 'History', Icon: History },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="w-full lg:w-48 border-r-0 lg:border-r border-b lg:border-b-0 border-black flex lg:flex-col flex-row">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-3 px-5 py-4 text-xs font-bold tracking-widest uppercase transition-colors border-r lg:border-r-0 lg:border-b border-black last:border-0
            ${active === id ? 'bg-black text-white' : 'hover:bg-neutral-100'}`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </aside>
  );
}
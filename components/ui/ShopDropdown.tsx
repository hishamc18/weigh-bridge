'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ShopOption {
  _id: string;
  title: string;
  location: string;
  weight: number;
}

interface ShopDropdownProps {
  value: string;
  onChange: (shop: ShopOption) => void;
  shops: ShopOption[];
}

export default function ShopDropdown({ value, onChange, shops }: ShopDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = shops.find((s) => s._id === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-black px-3 py-2 text-sm bg-white hover:bg-neutral-50 transition-colors"
      >
        <span className="truncate">
          {selected ? `${selected.title} — ${selected.location}` : 'Select shop'}
        </span>
        <ChevronDown size={14} className={`ml-2 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && shops.length > 0 && (
        <div className="absolute z-50 w-full border border-black bg-white shadow-lg max-h-56 overflow-y-auto">
          {shops.map((shop) => (
            <button
              key={shop._id}
              type="button"
              onClick={() => { onChange(shop); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-black hover:text-white transition-colors border-b border-neutral-200 last:border-0 ${
                value === shop._id ? 'bg-black text-white' : ''
              }`}
            >
              <div className="font-bold">{shop.title}</div>
              <div className="text-neutral-400 mt-0.5">{shop.location} · {shop.weight}T</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
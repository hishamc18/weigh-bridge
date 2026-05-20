'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { exportBill } from '@/lib/exportBill';
import { IBill } from '@/types';
import { ShopOption } from '@/components/ui/ShopDropdown';

interface Props {
  bill: IBill | null;
  shop: ShopOption | null;
  onClose: () => void;
}

export default function ExportModal({ bill, shop, onClose }: Props) {
  const [exporting, setExporting] = useState(false);

  if (!bill) return null;

  async function handleExport(type: 'pdf' | 'image') {
    if (!bill) return;
    setExporting(true);
    try {
      await exportBill(bill, shop, type);
      toast.success(type === 'pdf' ? 'Exported as PDF' : 'Exported as image');
      onClose();
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white border border-black w-full max-w-xs">
        <div className="border-b border-black px-5 py-4">
          <h3 className="text-[11px] lg:text-xs font-bold tracking-widest uppercase">
            Export Bill #{bill.billNo}
          </h3>
        </div>
        <div className="px-5 py-5 space-y-3">
          <p className="text-xs lg:text-[13px] text-neutral-500">Choose export format:</p>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="w-full bg-black text-white cursor-pointer text-[11px] lg:text-xs font-bold tracking-widest uppercase py-3 hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            Export as PDF
          </button>
          <button
            onClick={() => handleExport('image')}
            disabled={exporting}
            className="w-full border border-black cursor-pointer text-[11px] lg:text-xs font-bold tracking-widest uppercase py-3 hover:bg-black hover:text-white transition-colors disabled:opacity-40"
          >
            Export as Image
          </button>
          <button
            onClick={onClose}
            disabled={exporting}
            className="w-full text-[11px] cursor-pointer lg:text-xs font-bold tracking-widest uppercase py-2 text-neutral-400 hover:text-black transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { nowDateTimeLocal } from '@/lib/utils';
import ShopDropdown, { ShopOption } from '@/components/ui/ShopDropdown';
import BillPreview from '@/components/bill/BillPreview';
import { IBill } from '@/types';

interface Props {
  shops: ShopOption[];
  onBillCreated?: (bill: IBill) => void;
}

function initForm(shops: ShopOption[]) {
  const now = nowDateTimeLocal();
  return {
    shopId: shops[0]?._id ?? '',
    vehicleNo: '',
    printDate: now,
    material: 'SCRAP',
    grossWeight: '',
    grossTime: now,
    tareWeight: '',
    tareTime: now,
    weighmentCharges: '0',
  };
}

export default function BillForm({ shops, onBillCreated }: Props) {
  const [form, setForm] = useState(() => initForm(shops));
  const [selectedShop, setSelectedShop] = useState<ShopOption | null>(shops[0] ?? null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  // Keep shop in sync
  useEffect(() => {
    if (shops.length && !form.shopId) {
      setForm((f) => ({ ...f, shopId: shops[0]._id }));
      setSelectedShop(shops[0]);
    }
  }, [shops]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const gross = Number(form.grossWeight) || 0;
  const tare = Number(form.tareWeight) || 0;
  const net = gross - tare;

  async function handleSubmit() {
    if (submittingRef.current) return;
    if (!form.shopId) return toast.error('Please select a shop');
    if (!form.vehicleNo.trim()) return toast.error('Vehicle number is required');
    if (!form.grossWeight) return toast.error('Gross weight is required');
    if (!form.tareWeight) return toast.error('Tare weight is required');
    if (tare > gross) return toast.error('Tare weight cannot exceed gross weight');

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: form.shopId,
          vehicleNo: form.vehicleNo.toUpperCase(),
          printDate: form.printDate,
          material: form.material,
          grossWeight: gross,
          grossTime: form.grossTime,
          tareWeight: tare,
          tareTime: form.tareTime,
          weighmentCharges: Number(form.weighmentCharges) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Bill #${data.data.billNo} created`);
        onBillCreated?.(data.data);
        setForm(initForm(shops));
        setSelectedShop(shops[0] ?? null);
        return data.data;
      } else {
        toast.error(data.error ?? 'Failed to create bill');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  async function handleExport(type: 'pdf' | 'image') {
    // First submit, then export
    const billData = await handleSubmitAndReturn();
    if (!billData) return;

    const { default: html2canvas } = await import('html2canvas');

    // Render BillPreview temporarily for capture
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1';
    document.body.appendChild(container);

    const { createRoot } = await import('react-dom/client');
    const { default: BillPreviewComp } = await import('@/components/bill/BillPreview');
    const root = createRoot(container);

    await new Promise<void>((resolve) => {
      root.render(
        <BillPreviewComp bill={{ ...billData, shop: selectedShop }} />
      );
      setTimeout(resolve, 300);
    });

    const canvas = await html2canvas(container.firstChild as HTMLElement, { scale: 2, backgroundColor: '#fff' });
    root.unmount();
    document.body.removeChild(container);

    if (type === 'image') {
      const link = document.createElement('a');
      link.download = `bill-${billData.billNo}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Bill exported as image');
    } else {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`bill-${billData.billNo}.pdf`);
      toast.success('Bill exported as PDF');
    }
  }

  async function handleSubmitAndReturn(): Promise<IBill | null> {
    if (submittingRef.current) return null;
    if (!form.shopId) { toast.error('Please select a shop'); return null; }
    if (!form.vehicleNo.trim()) { toast.error('Vehicle number is required'); return null; }
    if (!form.grossWeight) { toast.error('Gross weight is required'); return null; }
    if (!form.tareWeight) { toast.error('Tare weight is required'); return null; }
    if (tare > gross) { toast.error('Tare weight cannot exceed gross weight'); return null; }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: form.shopId,
          vehicleNo: form.vehicleNo.toUpperCase(),
          printDate: form.printDate,
          material: form.material,
          grossWeight: gross,
          grossTime: form.grossTime,
          tareWeight: tare,
          tareTime: form.tareTime,
          weighmentCharges: Number(form.weighmentCharges) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Bill #${data.data.billNo} created`);
        onBillCreated?.(data.data);
        setForm(initForm(shops));
        setSelectedShop(shops[0] ?? null);
        return data.data;
      } else {
        toast.error(data.error ?? 'Failed to create bill');
        return null;
      }
    } catch {
      toast.error('Network error');
      return null;
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  // Live preview data
  const previewBill = {
    billNo: 'AUTO',
    shop: selectedShop,
    vehicleNo: form.vehicleNo,
    printDate: form.printDate,
    material: form.material,
    grossWeight: gross,
    grossTime: form.grossTime,
    tareWeight: tare,
    tareTime: form.tareTime,
    netWeight: net,
    weighmentCharges: Number(form.weighmentCharges),
    operatorSign: 'ADMIN',
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Form */}
      <div className="flex-1 border border-black">
        <div className="border-b border-black px-5 py-3">
          <h2 className="text-xs font-bold tracking-widest uppercase">New Bill</h2>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Shop */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">Shop</label>
            <ShopDropdown
              value={form.shopId}
              shops={shops}
              onChange={(shop) => {
                setSelectedShop(shop);
                set('shopId', shop._id);
              }}
            />
          </div>

          {/* Vehicle No */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">Vehicle No.</label>
            <input
              type="text"
              value={form.vehicleNo}
              onChange={(e) => set('vehicleNo', e.target.value.toUpperCase())}
              placeholder="KA53AA7273"
              className="w-full border border-black px-3 py-2 text-sm font-mono uppercase"
            />
          </div>

          {/* Print Date */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">Print Date</label>
            <input
              type="datetime-local"
              value={form.printDate}
              onChange={(e) => set('printDate', e.target.value)}
              className="w-full border border-black px-3 py-2 text-sm font-mono"
            />
          </div>

          {/* Material */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">Material</label>
            <input
              type="text"
              value={form.material}
              onChange={(e) => set('material', e.target.value.toUpperCase())}
              className="w-full border border-black px-3 py-2 text-sm font-mono uppercase"
            />
          </div>

          <div className="dotted-line" />

          {/* Gross Weight + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-1">
                Gross Weight (KG)
              </label>
              <input
                type="number"
                min={0}
                value={form.grossWeight}
                onChange={(e) => set('grossWeight', e.target.value)}
                placeholder="16550"
                className="w-full border border-black px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-1">
                Gross Time
              </label>
              <input
                type="datetime-local"
                value={form.grossTime}
                onChange={(e) => set('grossTime', e.target.value)}
                className="w-full border border-black px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          {/* Tare Weight + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-1">
                Tare Weight (KG)
              </label>
              <input
                type="number"
                min={0}
                value={form.tareWeight}
                onChange={(e) => set('tareWeight', e.target.value)}
                placeholder="05090"
                className="w-full border border-black px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-1">
                Tare Time
              </label>
              <input
                type="datetime-local"
                value={form.tareTime}
                onChange={(e) => set('tareTime', e.target.value)}
                className="w-full border border-black px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          {/* Net Weight (read-only) */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">
              Net Weight (KG)
            </label>
            <div className="border border-black px-3 py-2 text-sm font-mono bg-neutral-50">
              {net >= 0 ? net : 0} KG
            </div>
          </div>

          <div className="dotted-line" />

          {/* Weighment Charges */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">
              Weighment Charges
            </label>
            <input
              type="number"
              min={0}
              value={form.weighmentCharges}
              onChange={(e) => set('weighmentCharges', e.target.value)}
              className="w-full border border-black px-3 py-2 text-sm font-mono"
            />
          </div>

          {/* Operator */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">
              Operator Sign
            </label>
            <div className="border border-black px-3 py-2 text-sm font-mono bg-neutral-50 text-neutral-500">
              ADMIN
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-black text-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-neutral-800 transition-colors disabled:opacity-40"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>

            <div className="relative group">
              <button
                disabled={submitting}
                className="border border-black text-xs font-bold tracking-widest uppercase px-4 py-3 hover:bg-black hover:text-white transition-colors disabled:opacity-40"
              >
                Export ▾
              </button>
              <div className="hidden group-hover:flex absolute right-0 bottom-full mb-1 flex-col border border-black bg-white shadow-lg z-20 min-w-[120px]">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={submitting}
                  className="text-xs text-left px-4 py-2 hover:bg-black hover:text-white tracking-widest uppercase disabled:opacity-40"
                >
                  PDF
                </button>
                <button
                  onClick={() => handleExport('image')}
                  disabled={submitting}
                  className="text-xs text-left px-4 py-2 hover:bg-black hover:text-white tracking-widest uppercase border-t border-neutral-200 disabled:opacity-40"
                >
                  Image
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="lg:w-auto">
        <div className="border border-black mb-3 px-4 py-2">
          <span className="text-xs font-bold tracking-widest uppercase text-neutral-500">Live Preview</span>
        </div>
        <BillPreview bill={previewBill} />
      </div>
    </div>
  );
}
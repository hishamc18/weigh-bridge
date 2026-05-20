'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { nowDateTimeLocal } from '@/lib/utils';
import ShopDropdown, { ShopOption } from '@/components/ui/ShopDropdown';
import BillPreview from '@/components/bill/BillPreview';
import { exportBill } from '@/lib/exportBill';
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
    weighmentCharges: '',
  };
}

function validate(form: ReturnType<typeof initForm>, gross: number, tare: number): string | null {
  if (!form.shopId) return 'Please select a shop';
  if (!form.vehicleNo.trim()) return 'Vehicle number is required';
  if (!form.grossWeight) return 'Gross weight is required';
  if (!form.tareWeight) return 'Tare weight is required';
  if (tare > gross) return 'Tare weight cannot exceed gross weight';
  return null;
}

export default function BillForm({ shops, onBillCreated }: Props) {
  const [form, setForm] = useState(() => initForm(shops));
  const [selectedShop, setSelectedShop] = useState<ShopOption | null>(shops[0] ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [createdBill, setCreatedBill] = useState<IBill | null>(null);
  const submittingRef = useRef(false);

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
  const net = Math.max(gross - tare, 0);

  async function submitBill(): Promise<IBill | null> {
    if (submittingRef.current) return null;
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

  async function handleSubmitAndExport() {
    const error = validate(form, gross, tare);
    if (error) { toast.error(error); return; }

    const bill = await submitBill();
    if (!bill) return;

    setCreatedBill(bill);
    setForm(initForm(shops));
    setSelectedShop(shops[0] ?? null);
    setExportModal(true);
  }

  async function handleExport(type: 'pdf' | 'image') {
    if (!createdBill) return;
    setExportModal(false);
    try {
      await exportBill(createdBill, selectedShop, type);
      toast.success(type === 'pdf' ? 'Exported as PDF' : 'Exported as image');
    } catch {
      toast.error('Export failed');
    }
  }

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
    <>
      {/* ── Main layout ── */}
      <div className="flex flex-col xl:flex-row gap-6 w-full min-w-0">

        {/* ── Form panel ── */}
        <div className="w-full xl:flex-1 min-w-0 border border-black">
          <div className="border-b border-black px-4 sm:px-5 py-3">
            <h2 className="text-[11px] lg:text-xs font-bold tracking-widest uppercase">New Bill</h2>
          </div>

          <div className="px-4 sm:px-5 py-5 space-y-4">

            {/* Shop */}
            <div>
              <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Shop</label>
              <ShopDropdown
                value={form.shopId}
                shops={shops}
                onChange={(shop) => { setSelectedShop(shop); set('shopId', shop._id); }}
              />
            </div>

            {/* Vehicle No */}
            <div>
              <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Vehicle No.</label>
              <input
                type="text"
                value={form.vehicleNo}
                onChange={(e) => set('vehicleNo', e.target.value.toUpperCase())}
                placeholder="KA53AA7273"
                className="w-full border border-black px-3 py-2 text-sm lg:text-[15px] font-mono uppercase"
              />
            </div>

            {/* Print Date */}
            <div>
              <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Print Date</label>
              <input
                type="datetime-local"
                value={form.printDate}
                onChange={(e) => set('printDate', e.target.value)}
                className="w-full border border-black px-3 py-2 text-sm lg:text-[15px] font-mono"
              />
            </div>

            {/* Material */}
            <div>
              <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Material</label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => set('material', e.target.value.toUpperCase())}
                className="w-full border border-black px-3 py-2 text-sm lg:text-[15px] font-mono uppercase"
              />
            </div>

            <div className="dotted-line" />

            {/* Gross Weight + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Gross Weight (KG)</label>
                <input
                  type="number"
                  min={0}
                  value={form.grossWeight}
                  onChange={(e) => set('grossWeight', e.target.value)}
                  placeholder="16550"
                  className="w-full border border-black px-3 py-2 text-sm lg:text-[15px] font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Gross Time</label>
                <input
                  type="datetime-local"
                  value={form.grossTime}
                  onChange={(e) => set('grossTime', e.target.value)}
                  className="w-full border border-black px-3 py-2 text-sm lg:text-[15px] font-mono"
                />
              </div>
            </div>

            {/* Tare Weight + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Tare Weight (KG)</label>
                <input
                  type="number"
                  min={0}
                  value={form.tareWeight}
                  onChange={(e) => set('tareWeight', e.target.value)}
                  placeholder="05090"
                  className="w-full border border-black px-3 py-2 text-sm lg:text-[15px] font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Tare Time</label>
                <input
                  type="datetime-local"
                  value={form.tareTime}
                  onChange={(e) => set('tareTime', e.target.value)}
                  className="w-full border border-black px-3 py-2 text-sm lg:text-[15px] font-mono"
                />
              </div>
            </div>

            {/* Net Weight */}
            <div>
              <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Net Weight (KG)</label>
              <div className="border border-black px-3 py-2 text-sm lg:text-[15px] font-mono bg-neutral-50">
                {net} KG
              </div>
            </div>

            <div className="dotted-line" />

            {/* Weighment Charges */}
            <div>
              <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Weighment Charges</label>
              <input
                type="number"
                min={0}
                placeholder='0'
                value={form.weighmentCharges}
                onChange={(e) => set('weighmentCharges', e.target.value)}
                className="w-full border border-black px-3 py-2 text-sm lg:text-[15px] font-mono"
              />
            </div>

            {/* Operator */}
            <div>
              <label className="block text-[11px] lg:text-xs font-bold tracking-widest uppercase mb-1">Operator Sign</label>
              <div className="border border-black px-3 py-2 text-sm lg:text-[15px] font-mono bg-neutral-50 text-neutral-400">
                ADMIN
              </div>
            </div>

            {/* Submit + Export */}
            <div className="pt-2">
              <button
                onClick={handleSubmitAndExport}
                disabled={submitting}
                className="w-full bg-black text-white text-[11px] lg:text-xs font-bold tracking-widest uppercase py-3 hover:bg-neutral-800 transition-colors disabled:opacity-40"
              >
                {submitting ? 'Submitting…' : 'Submit & Export'}
              </button>
            </div>

          </div>
        </div>

        {/* ── Live Preview panel ── */}
        <div className="w-full xl:w-auto min-w-0">
          <div className="border border-black mb-3 px-4 py-2">
            <span className="text-[11px] lg:text-xs font-bold tracking-widest uppercase text-neutral-500">
              Live Preview
            </span>
          </div>
          {/* Horizontally scrollable on small screens */}
          <div className="overflow-x-auto">
            <BillPreview bill={previewBill} />
          </div>
        </div>

      </div>

      {/* ── Export Modal ── */}
      {exportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white border border-black w-full max-w-xs">
            <div className="border-b border-black px-5 py-4">
              <h3 className="text-[11px] lg:text-xs font-bold tracking-widest uppercase">
                Export Bill #{createdBill?.billNo}
              </h3>
            </div>
            <div className="px-5 py-5 space-y-3">
              <p className="text-xs lg:text-[13px] text-neutral-500">Choose export format:</p>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full bg-black text-white text-[11px] lg:text-xs font-bold tracking-widest uppercase py-3 hover:bg-neutral-800 transition-colors"
              >
                Export as PDF
              </button>
              <button
                onClick={() => handleExport('image')}
                className="w-full border border-black text-[11px] lg:text-xs font-bold tracking-widest uppercase py-3 hover:bg-black hover:text-white transition-colors"
              >
                Export as Image
              </button>
              <button
                onClick={() => setExportModal(false)}
                className="w-full text-[11px] lg:text-xs font-bold tracking-widest uppercase py-2 text-neutral-400 hover:text-black transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
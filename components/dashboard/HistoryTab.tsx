'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Pencil, X, Check } from 'lucide-react';
import { toDisplayDateTime, nowDateTimeLocal } from '@/lib/utils';
import ShopDropdown, { ShopOption } from '@/components/ui/ShopDropdown';

interface Bill {
  _id: string;
  billNo: string;
  shop: ShopOption;
  vehicleNo: string;
  printDate: string;
  material: string;
  grossWeight: number;
  grossTime: string;
  tareWeight: number;
  tareTime: string;
  netWeight: number;
  weighmentCharges: number;
  operatorSign: string;
}

export default function HistoryTab() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [shops, setShops] = useState<ShopOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bill>>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [billsRes, shopsRes] = await Promise.all([
        fetch('/api/bills'),
        fetch('/api/shops'),
      ]);
      const billsData = await billsRes.json();
      const shopsData = await shopsRes.json();
      if (billsData.success) setBills(billsData.data);
      if (shopsData.success) setShops(shopsData.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openEdit(bill: Bill) {
    setEditBill(bill);
    setEditForm({
      shop: bill.shop,
      vehicleNo: bill.vehicleNo,
      printDate: bill.printDate,
      material: bill.material,
      grossWeight: bill.grossWeight,
      grossTime: bill.grossTime,
      tareWeight: bill.tareWeight,
      tareTime: bill.tareTime,
      weighmentCharges: bill.weighmentCharges,
    });
  }

  async function handleSave() {
    if (!editBill) return;
    setSaving(true);
    try {
      const shopId = typeof editForm.shop === 'object' ? (editForm.shop as ShopOption)._id : editForm.shop;
      const res = await fetch(`/api/bills/${editBill._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, shop: shopId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Bill updated');
        setEditBill(null);
        load();
      } else {
        toast.error(data.error ?? 'Failed to update');
      }
    } finally {
      setSaving(false);
    }
  }

  function ef(field: string, value: string | number | ShopOption) {
    setEditForm((f) => ({ ...f, [field]: value }));
  }

  const gross = Number(editForm.grossWeight) || 0;
  const tare = Number(editForm.tareWeight) || 0;

  if (loading) return <div className="p-6 text-xs text-neutral-400">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xs font-bold tracking-widest uppercase">Bill History</h2>

      {bills.length === 0 ? (
        <p className="text-xs text-neutral-400">No bills yet.</p>
      ) : (
        <div className="border border-black overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black bg-neutral-50">
                {['Bill No.', 'Vehicle', 'Shop', 'Date', 'Net (KG)', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-bold tracking-widest uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill._id} className="border-b border-neutral-200 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-bold">{bill.billNo}</td>
                  <td className="px-4 py-3">{bill.vehicleNo}</td>
                  <td className="px-4 py-3 text-neutral-500">{bill.shop?.title ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                    {toDisplayDateTime(bill.printDate)}
                  </td>
                  <td className="px-4 py-3">{bill.netWeight}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(bill)}
                      className="border border-black px-2 py-1 hover:bg-black hover:text-white"
                    >
                      <Pencil size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white border border-black w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black px-5 py-4">
              <h3 className="text-xs font-bold tracking-widest uppercase">
                Edit Bill #{editBill.billNo}
              </h3>
              <button onClick={() => setEditBill(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Body - Bill-style form */}
            <div className="px-5 py-5 space-y-4 text-xs font-mono">
              {/* Shop */}
              <div>
                <label className="block font-bold tracking-widest uppercase mb-1">Shop</label>
                <ShopDropdown
                  value={typeof editForm.shop === 'object' ? (editForm.shop as ShopOption)._id : ''}
                  shops={shops}
                  onChange={(shop) => ef('shop', shop)}
                />
              </div>

              <div className="dotted-line" />

              {/* Vehicle + Print Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold tracking-widest uppercase mb-1">Vehicle No.</label>
                  <input
                    type="text"
                    value={editForm.vehicleNo ?? ''}
                    onChange={(e) => ef('vehicleNo', e.target.value.toUpperCase())}
                    className="w-full border border-black px-2 py-1 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold tracking-widest uppercase mb-1">Print Date</label>
                  <input
                    type="datetime-local"
                    value={editForm.printDate ?? nowDateTimeLocal()}
                    onChange={(e) => ef('printDate', e.target.value)}
                    className="w-full border border-black px-2 py-1"
                  />
                </div>
              </div>

              {/* Material */}
              <div>
                <label className="block font-bold tracking-widest uppercase mb-1">Material</label>
                <input
                  type="text"
                  value={editForm.material ?? ''}
                  onChange={(e) => ef('material', e.target.value.toUpperCase())}
                  className="w-full border border-black px-2 py-1 uppercase"
                />
              </div>

              <div className="dotted-line" />

              {/* Gross + Tare */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold tracking-widest uppercase mb-1">Gross (KG)</label>
                  <input
                    type="number"
                    value={editForm.grossWeight ?? 0}
                    onChange={(e) => ef('grossWeight', e.target.value)}
                    className="w-full border border-black px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block font-bold tracking-widest uppercase mb-1">Gross Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.grossTime ?? nowDateTimeLocal()}
                    onChange={(e) => ef('grossTime', e.target.value)}
                    className="w-full border border-black px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block font-bold tracking-widest uppercase mb-1">Tare (KG)</label>
                  <input
                    type="number"
                    value={editForm.tareWeight ?? 0}
                    onChange={(e) => ef('tareWeight', e.target.value)}
                    className="w-full border border-black px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block font-bold tracking-widest uppercase mb-1">Tare Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.tareTime ?? nowDateTimeLocal()}
                    onChange={(e) => ef('tareTime', e.target.value)}
                    className="w-full border border-black px-2 py-1"
                  />
                </div>
              </div>

              {/* Net (read-only) */}
              <div>
                <label className="block font-bold tracking-widest uppercase mb-1">Net (KG)</label>
                <div className="border border-black px-2 py-1 bg-neutral-50">{gross - tare >= 0 ? gross - tare : 0}</div>
              </div>

              <div className="dotted-line" />

              {/* Charges */}
              <div>
                <label className="block font-bold tracking-widest uppercase mb-1">Weighment Charges</label>
                <input
                  type="number"
                  value={editForm.weighmentCharges ?? 0}
                  onChange={(e) => ef('weighmentCharges', e.target.value)}
                  className="w-full border border-black px-2 py-1"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t border-black px-5 py-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-black text-white text-xs px-4 py-2 tracking-widest uppercase hover:bg-neutral-800 disabled:opacity-50"
              >
                <Check size={12} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditBill(null)}
                className="flex items-center gap-2 border border-black text-xs px-4 py-2 tracking-widest uppercase hover:bg-neutral-100"
              >
                <X size={12} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
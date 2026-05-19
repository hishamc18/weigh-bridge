'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';

interface Shop {
  _id: string;
  title: string;
  location: string;
  weight: number;
}

export default function ShopsTab() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: '', location: '', weight: '' });
  const [newShop, setNewShop] = useState({ title: '', location: '', weight: '' });
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/shops');
      const data = await res.json();
      if (data.success) setShops(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!newShop.title.trim() || !newShop.location.trim() || !newShop.weight) {
      return toast.error('All fields are required');
    }
    const res = await fetch('/api/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newShop, weight: Number(newShop.weight) }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Shop added');
      setNewShop({ title: '', location: '', weight: '' });
      setAdding(false);
      load();
    } else {
      toast.error(data.error ?? 'Failed to add shop');
    }
  }

  async function handleEdit(id: string) {
    if (!editData.title.trim() || !editData.location.trim() || !editData.weight) {
      return toast.error('All fields are required');
    }
    const res = await fetch(`/api/shops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editData, weight: Number(editData.weight) }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Shop updated');
      setEditId(null);
      load();
    } else {
      toast.error(data.error ?? 'Failed to update');
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/shops/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast.success('Shop deleted');
      setDeleteConfirm(null);
      load();
    } else {
      toast.error('Failed to delete');
    }
  }

  if (loading) return <div className="p-6 text-xs text-neutral-400">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest uppercase">Shops</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-2 text-xs border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors tracking-widest uppercase"
        >
          <Plus size={12} />
          Add Shop
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="border border-black p-4 space-y-3">
          <h3 className="text-xs font-bold tracking-widest uppercase">New Shop</h3>
          <input
            type="text"
            placeholder="Shop Title"
            value={newShop.title}
            onChange={(e) => setNewShop((s) => ({ ...s, title: e.target.value }))}
            className="w-full border border-black px-3 py-2 text-sm font-mono"
          />
          <input
            type="text"
            placeholder="Location"
            value={newShop.location}
            onChange={(e) => setNewShop((s) => ({ ...s, location: e.target.value }))}
            className="w-full border border-black px-3 py-2 text-sm font-mono"
          />
          <input
            type="number"
            placeholder="Weight Capacity (Tonnes)"
            value={newShop.weight}
            onChange={(e) => setNewShop((s) => ({ ...s, weight: e.target.value }))}
            className="w-full border border-black px-3 py-2 text-sm font-mono"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-black text-white text-xs px-4 py-2 tracking-widest uppercase hover:bg-neutral-800"
            >
              <Check size={12} /> Save
            </button>
            <button
              onClick={() => setAdding(false)}
              className="flex items-center gap-2 border border-black text-xs px-4 py-2 tracking-widest uppercase hover:bg-neutral-100"
            >
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Shops Table */}
      {shops.length === 0 ? (
        <p className="text-xs text-neutral-400">No shops yet.</p>
      ) : (
        <div className="border border-black overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black bg-neutral-50">
                <th className="text-left px-4 py-3 font-bold tracking-widest uppercase">Title</th>
                <th className="text-left px-4 py-3 font-bold tracking-widest uppercase">Location</th>
                <th className="text-left px-4 py-3 font-bold tracking-widest uppercase">Weight (T)</th>
                <th className="text-right px-4 py-3 font-bold tracking-widest uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop._id} className="border-b border-neutral-200 last:border-0">
                  {editId === shop._id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editData.title}
                          onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))}
                          className="border border-black px-2 py-1 text-xs font-mono w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editData.location}
                          onChange={(e) => setEditData((d) => ({ ...d, location: e.target.value }))}
                          className="border border-black px-2 py-1 text-xs font-mono w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editData.weight}
                          onChange={(e) => setEditData((d) => ({ ...d, weight: e.target.value }))}
                          className="border border-black px-2 py-1 text-xs font-mono w-20"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(shop._id)}
                            className="text-xs border border-black px-2 py-1 hover:bg-black hover:text-white"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="text-xs border border-black px-2 py-1 hover:bg-black hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{shop.title}</td>
                      <td className="px-4 py-3 text-neutral-500">{shop.location}</td>
                      <td className="px-4 py-3">{shop.weight}T</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditId(shop._id);
                              setEditData({ title: shop.title, location: shop.location, weight: String(shop.weight) });
                            }}
                            className="text-xs border border-black px-2 py-1 hover:bg-black hover:text-white"
                          >
                            <Pencil size={12} />
                          </button>
                          {deleteConfirm === shop._id ? (
                            <span className="flex gap-1 items-center text-xs">
                              <span className="text-neutral-500">Delete?</span>
                              <button
                                onClick={() => handleDelete(shop._id)}
                                className="border border-black px-2 py-1 bg-black text-white hover:bg-neutral-800"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="border border-black px-2 py-1 hover:bg-neutral-100"
                              >
                                No
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(shop._id)}
                              className="text-xs border border-black px-2 py-1 hover:bg-black hover:text-white"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
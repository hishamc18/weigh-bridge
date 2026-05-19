'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function SettingsTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [expiry, setExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (form.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password updated');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error ?? 'Failed to update password');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleExpiryChange(e: React.FormEvent) {
    e.preventDefault();
    const days = Number(expiry);
    if (!days || days < 1 || days > 365) {
      return toast.error('Enter a value between 1 and 365 days');
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionExpiryDays: days }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Session expiry updated');
        setExpiry('');
      } else {
        toast.error(data.error ?? 'Failed to update');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-md">
      <h2 className="text-xs font-bold tracking-widest uppercase">Settings</h2>

      {/* Password Change */}
      <div className="border border-black">
        <div className="border-b border-black px-5 py-3">
          <h3 className="text-xs font-bold tracking-widest uppercase">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => set('currentPassword', e.target.value)}
              className="w-full border border-black px-3 py-2 text-sm font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">
              New Password
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => set('newPassword', e.target.value)}
              className="w-full border border-black px-3 py-2 text-sm font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              className="w-full border border-black px-3 py-2 text-sm font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Session Expiry */}
      <div className="border border-black">
        <div className="border-b border-black px-5 py-3">
          <h3 className="text-xs font-bold tracking-widest uppercase">Session Expiry</h3>
        </div>
        <form onSubmit={handleExpiryChange} className="px-5 py-5 space-y-4">
          <p className="text-xs text-neutral-500">
            Set how many days login sessions remain valid (1–365).
          </p>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase mb-1">
              Expiry (Days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="10"
              className="w-full border border-black px-3 py-2 text-sm font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Expiry'}
          </button>
        </form>
      </div>
    </div>
  );
}
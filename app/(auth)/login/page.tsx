'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Scale } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Login successful. Welcome back!');
        router.push('/home');
      } else {
        toast.error(data.error ?? 'Login failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale size={24} strokeWidth={1.5} />
          <span className="text-sm font-bold tracking-widest uppercase">Weigh Bridge</span>
        </div>
        <button
          onClick={() => router.push('/home')}
          className="text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors tracking-widest uppercase"
        >
          Dashboard
        </button>
      </header>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm border border-black">
          <div className="border-b border-black px-6 py-4">
            <h1 className="text-sm font-bold tracking-widest uppercase">Sign In</h1>
            <p className="text-xs text-neutral-500 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="px-6 py-6 space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="admin"
                className="w-full border border-black px-3 py-2 text-sm font-mono bg-white"
                required
                autoFocus
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full border border-black px-3 py-2 text-sm font-mono bg-white"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../store/auth.store';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data, error: apiError } = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requireAuth: false
    });

    if (apiError) {
      setError(apiError.message || 'Failed to login');
      return;
    }

    if (data?.success) {
      // Force session refresh by reloading or calling /auth/me
      const { data: user, error: meError } = await apiClient('/auth/me', {
        requireAuth: true
      });

      if (user) {
        useAuthStore.getState().setAuth(user);
        const { data: workspaces } = await apiClient('/workspaces', {
          requireAuth: true
        });
        if (workspaces) {
          useAuthStore.getState().setWorkspaces(workspaces);
        }
        router.push('/');
      } else {
        setError(meError?.message || 'Failed to fetch user profile');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/10 z-10 relative">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-xl font-bold tracking-tighter text-white">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Welcome back
          </h1>
          <p className="text-zinc-400 mt-2 text-sm font-medium">Sign in to your workspace</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-300">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder-zinc-500"
              placeholder="you@example.com"
              suppressHydrationWarning
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-zinc-300">Password</label>
            </div>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder-zinc-500"
              placeholder="••••••••"
              suppressHydrationWarning
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] mt-4"
            suppressHydrationWarning
          >
            Sign in
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium">
          <span className="text-zinc-500">Don't have an account? </span>
          <Link href="/register" className="text-white hover:text-blue-400 transition-colors">Create one now</Link>
        </div>
      </div>
    </div>
  );
}

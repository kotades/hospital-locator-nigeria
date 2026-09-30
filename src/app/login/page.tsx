'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LogIn, Eye, EyeOff, AlertCircle, Loader2, Hospital } from 'lucide-react';

const QUICK_LOGINS = [
  { label: 'Patient', email: 'patient@hospital.ng', role: 'Patient', color: 'bg-blue-700 hover:bg-blue-600' },
  { label: 'Facility Rep', email: 'rep@hospital.ng', role: 'Facility Rep', color: 'bg-purple-700 hover:bg-purple-600' },
  { label: 'Admin', email: 'admin@hospital.ng', role: 'Admin', color: 'bg-red-700 hover:bg-red-600' },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent, overrideEmail?: string) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const loginEmail = overrideEmail ?? email;
    const res = await signIn('credentials', {
      redirect: false,
      email: loginEmail,
      password: overrideEmail ? 'password123' : password,
    });
    setLoading(false);
    if (res?.ok) {
      router.push(callbackUrl);
    } else {
      setError('Invalid email or password. Try one of the quick login options below.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <Hospital className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-1 text-sm">Sign in to Hospital Locator Nigeria</p>
        </div>

        {/* Quick Logins */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-3 text-center uppercase tracking-wider font-medium">Quick Login</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_LOGINS.map((q) => (
              <button
                key={q.email}
                onClick={(e) => handleSubmit(e, q.email)}
                disabled={loading}
                className={`${q.color} text-white rounded-xl py-2 px-2 text-xs font-semibold transition-colors disabled:opacity-50`}
              >
                {q.label}
                <div className="text-white/70 font-normal">{q.role}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-xs text-gray-600">or sign in manually</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

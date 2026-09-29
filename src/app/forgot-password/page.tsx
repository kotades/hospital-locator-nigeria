'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Hospital, Mail, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    // 15-min countdown simulation
    let remaining = 15 * 60;
    setCountdown(remaining);
    const timer = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
  }

  function formatCountdown(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <Hospital className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {sent ? 'Check your email' : 'Forgot password?'}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {sent
              ? `We sent a reset link to ${email}`
              : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-900/30 border border-green-700 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Reset link sent to <strong className="text-white">{email}</strong></span>
              </div>
              {countdown > 0 && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Link expires in</p>
                  <div className="text-2xl font-mono font-bold text-blue-400">{formatCountdown(countdown)}</div>
                </div>
              )}
              {countdown === 0 && (
                <p className="text-xs text-red-400 text-center">Link expired. Please request a new one.</p>
              )}
            </div>
            <button
              onClick={() => { setSent(false); setEmail(''); setCountdown(0); }}
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="flex items-center justify-center mt-6">
          <Link href="/login" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

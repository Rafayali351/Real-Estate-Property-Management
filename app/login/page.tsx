'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { PasswordField } from '@/components/auth/PasswordField';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error, success } = useToast();

  const redirectUrl = searchParams.get('redirect') || '';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      error('Please enter both your identifier and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.login({
        identifier: identifier.trim(),
        password,
      });

      // Save challenge session to sessionStorage
      sessionStorage.setItem('re_challenge_token', res.challengeToken);
      sessionStorage.setItem('re_masked_email', res.maskedEmail);
      sessionStorage.setItem('re_masked_phone', res.maskedPhone);
      if (redirectUrl) {
        sessionStorage.setItem('re_post_login_redirect', redirectUrl);
      }

      success('Credentials verified. Please choose OTP delivery destination.');
      router.push('/verify');
    } catch (err: any) {
      error(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center py-20 px-4">
      <AuthCard
        title="Client Sign In"
        subtitle="Access your confidential estate portfolio, bookings, and private advisory services"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier: Email or Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Email or Mobile Phone
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. name@domain.com or +923001234567"
              className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <PasswordField
              value={password}
              onChange={setPassword}
              label="Password"
              placeholder="Enter your account password"
            />
            <div className="flex justify-end pt-1.5">
              <Link
                href="/forgot-password"
                className="text-xs text-gold hover:underline font-medium"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify with Real OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-sub">
            <Lock className="w-3.5 h-3.5 text-gold" />
            <span>2-Factor OTP Cryptographic Verification Enforced</span>
          </div>

          {/* Signup Redirect */}
          <p className="text-center text-xs text-slate-muted pt-4 border-t border-white/10">
            Do not have an account yet?{' '}
            <Link href="/signup" className="text-gold font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </AuthCard>
    </main>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { PasswordField } from '@/components/auth/PasswordField';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { error, success } = useToast();

  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      error('Please enter your registered email or phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.forgotPassword({ identifier: identifier.trim() });
      success(res.message);
      setStep('RESET');
    } catch (err: any) {
      error(err.message || 'Could not dispatch password reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      error('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.resetPassword({
        identifier: identifier.trim(),
        code: code.trim(),
        newPassword,
      });

      success(res.message || 'Password reset successfully! Please sign in.');
      router.push('/login');
    } catch (err: any) {
      error(err.message || 'Reset failed. Code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center py-20 px-4">
      <AuthCard
        title={step === 'REQUEST' ? 'Reset Password' : 'Set New Password'}
        subtitle={
          step === 'REQUEST'
            ? 'Enter your registered email or phone to receive a 6-digit security code'
            : `Enter the 6-digit code dispatched to ${identifier}`
        }
      >
        {step === 'REQUEST' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Registered Email or Mobile Phone
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@domain.com or +923001234567"
                className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Dispatch Security Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* 6 Digit Code */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                6-Digit Security Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-lg font-mono text-center tracking-[0.5em] text-white placeholder-slate-sub outline-none"
                />
                <KeyRound className="w-4 h-4 text-gold absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* New Password */}
            <PasswordField
              value={newPassword}
              onChange={setNewPassword}
              label="New Password"
              showStrength={true}
            />

            {/* Confirm New Password */}
            <PasswordField
              id="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              label="Confirm New Password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save New Password'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('REQUEST')}
                className="text-xs text-slate-muted hover:text-white"
              >
                Use a different email or phone
              </button>
            </div>
          </form>
        )}
      </AuthCard>
    </main>
  );
}

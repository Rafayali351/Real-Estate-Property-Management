'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { PasswordField } from '@/components/auth/PasswordField';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { error, success } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      error('You must agree to the Terms and Privacy Policy to create an account.');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    const fullPhone = `${countryCode}${phoneNumber.replace(/^0+/, '')}`;

    setLoading(true);
    try {
      const res = await api.auth.register({
        fullName,
        email,
        phone: fullPhone,
        password,
        confirmPassword,
        agreeToTerms: true,
      });

      // Save challenge session to sessionStorage
      sessionStorage.setItem('re_challenge_token', res.challengeToken);
      sessionStorage.setItem('re_masked_email', res.maskedEmail);
      sessionStorage.setItem('re_masked_phone', res.maskedPhone);

      success('Account created! Choose where to receive your verification code.');
      router.push('/verify');
    } catch (err: any) {
      error(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center py-20 px-4">
      <AuthCard
        title="Apply for Membership"
        subtitle="Create your private client account for verified appointments and portfolio access"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Tariq Mansoor"
              className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
            />
          </div>

          {/* Phone with Country Code */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Mobile Phone (for OTP)
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 px-2 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none cursor-pointer"
              >
                <option value="+92">🇵🇰 +92</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+966">🇸🇦 +966</option>
              </select>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="300 1234567"
                className="flex-1 px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
              />
            </div>
          </div>

          {/* Password with Strength Meter */}
          <PasswordField
            value={password}
            onChange={setPassword}
            label="Create Secure Password"
            showStrength={true}
          />

          {/* Confirm Password */}
          <PasswordField
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            label="Confirm Password"
            placeholder="Re-enter password"
          />

          {/* Terms Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-muted cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded bg-obsidian-charcoal border-white/20 text-gold focus:ring-gold"
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" className="text-gold underline hover:text-gold-light">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-gold underline hover:text-gold-light">
                  Privacy Policy
                </Link>{' '}
                governing real OTP verification.
              </span>
            </label>
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
                <span>Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Signin Redirect */}
          <p className="text-center text-xs text-slate-muted pt-4">
            Already registered?{' '}
            <Link href="/login" className="text-gold font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </AuthCard>
    </main>
  );
}

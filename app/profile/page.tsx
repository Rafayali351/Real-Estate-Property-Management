'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { PasswordField } from '@/components/auth/PasswordField';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, Phone, Lock, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  // 1. Profile Name
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // 2. Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // 3. Change Contact (Email/Phone) by OTP
  const [contactType, setContactType] = useState<'Email' | 'Phone'>('Email');
  const [newContactValue, setNewContactValue] = useState('');
  const [contactStep, setContactStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [otpCode, setOtpCode] = useState('');
  const [updatingContact, setUpdatingContact] = useState(false);

  // Update Name
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    setUpdatingProfile(true);
    try {
      await api.account.updateProfile({ fullName });
      await refreshUser();
      success('Profile updated successfully.');
    } catch (err: any) {
      error(err.message || 'Could not update profile name.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.account.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      success('Password changed successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Request Contact Change (Sends OTP to new destination)
  const handleRequestContactChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactValue) return;

    setUpdatingContact(true);
    try {
      const res = await api.account.requestContactChange({
        type: contactType,
        newValue: newContactValue.trim(),
      });
      success(res.message);
      setContactStep('VERIFY');
    } catch (err: any) {
      error(err.message || 'Could not request contact change.');
    } finally {
      setUpdatingContact(false);
    }
  };

  // Confirm Contact Change (Verifies code and updates)
  const handleConfirmContactChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      error('Please enter the 6-digit verification code.');
      return;
    }

    setUpdatingContact(true);
    try {
      await api.account.confirmContactChange({ code: otpCode.trim() });
      await refreshUser();
      success(`${contactType} updated and verified successfully.`);
      setContactStep('REQUEST');
      setNewContactValue('');
      setOtpCode('');
    } catch (err: any) {
      error(err.message || 'Verification failed. Code may be invalid or expired.');
    } finally {
      setUpdatingContact(false);
    }
  };

  if (!user) return null;

  return (
    <main className="py-24 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-10">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Client Account
          </span>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight mt-1">
            Security & Profile Settings
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={user.isEmailVerified ? 'emerald' : 'neutral'}>
            Email {user.isEmailVerified ? 'Verified' : 'Unverified'}
          </Badge>
          <Badge variant={user.isPhoneVerified ? 'emerald' : 'neutral'}>
            Phone {user.isPhoneVerified ? 'Verified' : 'Unverified'}
          </Badge>
        </div>
      </div>

      {/* 1. Edit Full Name */}
      <section className="bg-obsidian-card border border-white/10 rounded-2xl p-6 sm:p-8 shadow-card-glass space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <User className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-lg font-bold text-white">Legal Identity</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={updatingProfile}
            className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow disabled:opacity-50"
          >
            {updatingProfile ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </section>

      {/* 2. Change Contact (Email/Phone by OTP) */}
      <section className="bg-obsidian-card border border-white/10 rounded-2xl p-6 sm:p-8 shadow-card-glass space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-lg font-bold text-white">Change Email or Phone</h2>
          </div>
          <span className="text-[11px] text-gold uppercase tracking-wider font-semibold">
            OTP Verified
          </span>
        </div>

        <div className="text-xs text-slate-muted">
          Current Email: <strong className="text-white">{user.email}</strong> • Current Phone:{' '}
          <strong className="text-white">{user.phone}</strong>
        </div>

        {contactStep === 'REQUEST' ? (
          <form onSubmit={handleRequestContactChange} className="space-y-4 max-w-lg">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setContactType('Email')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                  contactType === 'Email'
                    ? 'bg-gold/15 text-gold border-gold'
                    : 'border-white/10 text-slate-muted hover:text-white'
                }`}
              >
                Change Email
              </button>
              <button
                type="button"
                onClick={() => setContactType('Phone')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                  contactType === 'Phone'
                    ? 'bg-gold/15 text-gold border-gold'
                    : 'border-white/10 text-slate-muted hover:text-white'
                }`}
              >
                Change Phone
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                New {contactType} Destination
              </label>
              <input
                type={contactType === 'Email' ? 'email' : 'tel'}
                required
                value={newContactValue}
                onChange={(e) => setNewContactValue(e.target.value)}
                placeholder={contactType === 'Email' ? 'new.email@domain.com' : '+92 300 1234567'}
                className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={updatingContact}
              className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow disabled:opacity-50"
            >
              {updatingContact ? 'Dispatching OTP...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmContactChange} className="space-y-4 max-w-lg">
            <p className="text-xs text-gold">
              A 6-digit verification code has been dispatched to{' '}
              <strong className="text-white">{newContactValue}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-lg font-mono text-center tracking-[0.5em] text-white outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setContactStep('REQUEST')}
                className="px-4 py-2 rounded-xl border border-white/15 text-slate-muted hover:text-white text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={updatingContact}
                className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow disabled:opacity-50"
              >
                {updatingContact ? 'Verifying...' : 'Confirm Change'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 3. Change Password */}
      <section className="bg-obsidian-card border border-white/10 rounded-2xl p-6 sm:p-8 shadow-card-glass space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Lock className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-lg font-bold text-white">Update Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <PasswordField
            id="currentPassword"
            value={currentPassword}
            onChange={setCurrentPassword}
            label="Current Password"
          />

          <PasswordField
            id="newPassword"
            value={newPassword}
            onChange={setNewPassword}
            label="New Password"
            showStrength={true}
          />

          <PasswordField
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            label="Confirm New Password"
          />

          <button
            type="submit"
            disabled={updatingPassword}
            className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow disabled:opacity-50"
          >
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>
    </main>
  );
}

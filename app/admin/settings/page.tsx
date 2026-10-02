'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { SiteSettings } from '@/lib/types';
import { Settings, Save, Globe } from 'lucide-react';

export default function AdminSettingsPage() {
  const { settings: globalSettings, refreshSettings } = useSettings();
  const { success, error } = useToast();

  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [address, setAddress] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (globalSettings) {
      setCompanyName(globalSettings.companyName || '');
      setTagline(globalSettings.tagline || '');
      setContactEmail(globalSettings.contactEmail || '');
      setContactPhone(globalSettings.contactPhone || '');
      setWhatsAppNumber(globalSettings.whatsAppNumber || '');
      setAddress(globalSettings.address || '');
      setFacebookUrl(globalSettings.facebookUrl || '');
      setInstagramUrl(globalSettings.instagramUrl || '');
      setLinkedinUrl(globalSettings.linkedInUrl || globalSettings.linkedinUrl || '');
    }
  }, [globalSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !tagline || !contactEmail || !contactPhone || !whatsAppNumber || !address) {
      error('Please complete all mandatory company fields.');
      return;
    }

    setSaving(true);
    const payload: SiteSettings = {
      companyName: companyName.trim(),
      tagline: tagline.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone.trim(),
      whatsAppNumber: whatsAppNumber.trim(),
      address: address.trim(),
      facebookUrl: facebookUrl.trim() || undefined,
      instagramUrl: instagramUrl.trim() || undefined,
      linkedInUrl: linkedinUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
    };

    try {
      const res = await api.admin.settings.update(payload);
      await refreshSettings();
      success(res.message || 'Site settings updated successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-white/10 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Platform Configuration
        </span>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight mt-1">
          Brand Identity & Site Settings
        </h1>
        <p className="text-xs text-slate-muted mt-1">
          These details are dynamically rendered across the public navigation, concierge footer, and inquiry dispatches.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-obsidian-card border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-card-glass">
        {/* Brand Details */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Globe className="w-4 h-4 text-gold" />
            <span>Brand Credentials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Company / Brand Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Official Tagline *
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Concierge Communication */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-white border-b border-white/10 pb-3">
            Concierge Telephony & Communication Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Contact Email (Alert Destination) *
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Helpline / Phone *
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                WhatsApp Dedicated Line *
              </label>
              <input
                type="text"
                required
                value={whatsAppNumber}
                onChange={(e) => setWhatsAppNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Physical Headquarters Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
            />
          </div>
        </div>

        {/* Social Networks */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-white border-b border-white/10 pb-3">
            Digital Channels & Social Profiles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Facebook URL
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Instagram URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/..."
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Site Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

import React from 'react';
import { Metadata } from 'next';
import { Scale, ShieldAlert, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | REAL ESTATE Luxury Estates',
  description: 'Terms of engagement, property viewing rules, and advisory protocols.',
};

export default function TermsPage() {
  return (
    <main className="py-24 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="mb-12 border-b border-white/10 pb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs uppercase tracking-widest font-semibold mb-4">
          <Scale className="w-4 h-4" />
          <span>Legal Framework</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
          Terms & Conditions
        </h1>
        <p className="text-sm text-slate-muted">
          Last revised: October 2026 • REAL ESTATE Management Platform
        </p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-slate-muted">
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-white font-semibold flex items-center gap-2.5">
            <Award className="w-5 h-5 text-gold" />
            <span>1. Platform Scope & Advisory Role</span>
          </h2>
          <p>
            <strong>REAL ESTATE</strong> operates as an elite real estate marketing and advisory management platform connecting high-net-worth buyers, investors, and sellers with verified luxury estates across Pakistan. All property listings are subject to verification and prior contract disposition.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-white font-semibold flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-gold" />
            <span>2. Private Tour Viewings Protocol</span>
          </h2>
          <p>
            Private viewings for trophy properties, sky penthouses, and gated compounds require verified client authentication via SMS or email OTP. The concierge reserves the right to request proof of funds or personal identification prior to granting private physical access.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-white font-semibold">
            3. Account Integrity & Verification
          </h2>
          <p>
            Clients must maintain accurate contact credentials. Accounts exhibiting repeated failed password attempts (5 attempts) are automatically locked for 15 minutes by server security monitors. Compromised or suspended accounts can only be restored through the verified security desk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-white font-semibold">
            4. Pricing Currency & Transaction Details
          </h2>
          <p>
            All listed prices are denominated in Pakistani Rupees (PKR) unless explicitly declared otherwise. While listing figures are drawn directly from current owner agreements, final acquisition terms are governed strictly by physical contractual documentation executed with the authorized seller.
          </p>
        </section>
      </div>
    </main>
  );
}

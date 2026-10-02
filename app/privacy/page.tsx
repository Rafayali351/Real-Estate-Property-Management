import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | REAL ESTATE Luxury Estates',
  description: 'Confidentiality and data protection governance for clients and investors.',
};

export default function PrivacyPage() {
  return (
    <main className="py-24 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="mb-12 border-b border-white/10 pb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs uppercase tracking-widest font-semibold mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span>Client Privilege & Protection</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-muted">
          Last revised: October 2026 • Governed under Real Estate Regulatory & Cryptographic Standards
        </p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-slate-muted">
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-white font-semibold flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-gold" />
            <span>1. Commitment to Absolute Discretion</span>
          </h2>
          <p>
            At <strong>REAL ESTATE</strong>, safeguarding the identity, wealth data, and transactional intentions of our distinguished clients and private family offices is paramount. We handle your information with the highest institutional security standards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-white font-semibold flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-gold" />
            <span>2. Collection of Phone Numbers & Email for Real OTP Verification</span>
          </h2>
          <p>
            To eliminate automated scraping, prevent unauthorized account creation, and guarantee the security of private property viewings, we require phone numbers (in local or international E.164 format) and verified email addresses.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>One-Time Passcodes (OTP):</strong> Delivered directly via SMS (Twilio telecommunication gateway) or encrypted SMTP email to verify your identity.
            </li>
            <li>
              <strong>Storage Security:</strong> Raw OTP codes are NEVER stored in plaintext. They are cryptographically hashed using HMAC-SHA256 with server-side salt secrets and expire in 5 minutes.
            </li>
            <li>
              <strong>Non-Disclosure:</strong> We never sell, rent, or lease client phone numbers or email addresses to third-party marketing brokers.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-white font-semibold flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-gold" />
            <span>3. Private Viewing & Concierge Communication</span>
          </h2>
          <p>
            When you schedule an estate inspection or transmit an inquiry, details are shared only with the assigned managing partner or licensed real estate advisor bound by strict non-disclosure obligations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-white font-semibold">
            4. Cookie Governance & Session Encryption
          </h2>
          <p>
            Authenticated sessions utilize HttpOnly, SameSite=Lax cryptographic session cookies (labeled <code>re_auth</code>). Tokens are inaccessible to client-side scripts, protecting your portal from Cross-Site Scripting (XSS).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-white font-semibold">
            5. Contact our Data Protection Officer
          </h2>
          <p>
            For privacy inquiries or record deletion requests, contact our compliance desk at{' '}
            <a href="mailto:privacy@realestate.com" className="text-gold underline">
              privacy@realestate.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}

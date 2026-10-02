'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Send } from 'lucide-react';

interface ContactFormProps {
  propertyId?: number;
  propertyTitle?: string;
  defaultSubject?: string;
  className?: string;
}

export function ContactForm({
  propertyId,
  propertyTitle,
  defaultSubject = 'General Inquiry',
  className = '',
}: ContactFormProps) {
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(
    propertyTitle ? `Inquiry regarding ${propertyTitle}` : defaultSubject
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      error('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.inquiries.create({
        name,
        email,
        phone,
        subject,
        message,
        propertyId,
      });

      success(res.message || 'Thank you. Your message has been received by our private desk.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      error(err.message || 'Unable to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Malik Jahangir"
            className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. name@domain.com"
            className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
            Phone / WhatsApp Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 300 1234567"
            className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
            Subject *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
          Confidential Message *
        </label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Specify private requirements, investment scope, or timeline..."
          className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 bg-gold hover:bg-gold-hover text-black font-semibold rounded-xl tracking-wide transition-all shadow-gold-glow disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Transmit Inquiry</span>
          </>
        )}
      </button>
    </form>
  );
}

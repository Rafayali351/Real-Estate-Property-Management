'use client';

import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface ChannelSelectorProps {
  channel: 'Email' | 'Sms';
  onSelectChannel: (channel: 'Email' | 'Sms') => void;
  maskedEmail: string;
  maskedPhone: string;
  onSendCode: () => void;
  loading: boolean;
}

export function ChannelSelector({
  channel,
  onSelectChannel,
  maskedEmail,
  maskedPhone,
  onSendCode,
  loading,
}: ChannelSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-white">Where should we send your code?</h2>
        <p className="text-xs text-slate-muted mt-1">Select your preferred authentication dispatch destination.</p>
      </div>

      <div className="space-y-3">
        {/* Email Option */}
        <button
          type="button"
          onClick={() => onSelectChannel('Email')}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
            channel === 'Email'
              ? 'bg-gold/10 border-gold shadow-gold-glow'
              : 'bg-white/5 border-white/10 hover:border-gold/40'
          }`}
        >
          <div
            className={`p-3 rounded-lg ${
              channel === 'Email' ? 'bg-gold text-black' : 'bg-white/10 text-slate-muted'
            }`}
          >
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-slate-muted font-semibold">Email Dispatch</p>
            <p className="text-sm font-medium text-white truncate">{maskedEmail || 'Registered Email'}</p>
          </div>
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              channel === 'Email' ? 'border-gold' : 'border-white/30'
            }`}
          >
            {channel === 'Email' && <div className="w-2 h-2 rounded-full bg-gold" />}
          </div>
        </button>

        {/* SMS Option */}
        <button
          type="button"
          onClick={() => onSelectChannel('Sms')}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
            channel === 'Sms'
              ? 'bg-gold/10 border-gold shadow-gold-glow'
              : 'bg-white/5 border-white/10 hover:border-gold/40'
          }`}
        >
          <div
            className={`p-3 rounded-lg ${
              channel === 'Sms' ? 'bg-gold text-black' : 'bg-white/10 text-slate-muted'
            }`}
          >
            <Phone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-slate-muted font-semibold">Mobile SMS</p>
            <p className="text-sm font-medium text-white truncate">{maskedPhone || 'Registered Phone'}</p>
          </div>
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              channel === 'Sms' ? 'border-gold' : 'border-white/30'
            }`}
          >
            {channel === 'Sms' && <div className="w-2 h-2 rounded-full bg-gold" />}
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={onSendCode}
        disabled={loading}
        className="w-full py-3.5 px-4 bg-gold hover:bg-gold-hover text-black font-semibold rounded-xl tracking-wide transition-all shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          'Send Code'
        )}
      </button>
    </div>
  );
}

'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-24 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="text-xs uppercase tracking-[0.3em] text-red-400 font-semibold">
          System Interruption
        </span>

        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
          An Unexpected Error Occurred
        </h1>

        <p className="text-sm text-slate-muted leading-relaxed">
          {error.message || 'We could not complete your luxury portal request. Please attempt to re-establish the connection.'}
        </p>

        <div className="pt-2 flex justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    </main>
  );
}

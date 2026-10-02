import React from 'react';
import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-24 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/40 flex items-center justify-center text-gold mx-auto shadow-gold-glow">
          <Compass className="w-8 h-8 text-gold" />
        </div>

        <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">
          Error 404
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Page Not Located
        </h1>

        <p className="text-sm text-slate-muted leading-relaxed">
          The requested luxury estate or private portal page does not exist or has been relocated to another address.
        </p>

        <div className="pt-2 flex justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow"
          >
            <Home className="w-4 h-4" />
            <span>Return to Portfolio</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

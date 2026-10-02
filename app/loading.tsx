import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin shadow-gold-glow" />
      <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold animate-pulse">
        Accessing Luxury Portfolio...
      </span>
    </div>
  );
}

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtext?: string;
  highlight?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtext,
  highlight = false,
}: StatCardProps) {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all ${
        highlight
          ? 'bg-gold/10 border-gold/40 shadow-gold-glow'
          : 'bg-obsidian-card border-white/10 hover:border-gold/30'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider text-slate-muted font-medium">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
          <Icon className="w-5 h-5 text-gold" />
        </div>
      </div>
      <div className="font-serif text-3xl font-bold text-white tracking-tight mb-1">
        {value}
      </div>
      {subtext && (
        <p className="text-xs text-slate-muted font-light">{subtext}</p>
      )}
    </div>
  );
}

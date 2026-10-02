import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'emerald' | 'cyan' | 'red' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'gold', className = '' }: BadgeProps) {
  const variantStyles = {
    gold: 'bg-gold/15 text-gold border-gold/30',
    emerald: 'bg-emerald/15 text-emerald-light border-emerald/30',
    cyan: 'bg-cyan-electric/15 text-cyan-electric border-cyan-electric/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    neutral: 'bg-white/10 text-slate-muted border-white/15',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase border backdrop-blur-xs ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

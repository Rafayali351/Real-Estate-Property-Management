import React from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-obsidian-card border border-gold/30 rounded-2xl p-8 sm:p-10 shadow-card-glass backdrop-blur-md">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">
          REAL ESTATE PRIVILEGE
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-muted mt-2 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

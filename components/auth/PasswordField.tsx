'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  required?: boolean;
}

export function PasswordField({
  id = 'password',
  label = 'Password',
  value,
  onChange,
  placeholder = 'Enter secure password',
  showStrength = false,
  required = true,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Compute password strength (0 to 4)
  const computeStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = computeStrength(value);

  const getStrengthLabel = (s: number) => {
    if (!value) return '';
    if (s <= 2) return 'Weak';
    if (s <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (s: number) => {
    if (s <= 2) return 'bg-red-500';
    if (s <= 4) return 'bg-gold';
    return 'bg-emerald';
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold focus:ring-1 focus:ring-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none transition-all pr-11"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-muted hover:text-white p-1 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showStrength && value && (
        <div className="pt-1.5 space-y-1">
          <div className="flex gap-1 h-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`flex-1 rounded-full transition-all duration-300 ${
                  level <= strength ? getStrengthColor(strength) : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-slate-muted">
            <span>Strength: <strong className="text-white">{getStrengthLabel(strength)}</strong></span>
            <span>8+ chars with upper, lower, number, symbol</span>
          </div>
        </div>
      )}
    </div>
  );
}

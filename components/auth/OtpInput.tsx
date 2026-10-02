'use client';

import React, { useRef, useState, useEffect } from 'react';

interface OtpInputProps {
  onComplete: (code: string) => void;
  loading: boolean;
  error?: string;
  remainingAttempts?: number;
  destination: string;
  onResend: () => void;
  onChangeChannel: () => void;
  shake?: boolean;
}

export function OtpInput({
  onComplete,
  loading,
  error,
  remainingAttempts,
  destination,
  onResend,
  onChangeChannel,
  shake = false,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // 5:00 Countdown timer
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  // 60-second resend cooldown
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    // Focus first input on mount
    inputsRef.current[0]?.focus();

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance
    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      onComplete(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const pasteDigits = pasted.split('');
      setDigits(pasteDigits);
      inputsRef.current[5]?.focus();
      onComplete(pasted);
    }
  };

  const handleResendClick = () => {
    if (resendCooldown > 0 || loading) return;
    setResendCooldown(60);
    setTimeLeft(300);
    setDigits(['', '', '', '', '', '']);
    inputsRef.current[0]?.focus();
    onResend();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-white">Enter the 6-Digit Code</h2>
        <p className="text-xs text-slate-muted mt-1">
          Dispatched to <span className="text-gold font-medium">{destination}</span>
        </p>
        <p className="text-xs text-slate-sub mt-1">
          Code expires in: <span className="text-white font-mono">{formatCountdown(timeLeft)}</span>
        </p>
      </div>

      {/* 6 Input Boxes */}
      <div className={`flex items-center justify-between gap-2 sm:gap-3 ${shake ? 'animate-shake' : ''}`}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            disabled={loading || timeLeft === 0}
            className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl bg-obsidian-charcoal border transition-all outline-none ${
              error
                ? 'border-red-500 text-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                : digit
                ? 'border-gold text-white focus:border-gold focus:ring-1 focus:ring-gold'
                : 'border-white/15 text-white focus:border-gold/60 focus:ring-1 focus:ring-gold/50'
            }`}
          />
        ))}
      </div>

      {/* Error & Attempts */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
          <p className="text-xs text-red-400 font-medium">{error}</p>
          {remainingAttempts !== undefined && remainingAttempts > 0 && (
            <p className="text-xs text-red-300 mt-1">
              Remaining attempts: {remainingAttempts}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 pt-2 text-xs">
        <button
          type="button"
          onClick={handleResendClick}
          disabled={resendCooldown > 0 || loading}
          className="text-gold hover:underline disabled:opacity-40 disabled:no-underline font-medium"
        >
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
        </button>

        <button
          type="button"
          onClick={onChangeChannel}
          disabled={loading}
          className="text-slate-muted hover:text-white transition-colors"
        >
          Send to my phone/email instead
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-gold text-xs">
          <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span>Verifying credentials...</span>
        </div>
      )}
    </div>
  );
}

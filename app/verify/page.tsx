'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { ChannelSelector } from '@/components/auth/ChannelSelector';
import { OtpInput } from '@/components/auth/OtpInput';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function VerifyPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [step, setStep] = useState<'SELECT_CHANNEL' | 'ENTER_CODE'>('SELECT_CHANNEL');
  const [channel, setChannel] = useState<'Email' | 'Sms'>('Email');
  const [challengeToken, setChallengeToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [activeDestination, setActiveDestination] = useState('');

  const [loading, setLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | undefined>(undefined);
  const [shake, setShake] = useState(false);

  // Retrieve challenge session
  useEffect(() => {
    const token = sessionStorage.getItem('re_challenge_token');
    const email = sessionStorage.getItem('re_masked_email') || '';
    const phone = sessionStorage.getItem('re_masked_phone') || '';

    if (!token) {
      router.push('/login');
      return;
    }

    setChallengeToken(token);
    setMaskedEmail(email);
    setMaskedPhone(phone);
  }, [router]);

  // Step A: Send OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setVerifyError('');
    try {
      const res = await api.auth.sendOtp({
        challengeToken,
        channel,
      });

      setActiveDestination(res.destination || (channel === 'Email' ? maskedEmail : maskedPhone));
      toastSuccess(`Verification code dispatched to your ${channel}.`);
      setStep('ENTER_CODE');
    } catch (err: any) {
      toastError(err.message || "We couldn't send the code, try the other option.");
    } finally {
      setLoading(false);
    }
  };

  // Step B: Verify OTP Code
  const handleVerifyCode = async (code: string) => {
    setLoading(true);
    setVerifyError('');
    setShake(false);

    try {
      const res = await api.auth.verifyOtp({
        challengeToken,
        code,
      });

      // Clear challenge session
      sessionStorage.removeItem('re_challenge_token');
      sessionStorage.removeItem('re_masked_email');
      sessionStorage.removeItem('re_masked_phone');

      toastSuccess(res.message || 'Authentication verified successfully.');

      // Refresh global user context
      await refreshUser();

      // Check stored post-login redirect
      const postLoginRedirect = sessionStorage.getItem('re_post_login_redirect');
      if (postLoginRedirect) {
        sessionStorage.removeItem('re_post_login_redirect');
        router.push(postLoginRedirect);
      } else {
        router.push(res.redirectUrl || '/');
      }
    } catch (err: any) {
      setShake(true);
      setVerifyError(err.message || 'Invalid code.');
      if (err.data?.remainingAttempts !== undefined) {
        setRemainingAttempts(err.data.remainingAttempts);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center py-20 px-4">
      <AuthCard
        title="2-Factor Verification"
        subtitle="Protecting your account with cryptographic multi-channel verification"
      >
        {step === 'SELECT_CHANNEL' ? (
          <ChannelSelector
            channel={channel}
            onSelectChannel={setChannel}
            maskedEmail={maskedEmail}
            maskedPhone={maskedPhone}
            onSendCode={handleSendOtp}
            loading={loading}
          />
        ) : (
          <OtpInput
            destination={activeDestination}
            onComplete={handleVerifyCode}
            loading={loading}
            error={verifyError}
            remainingAttempts={remainingAttempts}
            shake={shake}
            onResend={handleSendOtp}
            onChangeChannel={() => {
              setStep('SELECT_CHANNEL');
              setVerifyError('');
            }}
          />
        )}
      </AuthCard>
    </main>
  );
}

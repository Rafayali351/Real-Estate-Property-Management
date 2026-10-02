'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar, Clock, User, Mail, Phone } from 'lucide-react';

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number;
  propertyTitle: string;
}

export function TourModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
}: TourModalProps) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen && !date) {
      setDate(minDateStr);
    }
  }, [isOpen, date, minDateStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onClose();
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }

    if (!date || !time) {
      error('Please select both a date and time for your private viewing.');
      return;
    }

    const preferredDateTime = new Date(`${date}T${time}:00Z`).toISOString();

    setLoading(true);
    try {
      const res = await api.tours.book({
        propertyId,
        preferredDate: preferredDateTime,
        notes,
        clientName: user.fullName,
        clientEmail: user.email,
        clientPhone: user.phone,
      });

      success(res.message || 'Tour viewing scheduled! Check your inbox for confirmation.');
      onClose();
    } catch (err: any) {
      error(err.message || 'Could not schedule tour. Please try another time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Private Viewing"
      subtitle={`Exclusive concierge appointment for ${propertyTitle}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info (Readonly) */}
        {user ? (
          <div className="p-4 rounded-xl bg-obsidian-charcoal border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-muted">
              <User className="w-4 h-4 text-gold shrink-0" />
              <span className="text-white font-medium">{user.fullName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-muted">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <span className="text-white">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-muted">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <span className="text-white">{user.phone}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 text-xs text-gold">
            You must be signed in to schedule a private viewing. You will be redirected to log in.
          </div>
        )}

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Preferred Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={minDateStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
              <Calendar className="w-4 h-4 text-slate-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Preferred Time
            </label>
            <div className="relative">
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              >
                <option value="10:00">10:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="17:00">05:00 PM</option>
              </select>
              <Clock className="w-4 h-4 text-slate-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
            Special Requests / Private Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Inform our concierge of security protocols, arrival details, or key focus areas..."
            className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white placeholder-slate-sub outline-none"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/15 text-slate-muted hover:text-white transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-black font-semibold rounded-xl tracking-wide transition-all shadow-gold-glow disabled:opacity-50 text-sm flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Confirm Appointment'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

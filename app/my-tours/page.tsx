'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { TourBooking } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatPrice } from '@/lib/format';
import { Calendar, Clock, MapPin, XCircle, Compass } from 'lucide-react';

export default function MyToursPage() {
  const [tours, setTours] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { success, error } = useToast();

  const loadTours = async () => {
    setLoading(true);
    try {
      const data = await api.tours.getMy();
      setTours(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, []);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await api.tours.cancel(cancelId);
      success('Tour booking cancelled.');
      setCancelId(null);
      await loadTours();
    } catch (err: any) {
      error(err.message || 'Could not cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'emerald';
      case 'Completed':
        return 'gold';
      case 'Cancelled':
        return 'red';
      default:
        return 'cyan';
    }
  };

  return (
    <main className="py-24 px-4 sm:px-6 max-w-5xl mx-auto w-full">
      <div className="mb-10 border-b border-white/10 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Client Area
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1">
          Private Tour Bookings
        </h1>
        <p className="text-xs text-slate-muted mt-1">
          Manage and review your scheduled private viewings and concierge appointments.
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-obsidian-card border border-white/5 rounded-2xl flex gap-6">
              <Skeleton className="w-40 h-28 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tours.length === 0 && (
        <div className="text-center py-20 bg-obsidian-card border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-gold mx-auto mb-4 opacity-70" />
          <h3 className="font-serif text-xl font-bold text-white mb-2">No Tour Bookings Scheduled</h3>
          <p className="text-xs text-slate-muted mb-6">
            You haven't requested any estate viewings yet. Explore our portfolio to book a private tour.
          </p>
          <Link
            href="/properties"
            className="inline-block px-5 py-2.5 bg-gold text-black rounded-xl text-xs uppercase tracking-wider font-semibold shadow-gold-glow hover:bg-gold-hover transition-all"
          >
            Explore Estates
          </Link>
        </div>
      )}

      {!loading && tours.length > 0 && (
        <div className="space-y-4">
          {tours.map((tour) => (
            <div
              key={tour.bookingId}
              className="p-6 bg-obsidian-card border border-white/10 hover:border-gold/30 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-card-glass"
            >
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Property Thumbnail */}
                <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                  <Image
                    src={tour.propertyImageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'}
                    alt={tour.propertyTitle}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant={statusVariant(tour.status)}>{tour.status}</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <Link
                    href={`/properties/${tour.propertyId}`}
                    className="font-serif text-lg font-bold text-white hover:text-gold transition-colors block"
                  >
                    {tour.propertyTitle}
                  </Link>

                  <p className="flex items-center gap-1.5 text-xs text-slate-muted">
                    <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{tour.propertyAddress}, {tour.propertyCity}</span>
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gold font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Scheduled for: {formatDateTime(tour.preferredDate)}</span>
                  </div>

                  {tour.notes && (
                    <p className="text-xs text-slate-sub italic">
                      Private Note: "{tour.notes}"
                    </p>
                  )}

                  {tour.adminNote && (
                    <div className="p-2 rounded bg-gold/10 border-l-2 border-gold text-xs text-white">
                      <strong>Concierge Note:</strong> {tour.adminNote}
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
                <span className="font-serif text-base font-bold text-gold">
                  {formatPrice(tour.propertyPrice)}
                </span>

                {(tour.status === 'Pending' || tour.status === 'Confirmed') && (
                  <button
                    onClick={() => setCancelId(tour.bookingId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Appointment</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelId !== null}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Viewing Appointment"
        message="Are you sure you wish to cancel this private tour appointment? Our concierge team will be notified."
        confirmLabel="Cancel Appointment"
        isDestructive={true}
        loading={cancelling}
      />
    </main>
  );
}

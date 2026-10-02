'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { TourBooking } from '@/lib/types';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format';
import { CheckCircle2, XCircle, CheckSquare, Search, Clock, User, Phone, Mail, FileText } from 'lucide-react';

export default function AdminBookingsPage() {
  const { success, error } = useToast();

  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Booking Drawer/Modal
  const [selectedBooking, setSelectedBooking] = useState<TourBooking | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.tours.getAll({
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        pageSize: 12,
      });
      setBookings(data.items);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      error(err.message || 'Could not load tour bookings.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, error]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedBooking) return;
    setUpdating(true);
    try {
      await api.admin.tours.updateStatus(selectedBooking.bookingId, {
        status,
        adminNote: adminNote.trim() || undefined,
      });
      success(`Tour booking updated to ${status}. Notification email sent.`);
      setSelectedBooking(null);
      setAdminNote('');
      await loadBookings();
    } catch (err: any) {
      error(err.message || 'Failed to update tour booking.');
    } finally {
      setUpdating(false);
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

  const columns = [
    {
      header: 'Property',
      accessor: (b: TourBooking) => (
        <div>
          <p className="font-semibold text-white truncate max-w-[220px]">{b.propertyTitle}</p>
          <p className="text-[11px] text-slate-muted">{b.propertyCity}</p>
        </div>
      ),
    },
    {
      header: 'Client',
      accessor: (b: TourBooking) => (
        <div>
          <p className="text-white font-medium">{b.clientName}</p>
          <p className="text-slate-muted">{b.clientPhone}</p>
        </div>
      ),
    },
    {
      header: 'Requested Date',
      accessor: (b: TourBooking) => (
        <span className="text-gold font-medium">{formatDateTime(b.preferredDate)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (b: TourBooking) => (
        <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
      ),
    },
    {
      header: 'Manage',
      className: 'text-right',
      accessor: (b: TourBooking) => (
        <button
          onClick={() => {
            setSelectedBooking(b);
            setAdminNote(b.adminNote || '');
          }}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-gold/15 text-slate-muted hover:text-gold text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Review & Action
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Appointment Desk
          </span>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight mt-1">
            Private Tour Bookings
          </h1>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 bg-obsidian-card border border-white/10 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center px-3 py-2 bg-obsidian-charcoal border border-white/15 focus-within:border-gold rounded-xl">
          <Search className="w-4 h-4 text-gold shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, or estate title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-sub outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-obsidian-charcoal border border-white/15 rounded-xl text-xs text-white outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending Confirmation</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        loading={loading}
        emptyMessage="No tour appointments matching filter criteria."
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Booking Review Drawer / Modal */}
      {selectedBooking && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBooking(null)}
          title="Review Private Viewing Request"
          subtitle={`Booking Reference #${selectedBooking.bookingId}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-6">
            {/* Booking Details Card */}
            <div className="p-4 rounded-xl bg-obsidian-charcoal border border-white/10 space-y-3 text-xs">
              <div className="flex justify-between items-start pb-2 border-b border-white/10">
                <div>
                  <span className="text-slate-muted block">Estate Listing</span>
                  <h4 className="font-serif text-base font-bold text-white">
                    {selectedBooking.propertyTitle}
                  </h4>
                  <p className="text-slate-muted">{selectedBooking.propertyAddress}, {selectedBooking.propertyCity}</p>
                </div>
                <Badge variant={statusVariant(selectedBooking.status)}>
                  {selectedBooking.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-muted flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gold" />
                    <span>Client Name:</span>
                  </span>
                  <p className="font-semibold text-white">{selectedBooking.clientName}</p>
                </div>

                <div>
                  <span className="text-slate-muted flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <span>Mobile Phone:</span>
                  </span>
                  <p className="font-semibold text-white">{selectedBooking.clientPhone}</p>
                </div>

                <div>
                  <span className="text-slate-muted flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gold" />
                    <span>Email Address:</span>
                  </span>
                  <p className="font-semibold text-white">{selectedBooking.clientEmail}</p>
                </div>

                <div>
                  <span className="text-slate-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span>Preferred Date:</span>
                  </span>
                  <p className="font-semibold text-gold">{formatDateTime(selectedBooking.preferredDate)}</p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-slate-muted block mb-1">Client Private Note:</span>
                  <p className="text-white italic bg-black/40 p-2.5 rounded-lg border border-white/5">
                    "{selectedBooking.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Optional Concierge Admin Note */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Concierge Message / Internal Protocol Note (Included in notification email)
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Confirmed for 11:30 AM. Gate security pass pre-authorized under Malik Jahangir."
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl border border-white/15 text-slate-muted hover:text-white text-xs font-semibold uppercase tracking-wider"
              >
                Close
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus('Cancelled')}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancel Tour
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus('Confirmed')}
                className="px-4 py-2 bg-emerald/20 text-emerald-light hover:bg-emerald/30 border border-emerald/40 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Confirm Appointment
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus('Completed')}
                className="px-4 py-2 bg-gold hover:bg-gold-hover text-black font-semibold rounded-xl text-xs uppercase tracking-wider shadow-gold-glow transition-all disabled:opacity-50"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Inquiry } from '@/lib/types';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format';
import { Search, Mail, Reply, Send } from 'lucide-react';

export default function AdminInquiriesPage() {
  const { success, error } = useToast();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Inquiry Drawer/Modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.inquiries.getAll({
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        pageSize: 12,
      });
      setInquiries(data.items);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      error(err.message || 'Could not load client inquiries.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, error]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleOpenInquiry = async (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setReplyMessage(inq.replyMessage || '');

    // If "New", mark as "Read" on server
    if (inq.status === 'New') {
      try {
        await api.admin.inquiries.updateStatus(inq.inquiryId, 'Read');
        inq.status = 'Read';
        await loadInquiries();
      } catch {
        // ignore
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyMessage.trim()) return;

    setReplying(true);
    try {
      const res = await api.admin.inquiries.reply(selectedInquiry.inquiryId, replyMessage.trim());
      success(res.message || 'Reply dispatched to client inbox.');
      setSelectedInquiry(null);
      setReplyMessage('');
      await loadInquiries();
    } catch (err: any) {
      error(err.message || 'Failed to dispatch reply.');
    } finally {
      setReplying(false);
    }
  };

  const columns = [
    {
      header: 'Sender',
      accessor: (i: Inquiry) => (
        <div>
          <p className="font-semibold text-white">{i.name}</p>
          <p className="text-[11px] text-slate-muted">{i.email}</p>
          {i.phone && <p className="text-[11px] text-slate-sub">{i.phone}</p>}
        </div>
      ),
    },
    {
      header: 'Subject & Preview',
      accessor: (i: Inquiry) => (
        <div className="max-w-md">
          <p className="font-semibold text-white truncate">{i.subject}</p>
          <p className="text-[11px] text-slate-muted line-clamp-1 italic">"{i.message}"</p>
        </div>
      ),
    },
    {
      header: 'Received',
      accessor: (i: Inquiry) => (
        <span className="text-slate-muted text-xs">{formatDateTime(i.createdAt)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (i: Inquiry) => (
        <Badge
          variant={
            i.status === 'New'
              ? 'cyan'
              : i.status === 'Replied'
              ? 'emerald'
              : 'neutral'
          }
        >
          {i.status}
        </Badge>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      accessor: (i: Inquiry) => (
        <button
          onClick={() => handleOpenInquiry(i)}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-gold/15 text-slate-muted hover:text-gold text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Open & Reply
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Inbound Communications
          </span>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight mt-1">
            Client Inquiries & Correspondence
          </h1>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 bg-obsidian-card border border-white/10 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center px-3 py-2 bg-obsidian-charcoal border border-white/15 focus-within:border-gold rounded-xl">
          <Search className="w-4 h-4 text-gold shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search by sender name, email, subject, or message..."
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
          <option value="">All Inquiries</option>
          <option value="New">New (Unread)</option>
          <option value="Read">Read</option>
          <option value="Replied">Replied</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={inquiries}
        loading={loading}
        emptyMessage="No client inquiries found matching filter."
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Inquiry Detail & Reply Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInquiry(null)}
          title={selectedInquiry.subject}
          subtitle={`From ${selectedInquiry.name} (${selectedInquiry.email})`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-6">
            {/* Sender Meta */}
            <div className="p-4 rounded-xl bg-obsidian-charcoal border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-muted">
                <span>Received: {formatDateTime(selectedInquiry.createdAt)}</span>
                <Badge variant={selectedInquiry.status === 'Replied' ? 'emerald' : 'cyan'}>
                  {selectedInquiry.status}
                </Badge>
              </div>
              {selectedInquiry.phone && (
                <p className="text-white">Phone: {selectedInquiry.phone}</p>
              )}
            </div>

            {/* Original Message */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-wider text-slate-muted font-semibold">
                Client's Confidential Inquiry:
              </span>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-white leading-relaxed whitespace-pre-line">
                {selectedInquiry.message}
              </div>
            </div>

            {/* If Already Replied: Display Past Reply */}
            {selectedInquiry.replyMessage && (
              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-wider text-emerald-light font-semibold flex items-center gap-1.5">
                  <Reply className="w-3.5 h-3.5" />
                  <span>Previous Reply Dispatched {selectedInquiry.repliedAt ? `on ${formatDateTime(selectedInquiry.repliedAt)}` : ''}:</span>
                </span>
                <div className="p-4 rounded-xl bg-emerald/10 border border-emerald/30 text-xs text-white leading-relaxed whitespace-pre-line">
                  {selectedInquiry.replyMessage}
                </div>
              </div>
            )}

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-4 pt-2 border-t border-white/10">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                  {selectedInquiry.replyMessage ? 'Send Another Reply' : 'Dispatch Email Reply'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Compose your response to the client. This will be formatted as a luxury branded HTML email and dispatched directly to their address..."
                  className="w-full px-4 py-3 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 rounded-xl border border-white/15 text-slate-muted hover:text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={replying}
                  className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow disabled:opacity-50 flex items-center gap-2"
                >
                  {replying ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Email Reply</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

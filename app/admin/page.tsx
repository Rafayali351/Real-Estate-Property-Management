'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { AdminDashboard } from '@/lib/types';
import { StatCard } from '@/components/admin/StatCard';
import { BarChart } from '@/components/admin/BarChart';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/format';
import {
  Building2,
  Calendar,
  MessageSquare,
  Users2,
  CheckCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin
      .getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Executive Cockpit
          </span>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight mt-1">
            Operations & Analytics
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/properties"
            className="px-4 py-2 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow"
          >
            + Add New Estate
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Properties"
          value={data.totalProperties}
          icon={Building2}
          subtext="Active listings on site"
        />
        <StatCard
          title="Available Now"
          value={data.availableProperties}
          icon={CheckCircle}
          subtext="Open for acquisition"
          highlight={true}
        />
        <StatCard
          title="Pending Tours"
          value={data.pendingTours}
          icon={Calendar}
          subtext="Awaiting concierge review"
        />
        <StatCard
          title="New Inquiries"
          value={data.newInquiries}
          icon={MessageSquare}
          subtext="Unread inbound messages"
        />
        <StatCard
          title="Clients & Investors"
          value={data.registeredClients}
          icon={Users2}
          subtext="Registered portfolio users"
        />
      </div>

      {/* 30-Day SVG Booking Demand Bar Chart */}
      <BarChart data={data.bookingsTrend} />

      {/* Latest Bookings & Inquiries Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Bookings */}
        <div className="p-6 rounded-2xl bg-obsidian-card border border-white/10 space-y-4 shadow-card-glass">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-serif text-base font-bold text-white">
              Recent Tour Bookings
            </h3>
            <Link
              href="/admin/bookings"
              className="text-xs text-gold hover:underline flex items-center gap-1 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentBookings.length === 0 ? (
              <p className="text-xs text-slate-muted py-4 text-center">No bookings recorded yet.</p>
            ) : (
              data.recentBookings.map((b) => (
                <div
                  key={b.bookingId}
                  className="p-3.5 rounded-xl bg-obsidian-charcoal border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white truncate max-w-[200px]">
                      {b.propertyTitle}
                    </p>
                    <p className="text-slate-muted">
                      {b.clientName} • {b.clientPhone}
                    </p>
                    <p className="text-[11px] text-gold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateTime(b.preferredDate)}</span>
                    </p>
                  </div>
                  <Badge
                    variant={
                      b.status === 'Confirmed'
                        ? 'emerald'
                        : b.status === 'Cancelled'
                        ? 'red'
                        : 'cyan'
                    }
                  >
                    {b.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Inquiries */}
        <div className="p-6 rounded-2xl bg-obsidian-card border border-white/10 space-y-4 shadow-card-glass">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-serif text-base font-bold text-white">
              Recent Client Inquiries
            </h3>
            <Link
              href="/admin/inquiries"
              className="text-xs text-gold hover:underline flex items-center gap-1 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentInquiries.length === 0 ? (
              <p className="text-xs text-slate-muted py-4 text-center">No inquiries received yet.</p>
            ) : (
              data.recentInquiries.map((inq) => (
                <div
                  key={inq.inquiryId}
                  className="p-3.5 rounded-xl bg-obsidian-charcoal border border-white/5 flex items-start justify-between text-xs"
                >
                  <div className="space-y-1 max-w-[260px]">
                    <p className="font-semibold text-white">{inq.subject}</p>
                    <p className="text-slate-muted">
                      {inq.name} ({inq.email})
                    </p>
                    <p className="text-[11px] text-slate-sub line-clamp-1 italic">
                      "{inq.message}"
                    </p>
                  </div>
                  <Badge variant={inq.status === 'New' ? 'cyan' : inq.status === 'Replied' ? 'emerald' : 'neutral'}>
                    {inq.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

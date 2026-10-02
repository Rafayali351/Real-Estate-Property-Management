'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PublicStats } from '@/lib/types';
import { Building2, Award, MapPin, Users } from 'lucide-react';

export default function StatsCounter() {
  const [stats, setStats] = useState<PublicStats>({
    activeListings: 12,
    soldOrRented: 2,
    citiesCovered: 5,
    registeredClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stats
      .get()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {
        // preserve defaults
      })
      .finally(() => setLoading(false));
  }, []);

  const items = [
    {
      label: 'Active Trophy Listings',
      value: stats.activeListings,
      icon: Building2,
      sub: 'Verified architectural estates',
    },
    {
      label: 'Acquisitions Completed',
      value: stats.soldOrRented,
      icon: Award,
      sub: 'Sold & leased records',
    },
    {
      label: 'Prime Metropolitan Markets',
      value: stats.citiesCovered,
      icon: MapPin,
      sub: 'Key luxury territories',
    },
    {
      label: 'Private Clients & Investors',
      value: stats.registeredClients,
      icon: Users,
      sub: 'Authenticated network members',
    },
  ];

  return (
    <section className="py-16 bg-obsidian-black border-y border-gold/15 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-obsidian-card/60 border border-white/5 hover:border-gold/30 transition-all text-center flex flex-col items-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-gold-glow">
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <div className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight mb-1">
                  {loading ? (
                    <span className="opacity-50">...</span>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </div>
                <p className="text-xs uppercase tracking-wider text-gold font-semibold mb-1">
                  {item.label}
                </p>
                <p className="text-[11px] text-slate-muted font-light">
                  {item.sub}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

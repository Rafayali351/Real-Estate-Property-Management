'use client';

import React, { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import { PropertyGrid } from '@/components/PropertyGrid';
import StatsCounter from '@/components/StatsCounter';
import AgentShowcase from '@/components/AgentShowcase';
import { ContactForm } from '@/components/ContactForm';
import { useSettings } from '@/context/SettingsContext';
import { api } from '@/lib/api';
import { PropertySummary } from '@/lib/types';
import { MapPin, Phone, Mail, MessageSquare, Compass, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    api.properties
      .getAll({ isFeatured: true, pageSize: 6 })
      .then((res) => {
        if (res && res.items) {
          setFeaturedProperties(res.items);
        }
      })
      .catch(() => {
        // handled gracefully
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1">
      {/* 1. Hero Showcase */}
      <Hero />

      {/* 2. Stats Indicator Bar */}
      <StatsCounter />

      {/* 3. Featured Trophy Properties */}
      <PropertyGrid
        properties={featuredProperties}
        loading={loading}
        title="Featured Trophy Residences"
        subtitle="Exclusive prime architectural acquisitions currently available in our portfolio"
        showViewAll={true}
      />

      {/* 4. Luxury Private Client Advisory Showcase */}
      <AgentShowcase />

      {/* 5. Concierge & Contact Section */}
      <section id="contact" className="py-24 bg-obsidian-black border-t border-gold/15 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Brand Statement & Contact Details */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-[0.25em] mb-3">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Private Consultation</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  Connect with our Concierge Desk
                </h2>
                <p className="text-slate-muted text-sm leading-relaxed font-light">
                  Whether acquiring a generational palace, structuring a discreet private lease, or seeking tailored off-market opportunities, our senior principals await your communication.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-obsidian-card border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-muted font-semibold">
                      Executive Headquarters
                    </h3>
                    <p className="text-sm font-medium text-white mt-0.5">
                      {settings.address || 'Diplomatic Enclave, Sector G-5, Islamabad, Pakistan'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-obsidian-card border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-muted font-semibold">
                      Private Telephony
                    </h3>
                    <p className="text-sm font-medium text-white mt-0.5">
                      {settings.contactPhone || '+92 300 0000000'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-obsidian-card border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-muted font-semibold">
                      Encrypted Dispatch
                    </h3>
                    <p className="text-sm font-medium text-white mt-0.5">
                      {settings.contactEmail || 'concierge@realestate.com'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald/10 border border-emerald/30 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-light shrink-0" />
                <p className="text-xs text-emerald-light font-medium">
                  All communications and acquisition inquiries are governed by institutional non-disclosure protections.
                </p>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7 bg-obsidian-card border border-gold/30 rounded-2xl p-6 sm:p-10 shadow-card-glass backdrop-blur-md">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
                Initiate Confidential Inquiry
              </h3>
              <p className="text-xs text-slate-muted mb-8">
                Transmit your details below. A dedicated real estate advisor will respond within 4 business hours.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

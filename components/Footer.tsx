'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { Compass, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

export default function Footer() {
  const { settings } = useSettings();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-obsidian-black border-t border-gold/20 text-slate-muted text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/40 flex items-center justify-center text-gold shadow-gold-glow">
                <Compass className="w-4 h-4 text-gold" />
              </div>
              <span className="font-serif text-lg font-bold tracking-[0.2em] text-white uppercase">
                {settings.companyName || 'REAL ESTATE'}
              </span>
            </Link>
            <p className="text-slate-muted text-xs leading-relaxed">
              {settings.tagline || 'Curating the finest residential estates, architectural masterworks, and waterfront sanctuaries across Pakistan.'}
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-serif text-white font-semibold text-xs uppercase tracking-widest mb-4 text-gold">
              Properties
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/properties?listingType=Sale" className="hover:text-gold transition-colors">
                  Private Estates for Sale
                </Link>
              </li>
              <li>
                <Link href="/properties?listingType=Rent" className="hover:text-gold transition-colors">
                  Luxury Residences for Lease
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=Penthouse" className="hover:text-gold transition-colors">
                  Sky Penthouses
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=Villa" className="hover:text-gold transition-colors">
                  Waterfront & Hillside Villas
                </Link>
              </li>
            </ul>
          </div>

          {/* Key Territories */}
          <div>
            <h4 className="font-serif text-white font-semibold text-xs uppercase tracking-widest mb-4 text-gold">
              Prime Locations
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/properties?city=Islamabad" className="hover:text-gold transition-colors">
                  Islamabad (Margalla, G-5, Diplomatic)
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Lahore" className="hover:text-gold transition-colors">
                  Lahore (DHA Phase 5 & 6, Gulberg)
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Karachi" className="hover:text-gold transition-colors">
                  Karachi (Clifton Marine, DHA Phase 8)
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Gwadar" className="hover:text-gold transition-colors">
                  Gwadar Waterfront District
                </Link>
              </li>
            </ul>
          </div>

          {/* Private Concierge Desk */}
          <div>
            <h4 className="font-serif text-white font-semibold text-xs uppercase tracking-widest mb-4 text-gold">
              Concierge Desk
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span className="text-white font-medium">{settings.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald transition-colors"
                >
                  WhatsApp: {settings.whatsAppNumber}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span className="text-slate-muted">{settings.contactEmail}</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span className="text-slate-muted leading-tight">{settings.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-sub text-[11px]">
          <p>© {new Date().getFullYear()} {settings.companyName || 'REAL ESTATE'}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/properties" className="hover:text-gold transition-colors">
              Portfolio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Building, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function Hero() {
  const router = useRouter();
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [listingType, setListingType] = useState<'All' | 'Sale' | 'Rent'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.properties.getCities().then(setCities).catch(() => {
      setCities(['Islamabad', 'Lahore', 'Karachi', 'Rawalpindi', 'Gwadar']);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (selectedType) params.set('propertyType', selectedType);
    if (listingType !== 'All') params.set('listingType', listingType);
    if (searchTerm.trim()) params.set('search', searchTerm.trim());

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 overflow-hidden bg-obsidian-charcoal">
      {/* Ambient Luxury Lighting Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-electric/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Grid Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center z-10">
        {/* Prestige Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs uppercase tracking-[0.25em] font-semibold mb-6 animate-fadeIn">
          <span>Private Client Portfolio</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
          Exquisite Estates,{' '}
          <span className="italic font-normal bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
            Unrivaled Living.
          </span>
        </h1>

        <p className="text-slate-muted text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Access an exclusive collection of trophy architectural residences, sky penthouses, and private coastal sanctuaries across Pakistan.
        </p>

        {/* Filter / Search Bar */}
        <div className="bg-obsidian-card/90 border border-gold/30 rounded-2xl p-4 sm:p-6 shadow-card-glass backdrop-blur-xl max-w-4xl mx-auto text-left">
          {/* Listing Type Tabs */}
          <div className="flex gap-2 mb-4 border-b border-white/10 pb-3">
            {[
              { id: 'All', label: 'All Estates' },
              { id: 'Sale', label: 'For Acquisition' },
              { id: 'Rent', label: 'For Private Lease' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setListingType(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                  listingType === tab.id
                    ? 'bg-gold text-black shadow-gold-glow'
                    : 'text-slate-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Controls Grid */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* City */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium">
                Location
              </label>
              <div className="relative flex items-center bg-obsidian-charcoal border border-white/15 rounded-xl px-3 py-2.5 focus-within:border-gold">
                <MapPin className="w-4 h-4 text-gold shrink-0 mr-2" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent text-xs text-white outline-none cursor-pointer"
                >
                  <option value="" className="bg-obsidian-card text-white">All Locations</option>
                  {cities.map((c) => (
                    <option key={c} value={c} className="bg-obsidian-card text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Typology */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium">
                Typology
              </label>
              <div className="relative flex items-center bg-obsidian-charcoal border border-white/15 rounded-xl px-3 py-2.5 focus-within:border-gold">
                <Building className="w-4 h-4 text-gold shrink-0 mr-2" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-transparent text-xs text-white outline-none cursor-pointer"
                >
                  <option value="" className="bg-obsidian-card text-white">All Typologies</option>
                  <option value="Mansion" className="bg-obsidian-card text-white">Mansion / Palace</option>
                  <option value="Penthouse" className="bg-obsidian-card text-white">Sky Penthouse</option>
                  <option value="Villa" className="bg-obsidian-card text-white">Hillside / Waterfront Villa</option>
                  <option value="Modern Estate" className="bg-obsidian-card text-white">Modern Architectural Estate</option>
                  <option value="Apartment" className="bg-obsidian-card text-white">Luxury Apartment</option>
                </select>
              </div>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium">
                Keyword / Society
              </label>
              <div className="relative flex items-center bg-obsidian-charcoal border border-white/15 rounded-xl px-3 py-2.5 focus-within:border-gold">
                <Search className="w-4 h-4 text-gold shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. Margalla, DHA, Seafront"
                  className="w-full bg-transparent text-xs text-white placeholder-slate-sub outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow flex items-center justify-center gap-2"
              >
                <span>Search Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

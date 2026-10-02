'use client';

import React from 'react';
import Link from 'next/link';
import { PropertySummary } from '@/lib/types';
import { PropertyCard } from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowRight, Compass } from 'lucide-react';

interface PropertyGridProps {
  properties: PropertySummary[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function PropertyGrid({
  properties,
  loading = false,
  title = 'Featured Trophy Estates',
  subtitle = 'Curated residences commanding prime architectural significance',
  showViewAll = true,
}: PropertyGridProps) {
  return (
    <section id="properties" className="py-20 bg-obsidian-charcoal px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Curated Portfolio
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-muted mt-2 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {showViewAll && (
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-gold hover:text-gold-light group transition-colors"
            >
              <span>Explore All Residences</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-obsidian-card border border-white/5 rounded-2xl overflow-hidden p-4 space-y-4"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real Property Cards Grid */}
        {!loading && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => (
              <PropertyCard key={prop.propertyId} property={prop} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-20 bg-obsidian-card/40 border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
            <Compass className="w-12 h-12 text-gold mx-auto mb-4 opacity-80" />
            <h3 className="font-serif text-xl font-bold text-white mb-2">No Properties Found</h3>
            <p className="text-xs text-slate-muted mb-6 leading-relaxed">
              No matching listings were found for your current filter criteria. Explore our full portfolio or contact our private concierge desk.
            </p>
            <Link
              href="/properties"
              className="inline-block px-5 py-2.5 bg-gold text-black rounded-xl text-xs uppercase tracking-wider font-semibold shadow-gold-glow hover:bg-gold-hover transition-all"
            >
              Reset Filters
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

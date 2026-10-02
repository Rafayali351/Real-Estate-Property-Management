'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { PropertySummary, PagedResult } from '@/lib/types';
import { PropertyCard } from '@/components/PropertyCard';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Search,
  MapPin,
  Building,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function PropertiesListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [listingType, setListingType] = useState(searchParams.get('listingType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [isFeatured, setIsFeatured] = useState(searchParams.get('isFeatured') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Data States
  const [cities, setCities] = useState<string[]>([]);
  const [result, setResult] = useState<PagedResult<PropertySummary>>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 9,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load cities once
  useEffect(() => {
    api.properties.getCities().then(setCities).catch(() => {});
  }, []);

  // Fetch properties whenever filters or page changes
  const fetchListing = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.properties.getAll({
        search: search || undefined,
        city: city || undefined,
        propertyType: propertyType || undefined,
        listingType: listingType || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        isFeatured: isFeatured ? true : undefined,
        sortBy: sortBy || undefined,
        page,
        pageSize: 9,
      });
      setResult(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [search, city, propertyType, listingType, minPrice, maxPrice, bedrooms, isFeatured, sortBy, page]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  // Sync to URL
  const syncToUrl = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (propertyType) params.set('propertyType', propertyType);
    if (listingType) params.set('listingType', listingType);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (isFeatured) params.set('isFeatured', 'true');
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    if (page > 1) params.set('page', String(page));

    router.replace(`/properties?${params.toString()}`, { scroll: false });
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    syncToUrl();
    fetchListing();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCity('');
    setPropertyType('');
    setListingType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setIsFeatured(false);
    setSortBy('newest');
    setPage(1);
    router.replace('/properties', { scroll: false });
  };

  return (
    <main className="py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-10 text-center sm:text-left border-b border-white/10 pb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Luxury Portfolio Directory
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight mt-2">
          Curated Private Residences
        </h1>
        <p className="text-sm text-slate-muted mt-2 max-w-2xl">
          Search and explore authenticated trophy architectural estates, hillside sanctuaries, and sky penthouses across Pakistan.
        </p>
      </div>

      {/* Filter Bar Controls */}
      <form onSubmit={handleApplyFilter} className="bg-obsidian-card border border-white/10 rounded-2xl p-6 mb-10 shadow-card-glass space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium">
              Search Text
            </label>
            <div className="flex items-center px-3 py-2.5 bg-obsidian-charcoal border border-white/15 focus-within:border-gold rounded-xl">
              <Search className="w-4 h-4 text-gold shrink-0 mr-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title, landmark, sector..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-sub outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium">
              City / Territory
            </label>
            <div className="flex items-center px-3 py-2.5 bg-obsidian-charcoal border border-white/15 focus-within:border-gold rounded-xl">
              <MapPin className="w-4 h-4 text-gold shrink-0 mr-2" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                <option value="" className="bg-obsidian-card">All Locations</option>
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-obsidian-card">{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium">
              Typology
            </label>
            <div className="flex items-center px-3 py-2.5 bg-obsidian-charcoal border border-white/15 focus-within:border-gold rounded-xl">
              <Building className="w-4 h-4 text-gold shrink-0 mr-2" />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                <option value="" className="bg-obsidian-card">All Typologies</option>
                <option value="Mansion" className="bg-obsidian-card">Mansion / Palace</option>
                <option value="Penthouse" className="bg-obsidian-card">Sky Penthouse</option>
                <option value="Villa" className="bg-obsidian-card">Villa</option>
                <option value="Modern Estate" className="bg-obsidian-card">Modern Estate</option>
                <option value="Apartment" className="bg-obsidian-card">Apartment</option>
              </select>
            </div>
          </div>

          {/* Listing Type */}
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium">
              Acquisition Type
            </label>
            <div className="flex items-center px-3 py-2.5 bg-obsidian-charcoal border border-white/15 focus-within:border-gold rounded-xl">
              <SlidersHorizontal className="w-4 h-4 text-gold shrink-0 mr-2" />
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="w-full bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                <option value="" className="bg-obsidian-card">Buy or Rent</option>
                <option value="Sale" className="bg-obsidian-card">For Acquisition (Sale)</option>
                <option value="Rent" className="bg-obsidian-card">For Private Lease (Rent)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Second Row: Min Price, Max Price, Bedrooms, Sorting */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium mb-1">
              Min Price (PKR)
            </label>
            <input
              type="number"
              placeholder="e.g. 50000000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium mb-1">
              Max Price (PKR)
            </label>
            <input
              type="number"
              placeholder="e.g. 500000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium mb-1">
              Min Bedrooms
            </label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none"
            >
              <option value="" className="bg-obsidian-card">Any Beds</option>
              <option value="3" className="bg-obsidian-card">3+ Beds</option>
              <option value="4" className="bg-obsidian-card">4+ Beds</option>
              <option value="5" className="bg-obsidian-card">5+ Beds</option>
              <option value="6" className="bg-obsidian-card">6+ Beds</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-muted font-medium mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none"
            >
              <option value="newest" className="bg-obsidian-card">Newest Listed</option>
              <option value="price_asc" className="bg-obsidian-card">Price: Low to High</option>
              <option value="price_desc" className="bg-obsidian-card">Price: High to Low</option>
              <option value="featured" className="bg-obsidian-card">Featured First</option>
            </select>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-muted select-none">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded bg-obsidian-charcoal border-white/20 text-gold focus:ring-gold"
            />
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Show Featured Trophy Estates Only</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/15 text-slate-muted hover:text-white text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow"
            >
              Apply Criteria
            </button>
          </div>
        </div>
      </form>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between mb-8 text-xs text-slate-muted">
        <p>
          Showing <span className="text-white font-semibold">{result.items.length}</span> of{' '}
          <span className="text-white font-semibold">{result.totalCount}</span> verified luxury properties
        </p>
      </div>

      {/* Grid */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-obsidian-card border border-white/5 rounded-2xl p-4 space-y-4">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && result.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {result.items.map((prop) => (
            <PropertyCard key={prop.propertyId} property={prop} />
          ))}
        </div>
      )}

      {!loading && result.items.length === 0 && (
        <div className="text-center py-20 bg-obsidian-card border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
          <Building className="w-12 h-12 text-gold mx-auto mb-4 opacity-70" />
          <h3 className="font-serif text-xl font-bold text-white mb-2">No Matching Properties</h3>
          <p className="text-xs text-slate-muted mb-6 leading-relaxed">
            There are no active listings currently matching all selected criteria. Try adjusting or clearing your filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-gold text-black rounded-xl text-xs uppercase tracking-wider font-semibold shadow-gold-glow hover:bg-gold-hover transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && result.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={result.totalPages}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </main>
  );
}

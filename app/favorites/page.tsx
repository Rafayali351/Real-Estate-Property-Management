'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Favorite, PropertySummary } from '@/lib/types';
import { PropertyCard } from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Heart, Compass } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await api.favorites.getAll();
      setFavorites(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <main className="py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="mb-10 border-b border-white/10 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Client Area
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1">
          Saved Trophy Collection
        </h1>
        <p className="text-xs text-slate-muted mt-1">
          Private residences and architectural estates you have bookmarked for review.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-obsidian-card border border-white/5 rounded-2xl p-4 space-y-4">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && favorites.length === 0 && (
        <div className="text-center py-20 bg-obsidian-card border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-gold mx-auto mb-4 opacity-70" />
          <h3 className="font-serif text-xl font-bold text-white mb-2">No Saved Properties</h3>
          <p className="text-xs text-slate-muted mb-6">
            You haven't added any luxury estates to your favorites yet. Tap the heart icon on any listing to save it here.
          </p>
          <Link
            href="/properties"
            className="inline-block px-5 py-2.5 bg-gold text-black rounded-xl text-xs uppercase tracking-wider font-semibold shadow-gold-glow hover:bg-gold-hover transition-all"
          >
            Explore Estates
          </Link>
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((fav) => {
            const summary: PropertySummary = {
              propertyId: fav.propertyId,
              title: fav.title,
              price: fav.price,
              listingType: fav.listingType,
              address: fav.address,
              city: fav.city,
              propertyType: fav.propertyType,
              bedrooms: fav.bedrooms,
              bathrooms: fav.bathrooms,
              sqFt: fav.sqFt,
              imageUrl: fav.imageUrl,
              isFeatured: false,
              status: fav.status,
              createdAt: fav.createdAt,
            };
            return <PropertyCard key={fav.propertyId} property={summary} isFavorited={true} />;
          })}
        </div>
      )}
    </main>
  );
}

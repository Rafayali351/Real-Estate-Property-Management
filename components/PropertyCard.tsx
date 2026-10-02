import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { PropertySummary } from '@/lib/types';
import { formatPriceCompact } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { FavoriteButton } from '@/components/FavoriteButton';

interface PropertyCardProps {
  property: PropertySummary;
  isFavorited?: boolean;
}

export function PropertyCard({ property, isFavorited }: PropertyCardProps) {
  const statusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'emerald';
      case 'reserved':
        return 'cyan';
      case 'sold':
      case 'rented':
        return 'neutral';
      default:
        return 'gold';
    }
  };

  return (
    <div className="property-card group relative flex flex-col bg-obsidian-card border border-white/10 hover:border-gold/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-card-glass hover:-translate-y-1">
      {/* Cover Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-obsidian-black">
        <Image
          src={property.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2">
          {property.isFeatured && (
            <Badge variant="gold">Featured</Badge>
          )}
          <Badge variant={statusVariant(property.status)}>{property.status}</Badge>
          <Badge variant="neutral">{property.listingType}</Badge>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <FavoriteButton propertyId={property.propertyId} initialFavorited={isFavorited} />
        </div>

        {/* Price on Image Bottom */}
        <div className="absolute bottom-3 left-4 right-4 flex items-baseline justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-muted font-medium">Price</span>
            <p className="font-serif text-xl sm:text-2xl font-bold text-gold drop-shadow-md">
              {formatPriceCompact(property.price)}
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded bg-black/60 text-white/90 backdrop-blur-xs border border-white/10">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Details Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <Link href={`/properties/${property.propertyId}`} className="block group-hover:text-gold transition-colors">
            <h3 className="font-serif text-lg font-semibold text-white line-clamp-1">
              {property.title}
            </h3>
          </Link>

          <p className="flex items-center gap-1.5 text-xs text-slate-muted mt-2">
            <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="truncate">{property.address}, {property.city}</span>
          </p>
        </div>

        {/* Specs footer */}
        <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-white/10 text-xs text-slate-muted">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-gold/80 shrink-0" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-gold/80 shrink-0" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4 text-gold/80 shrink-0" />
            <span>{property.sqFt?.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
}

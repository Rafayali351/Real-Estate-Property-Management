'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PropertyDetail } from '@/lib/types';
import { PropertyGallery } from '@/components/PropertyGallery';
import { PropertyCard } from '@/components/PropertyCard';
import { FavoriteButton } from '@/components/FavoriteButton';
import { TourModal } from '@/components/TourModal';
import { ContactForm } from '@/components/ContactForm';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/format';
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { info } = useToast();

  const propertyId = Number(params.id);
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  useEffect(() => {
    if (!propertyId || isNaN(propertyId)) return;
    setLoading(true);

    api.properties
      .getById(propertyId)
      .then((data) => {
        setProperty(data);
      })
      .catch(() => {
        router.push('/properties');
      })
      .finally(() => setLoading(false));
  }, [propertyId, router]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      info('Private property link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <main className="py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-8">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!property) return null;

  return (
    <main className="py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-12">
      {/* Top Back Nav & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-muted hover:text-gold transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-gold/40 text-slate-muted hover:text-white transition-colors"
            title="Share listing"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <FavoriteButton propertyId={property.propertyId} initialFavorited={property.isFavorited} />
        </div>
      </div>

      {/* Main Grid: Gallery + Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Gallery */}
          <PropertyGallery
            coverImage={property.imageUrl}
            images={property.images}
            title={property.title}
          />

          {/* Title, Badges & Price Header */}
          <div className="border-b border-white/10 pb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {property.isFeatured && <Badge variant="gold">Featured Trophy Estate</Badge>}
              <Badge variant="emerald">{property.status}</Badge>
              <Badge variant="neutral">{property.listingType}</Badge>
              <Badge variant="cyan">{property.propertyType}</Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {property.title}
                </h1>
                <p className="flex items-center gap-1.5 text-xs text-slate-muted mt-2">
                  <MapPin className="w-4 h-4 text-gold shrink-0" />
                  <span>{property.address}, {property.city}, Pakistan</span>
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs uppercase tracking-wider text-slate-muted font-medium">Acquisition Price</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-gold drop-shadow-md">
                  {formatPrice(property.price)}
                </p>
              </div>
            </div>
          </div>

          {/* Key Specifications Bar */}
          <div className="grid grid-cols-3 gap-4 p-6 rounded-2xl bg-obsidian-card border border-white/10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-2">
                <Bed className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl font-bold text-white">{property.bedrooms}</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-muted">Bedrooms</span>
            </div>

            <div className="flex flex-col items-center border-x border-white/10">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-2">
                <Bath className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl font-bold text-white">{property.bathrooms}</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-muted">Bathrooms</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-2">
                <Square className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl font-bold text-white">{property.sqFt?.toLocaleString()}</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-muted">Total Sq. Ft.</span>
            </div>
          </div>

          {/* Architectural Description */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-white tracking-wide">
              Architectural Overview & Highlights
            </h2>
            <div className="text-sm leading-relaxed text-slate-muted font-light whitespace-pre-line space-y-4">
              {property.description}
            </div>
          </div>

          {/* Ask About This Property Inquiry Form */}
          <div className="p-8 rounded-2xl bg-obsidian-card border border-gold/30 shadow-card-glass space-y-4">
            <h3 className="font-serif text-xl font-bold text-white">
              Ask About {property.title}
            </h3>
            <p className="text-xs text-slate-muted">
              Connect directly with our private transaction specialists regarding this estate.
            </p>
            <ContactForm
              propertyId={property.propertyId}
              propertyTitle={property.title}
            />
          </div>
        </div>

        {/* Right Column: Actions & Assigned Advisor */}
        <div className="lg:col-span-4 space-y-6 sticky top-28">
          {/* Action Card */}
          <div className="p-6 rounded-2xl bg-obsidian-card border border-gold/40 shadow-card-glass space-y-4">
            <h3 className="font-serif text-lg font-semibold text-white">
              Private Estate Concierge
            </h3>
            <p className="text-xs text-slate-muted leading-relaxed">
              Schedule an exclusive on-site appointment with verified security and private parking.
            </p>

            <button
              onClick={() => setTourModalOpen(true)}
              className="w-full py-3.5 px-4 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Private Tour</span>
            </button>
          </div>

          {/* Assigned Advisor Card */}
          {property.agent && (
            <div className="p-6 rounded-2xl bg-obsidian-card border border-white/10 space-y-4 shadow-card-glass">
              <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
                Exclusive Listing Advisor
              </span>

              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black shrink-0 border border-gold/30">
                  <Image
                    src={property.agent.profileImgUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'}
                    alt={property.agent.fullName}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-white">
                    {property.agent.fullName}
                  </h4>
                  <p className="text-xs text-gold font-medium mt-0.5">
                    {property.agent.specialization}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-muted leading-relaxed line-clamp-3 font-light">
                {property.agent.bio}
              </p>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <a
                  href={`tel:${property.agent.phone}`}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-muted hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>{property.agent.phone}</span>
                </a>

                <a
                  href={`mailto:${property.agent.email}`}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-muted hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span className="truncate">{property.agent.email}</span>
                </a>

                <a
                  href={`https://wa.me/${property.agent.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald/10 hover:bg-emerald/20 text-emerald-light transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>Direct WhatsApp Channel</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Properties Section */}
      {property.similarProperties && property.similarProperties.length > 0 && (
        <div className="pt-12 border-t border-white/10 space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Comparable Architecture
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Similar Trophy Residences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {property.similarProperties.map((similar) => (
              <PropertyCard key={similar.propertyId} property={similar} />
            ))}
          </div>
        </div>
      )}

      {/* Tour Booking Modal */}
      <TourModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        propertyId={property.propertyId}
        propertyTitle={property.title}
      />
    </main>
  );
}

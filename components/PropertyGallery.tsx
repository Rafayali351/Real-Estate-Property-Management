'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PropertyImage } from '@/lib/types';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyGalleryProps {
  coverImage: string;
  images: PropertyImage[];
  title: string;
}

export function PropertyGallery({ coverImage, images, title }: PropertyGalleryProps) {
  const allImages = [coverImage, ...images.map((img) => img.imageUrl)].filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="space-y-3">
      {/* Featured Main Image */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-obsidian-black border border-white/10 group cursor-pointer">
        <Image
          src={allImages[selectedIndex] || coverImage}
          alt={`${title} - View ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 75vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onClick={() => setLightboxOpen(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-4 right-4 p-3 rounded-full bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/20 hover:border-gold"
          aria-label="Open fullscreen gallery"
        >
          <Maximize2 className="w-5 h-5 text-gold" />
        </button>

        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/20 hover:border-gold"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/20 hover:border-gold"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                selectedIndex === idx ? 'border-gold shadow-gold-glow scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
            aria-label="Close fullscreen gallery"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative w-full max-w-6xl aspect-[16/10] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[selectedIndex]}
              alt={`${title} fullscreen`}
              fill
              className="object-contain"
            />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/70 text-white hover:border-gold border border-white/20 transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/70 text-white hover:border-gold border border-white/20 transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

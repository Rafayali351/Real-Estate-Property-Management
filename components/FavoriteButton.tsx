'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface FavoriteButtonProps {
  propertyId: number;
  initialFavorited?: boolean;
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

export function FavoriteButton({
  propertyId,
  initialFavorited = false,
  className = '',
  onToggle,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isFavorited) {
        await api.favorites.remove(propertyId);
        setIsFavorited(false);
        success('Removed from saved properties');
        onToggle?.(false);
      } else {
        await api.favorites.add(propertyId);
        setIsFavorited(true);
        success('Saved to your private collection');
        onToggle?.(true);
      }
    } catch (err: any) {
      error(err.message || 'Could not update favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
      className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
        isFavorited
          ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
          : 'bg-black/50 text-white/80 border border-white/20 hover:text-white hover:bg-black/70 hover:border-gold/50'
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${isFavorited ? 'fill-red-400 scale-110' : ''}`}
      />
    </button>
  );
}

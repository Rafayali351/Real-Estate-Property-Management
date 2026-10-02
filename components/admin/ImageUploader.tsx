'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { UploadCloud, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: 'properties' | 'agents';
  label?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = 'properties',
  label = 'Cover Image',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error, success } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      error('Image exceeds 5MB size limit.');
      return;
    }

    setUploading(true);
    try {
      const res = await api.admin.uploads.upload(file, folder);
      onChange(res.url);
      success('Image uploaded successfully.');
    } catch (err: any) {
      error(err.message || 'Image upload failed. Must be JPG, PNG, or WEBP.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
        {label}
      </label>

      {value ? (
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-gold/40 group bg-black">
          <Image src={value} alt="Uploaded image" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:text-red-400 border border-white/20 transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[16/9] w-full rounded-2xl border-2 border-dashed border-white/15 hover:border-gold/50 bg-obsidian-charcoal/50 flex flex-col items-center justify-center cursor-pointer transition-colors p-6 text-center group"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gold">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">Uploading to secure storage...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-gold-glow">
                <UploadCloud className="w-6 h-6 text-gold" />
              </div>
              <p className="text-xs font-medium text-white mb-1">
                Click to browse or drop image here
              </p>
              <p className="text-[11px] text-slate-sub">
                Supports genuine JPG, PNG, WEBP (Max 5 MB)
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings } from '@/lib/types';
import { api } from '@/lib/api';

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  companyName: 'REAL ESTATE',
  tagline: 'Exclusive Luxury Residences & Private Estates',
  contactEmail: 'concierge@realestate.com',
  contactPhone: '+92 300 0000000',
  whatsAppNumber: '+92 300 0000000',
  address: 'Diplomatic Enclave, Sector G-5, Islamabad, Pakistan',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  linkedinUrl: 'https://linkedin.com',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await api.settings.get();
      if (data && data.companyName) {
        setSettings(data);
      }
    } catch {
      // fallback to default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

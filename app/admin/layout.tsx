'use client';

import React from 'react';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-charcoal flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <span className="text-xs uppercase tracking-widest text-gold font-semibold">
          Authenticating Executive Session...
        </span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // AuthContext handles redirect to /login
  }

  return (
    <div className="min-h-screen bg-obsidian-charcoal text-white flex">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar />

      {/* Main Admin Content Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-8 pt-20 lg:pt-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

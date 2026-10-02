'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users2,
  Calendar,
  MessageSquare,
  UserCheck,
  Settings,
  Compass,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Properties', href: '/admin/properties', icon: Building2 },
    { label: 'Advisors & Agents', href: '/admin/agents', icon: Users2 },
    { label: 'Tour Bookings', href: '/admin/bookings', icon: Calendar },
    { label: 'Client Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { label: 'Registered Users', href: '/admin/users', icon: UserCheck },
    { label: 'Site Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-obsidian-card border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/40 flex items-center justify-center text-gold">
            <Compass className="w-4 h-4 text-gold" />
          </div>
          <span className="font-serif font-bold text-white text-sm tracking-wider uppercase">
            Admin Console
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-muted hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-obsidian-card border-r border-white/10 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/40 flex items-center justify-center text-gold shadow-gold-glow">
                <Compass className="w-5 h-5 text-gold" />
              </div>
              <div>
                <span className="font-serif font-bold text-white text-sm tracking-widest block uppercase">
                  REAL ESTATE
                </span>
                <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
                  Executive Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-gold text-black font-semibold shadow-gold-glow'
                      : 'text-slate-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Portal Links */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-muted hover:text-gold hover:bg-white/5 transition-colors border border-white/5"
          >
            <span>Public Showcase</span>
            <ExternalLink className="w-3.5 h-3.5 text-gold" />
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-obsidian-charcoal border border-white/5">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Administrator'}</p>
              <p className="text-[10px] text-slate-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Logout"
              className="p-1.5 text-slate-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

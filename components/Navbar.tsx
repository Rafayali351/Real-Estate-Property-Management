'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import {
  Menu,
  X,
  Compass,
  Heart,
  Calendar,
  User,
  ShieldAlert,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { settings } = useSettings();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Suppress public navbar inside the dedicated /admin area
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-obsidian-charcoal/90 backdrop-blur-md border-b border-gold/20 py-3 shadow-card-glass'
          : 'bg-transparent border-b border-white/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/40 flex items-center justify-center text-gold group-hover:scale-105 transition-transform shadow-gold-glow">
            <Compass className="w-5 h-5 text-gold" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-[0.2em] text-white uppercase group-hover:text-gold transition-colors">
              {settings.companyName || 'REAL ESTATE'}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-muted font-medium -mt-1">
              Private Estates & Concierge
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-semibold text-slate-muted">
          <Link
            href="/"
            className={`hover:text-gold transition-colors ${
              pathname === '/' ? 'text-gold' : ''
            }`}
          >
            Home
          </Link>
          <Link
            href="/properties"
            className={`hover:text-gold transition-colors ${
              pathname.startsWith('/properties') ? 'text-gold' : ''
            }`}
          >
            Estates & Penthouses
          </Link>
          <a
            href="/#agents"
            className="hover:text-gold transition-colors"
          >
            Private Advisors
          </a>
          <a
            href="/#contact"
            className="hover:text-gold transition-colors"
          >
            Concierge Desk
          </a>
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            /* User Dropdown */
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-obsidian-card border border-white/15 hover:border-gold/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gold text-black flex items-center justify-center font-bold text-xs uppercase shadow-gold-glow">
                  {user.fullName ? user.fullName[0] : 'U'}
                </div>
                <span className="text-xs font-medium text-white max-w-[120px] truncate">
                  {user.fullName.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-muted" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-obsidian-card border border-gold/30 rounded-2xl shadow-card-glass py-2 z-50 animate-fadeIn"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
                    <p className="text-[11px] text-slate-muted truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gold hover:bg-gold/10 font-semibold transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-gold" />
                      <span>Admin Management</span>
                    </Link>
                  )}

                  <Link
                    href="/my-tours"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-muted hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-gold" />
                    <span>My Tour Bookings</span>
                  </Link>

                  <Link
                    href="/favorites"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-muted hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-gold" />
                    <span>Saved Favorites</span>
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-muted hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-gold" />
                    <span>Profile Settings</span>
                  </Link>

                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs uppercase tracking-widest text-white hover:text-gold font-semibold transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-hover text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-gold-glow"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Schedule Tour CTA */}
          <Link
            href="/properties"
            className="hidden lg:inline-flex items-center px-4 py-2 rounded-xl border border-gold/40 hover:border-gold text-gold hover:bg-gold/10 font-medium text-xs tracking-wider uppercase transition-all"
          >
            Explore Portfolio
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-slate-muted hover:text-white"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-obsidian-card/95 border-b border-gold/20 px-6 py-6 space-y-4 backdrop-blur-xl">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-gold"
            >
              Home
            </Link>
            <Link
              href="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-gold"
            >
              All Properties
            </Link>
            <a
              href="/#agents"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-gold"
            >
              Private Advisors
            </a>
            <a
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-gold"
            >
              Contact Concierge
            </a>
          </nav>

          <div className="pt-4 border-t border-white/10 space-y-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gold text-sm font-semibold"
                  >
                    Admin Management
                  </Link>
                )}
                <Link
                  href="/my-tours"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-slate-muted hover:text-white text-sm"
                >
                  My Tour Bookings
                </Link>
                <Link
                  href="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-slate-muted hover:text-white text-sm"
                >
                  Saved Favorites
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-slate-muted hover:text-white text-sm"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="block text-red-400 text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-white/20 text-center text-xs font-semibold uppercase tracking-wider text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-gold text-black text-center text-xs font-semibold uppercase tracking-wider shadow-gold-glow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

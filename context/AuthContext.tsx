'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isClient: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isClient: false,
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const isAdmin = user?.role === 'Admin';
  const isClient = user?.role === 'Client' || isAdmin;

  // Route protection
  useEffect(() => {
    if (loading) return;

    // Admin protected routes
    if (pathname?.startsWith('/admin')) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (!isAdmin) {
        router.push('/');
      }
    }

    // Client protected routes
    const clientRoutes = ['/my-tours', '/favorites', '/profile'];
    if (clientRoutes.some((route) => pathname?.startsWith(route))) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [user, loading, pathname, isAdmin, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isClient,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

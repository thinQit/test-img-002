'use client';

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const value = useMemo<AuthContextValue>(() => ({ isAuthenticated: false }), []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

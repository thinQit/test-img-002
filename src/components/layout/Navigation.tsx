'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

const routes = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/admin', label: 'Admin Dashboard' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold">
          LensLight
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} className="text-sm text-secondary hover:text-foreground">
              {route.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Button variant="ghost" size="sm" onClick={logout}>Sign out</Button>
          )}
        </nav>
        <button
          className="md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <span className="block h-0.5 w-6 bg-foreground" />
          <span className="mt-1 block h-0.5 w-6 bg-foreground" />
          <span className="mt-1 block h-0.5 w-6 bg-foreground" />
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-2 px-6 py-4">
            {routes.map((route) => (
              <Link key={route.href} href={route.href} className="text-sm text-secondary hover:text-foreground" onClick={() => setOpen(false)}>
                {route.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={logout}>Sign out</Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navigation;

import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/layout/Navigation';
import AuthProvider from '@/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'LensLight',
  description: 'LensLight — a simple responsive portfolio landing page for a photographer with hero, gallery preview, about section, contact form, and an admin dashboard to manage photos and site content.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <Navigation />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

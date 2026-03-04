'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Photo, SiteContent } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

function stripHtml(html?: string | null) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
}

export default function HomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contentData, previewData] = await Promise.all([
          api.get<SiteContent>('/api/site/content'),
          api.get<{ photos: Photo[] }>('/api/gallery/preview?count=6')
        ]);
        setContent(contentData ?? null);
        setPhotos(previewData?.photos ?? []);
      } catch (_error) {
        setError('Unable to load the latest content.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const aboutExcerpt = useMemo(() => {
    const plain = stripHtml(content?.aboutHtml ?? '');
    return plain.length > 220 ? `${plain.slice(0, 220)}...` : plain;
  }, [content]);

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">LensLight Photography</p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {content?.heroTitle ?? 'Illuminate stories through light, texture, and emotion.'}
            </h1>
            <p className="text-lg text-secondary">
              LensLight is a minimalist portfolio for modern photographers—crafted to showcase cinematic visuals, highlight curated galleries, and streamline booking inquiries.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="primary" size="lg">
                <Link href="/gallery">View Gallery</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Book a Session</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-blue-100 blur-2xl opacity-60" />
            <img
              src={content?.heroImageUrl ?? '/images/hero.jpg'}
              alt="LensLight hero preview"
              className="relative h-[380px] w-full rounded-3xl object-cover shadow-xl"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">Latest Work</h2>
            <p className="mt-2 text-secondary">A curated preview from recent shoots and editorial collaborations.</p>
          </div>
          <Button asChild variant="ghost" size="md">
            <Link href="/gallery">See all</Link>
          </Button>
        </div>
        {loading ? (
          <div className="mt-8 flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <Card className="mt-8 p-6 text-center text-secondary">{error}</Card>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.length === 0 ? (
              <Card className="col-span-full p-8 text-center text-secondary">
                New photographs are being curated—check back soon.
              </Card>
            ) : (
              photos.map((photo) => (
                <Link key={photo.id} href="/gallery" className="group">
                  <Card className="overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={photo.thumbnailUrl ?? photo.url ?? ''}
                        alt={photo.title ?? 'Gallery preview'}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold">{photo.title ?? 'Untitled'}</p>
                      <p className="text-sm text-secondary">{photo.caption ?? 'Editorial & lifestyle series.'}</p>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </section>

      <section className="bg-muted">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">About the Photographer</h2>
            <p className="text-secondary">
              {aboutExcerpt ||
                'LensLight blends documentary storytelling with fine-art sensibilities. Each frame is crafted to feel timeless, intimate, and grounded in authentic emotion.'}
            </p>
            <Button asChild variant="secondary" size="md">
              <Link href="/about">Read the full story</Link>
            </Button>
          </div>
          <div className="relative">
            <img
              src="/images/feature.jpg"
              alt="LensLight photographer portrait"
              className="h-[320px] w-full rounded-2xl object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-semibold">Why LensLight</h2>
        <p className="mt-2 text-secondary">Everything you need to elevate a photography portfolio and convert visitors into clients.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Curated Galleries',
              description: 'Showcase full projects with tags, filters, and immersive lightbox previews.'
            },
            {
              title: 'Editable Site Content',
              description: 'Update hero and about copy directly from the admin dashboard in seconds.'
            },
            {
              title: 'Booking Inquiries',
              description: 'Capture leads with a validated contact form and organized message inbox.'
            },
            {
              title: 'Admin Control',
              description: 'Manage publishing status, captions, and metadata for every photo.'
            }
          ].map((feature) => (
            <Card key={feature.title} className="p-6">
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-secondary">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-foreground text-white">
        <div className="absolute inset-0">
          <img
            src="/images/cta.jpg"
            alt="LensLight booking backdrop"
            className="h-full w-full object-cover opacity-30"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold">Ready to book your next shoot?</h2>
            <p className="mt-2 text-white/80">Let’s craft imagery that feels cinematic, modern, and unmistakably you.</p>
          </div>
          <Button asChild variant="primary" size="lg">
            <Link href="/contact">Start a project</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-secondary md:flex-row">
          <div className="font-semibold text-foreground">LensLight</div>
          <div className="flex gap-6">
            <Link href="/gallery" className="hover:text-foreground">Gallery</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
          <div>© {new Date().getFullYear()} LensLight. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

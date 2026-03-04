'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SiteContent } from '@/types';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';

export default function AboutPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<SiteContent>('/api/site/content');
        setContent(data ?? null);
      } catch (_error) {
        setError('Unable to load the about story.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">About LensLight</h1>
        <p className="text-secondary">A photographer-led studio focused on emotive storytelling and editorial-grade visuals.</p>
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <Card className="mt-10 p-8 text-center text-secondary">{error}</Card>
      ) : (
        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_240px]">
          <div className="prose max-w-none text-foreground prose-p:text-secondary">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  content?.aboutHtml ??
                  '<p>LensLight combines natural light, intentional composition, and refined color grading to craft imagery with warmth and intimacy. Each session is designed collaboratively—from mood boards to location scouting—so the final story feels personal and enduring.</p><p>With experience in portraiture, brand storytelling, and editorial work, LensLight delivers visuals that elevate brands and preserve life’s most meaningful milestones.</p>'
              }}
            />
          </div>
          <div>
            <img
              src="/images/feature.jpg"
              alt="LensLight profile"
              className="h-[280px] w-full rounded-2xl object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      )}
    </div>
  );
}

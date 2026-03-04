'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Photo } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Photo | null>(null);

  const loadPhotos = async (nextPage: number, reset: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: String(nextPage),
        limit: '12',
        ...(tag ? { tag } : {})
      });
      const data = await api.get<{ photos: Photo[]; total: number; page: number; limit: number }>('/api/photos?' + query.toString());
      const nextPhotos = data?.photos ?? [];
      setTotal(data?.total ?? 0);
      setPhotos((prev) => (reset ? nextPhotos : [...prev, ...nextPhotos]));
    } catch (_error) {
      setError('Unable to load gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadPhotos(1, true);
  }, [tag]);

  useEffect(() => {
    if (page > 1) {
      loadPhotos(page, false);
    }
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && photos.length < total) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Gallery</h1>
          <p className="mt-2 text-secondary">Browse the full LensLight collection, filtered by project or mood.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-[220px]">
            <Input
              label="Filter by tag"
              value={tag}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTag(event.target.value)}
              placeholder="e.g. portrait, editorial"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => loadPhotos(1, true)}>
            Apply
          </Button>
        </div>
      </div>

      {loading && photos.length === 0 ? (
        <div className="mt-12 flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <Card className="mt-10 p-8 text-center text-secondary">{error}</Card>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.length === 0 ? (
            <Card className="col-span-full p-8 text-center text-secondary">No photos match the current filter.</Card>
          ) : (
            photos.map((photo) => (
              <button
                key={photo.id}
                className="group text-left"
                onClick={() => setSelected(photo)}
                aria-label={`Open ${photo.title ?? 'photo'} in lightbox`}
              >
                <Card className="overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={photo.thumbnailUrl ?? photo.url ?? ''}
                      alt={photo.title ?? 'Gallery image'}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">{photo.title ?? 'Untitled'}</p>
                    <p className="text-sm text-secondary">{photo.caption ?? 'Captured with LensLight signature tones.'}</p>
                  </div>
                </Card>
              </button>
            ))
          )}
        </div>
      )}

      {photos.length < total && !loading && (
        <div className="mt-10 flex justify-center">
          <Button onClick={handleLoadMore} variant="secondary">Load more</Button>
        </div>
      )}

      {loading && photos.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Spinner />
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? 'Photo preview'}>
        {selected && (
          <div className="space-y-4">
            <img
              src={selected.url ?? selected.thumbnailUrl ?? ''}
              alt={selected.title ?? 'Photo preview'}
              className="w-full rounded-lg object-cover"
              loading="lazy"
            />
            <div>
              <p className="text-sm text-secondary">{selected.caption ?? 'No caption provided.'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

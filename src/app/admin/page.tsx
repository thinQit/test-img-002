'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import type { ContactMessage, Photo, SiteContent } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const photoSchema = z.object({
  title: z.string().optional(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().optional()
});

export default function AdminPage() {
  const { user, login, isAuthenticated, loading: authLoading } = useAuth();
  const [loginValues, setLoginValues] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoForm, setPhotoForm] = useState({
    title: '',
    url: '',
    thumbnailUrl: '',
    caption: '',
    tags: '',
    published: false
  });

  const tagPreview = useMemo(
    () => photoForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    [photoForm.tags]
  );

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [photoData, messageData, contentData] = await Promise.all([
        api.get<{ photos: Photo[]; total: number }>('/api/photos?limit=50'),
        api.get<{ messages: ContactMessage[]; total: number }>('/api/contact/messages?limit=50'),
        api.get<SiteContent>('/api/site/content')
      ]);
      setPhotos(photoData?.photos ?? []);
      setMessages(messageData?.messages ?? []);
      setContent(contentData ?? null);
    } catch (_error) {
      setError('Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    const parsed = loginSchema.safeParse(loginValues);
    if (!parsed.success) {
      setLoginError('Please enter a valid email and password.');
      return;
    }
    const result = await login(loginValues.email, loginValues.password);
    if (!result) {
      setLoginError('Invalid credentials.');
    }
  };

  const handlePhotoSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = photoSchema.safeParse(photoForm);
    if (!parsed.success) return;

    try {
      await api.post<Photo>('/api/photos', {
        ...parsed.data,
        tags: tagPreview
      });
      setPhotoForm({ title: '', url: '', thumbnailUrl: '', caption: '', tags: '', published: false });
      fetchAdminData();
    } catch (_error) {
      setError('Unable to save photo.');
    }
  };

  const handleContentSave = async () => {
    if (!content) return;
    try {
      await api.put<SiteContent>('/api/site/content', content);
    } catch (_error) {
      setError('Unable to update site content.');
    }
  };

  const resolveMessage = async (id: string) => {
    try {
      await api.put<{ success: boolean }>(`/api/contact/messages/${id}/resolve`, {});
      fetchAdminData();
    } catch (_error) {
      setError('Unable to resolve message.');
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto flex max-w-4xl justify-center px-6 py-12">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-6 py-12">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold">Admin Sign In</h1>
          <p className="mt-2 text-sm text-secondary">Access photo management, site content, and messages.</p>
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <Input
              label="Email"
              type="email"
              value={loginValues.email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setLoginValues((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="admin@lenslight.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={loginValues.password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setLoginValues((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
            {loginError && <p className="text-sm text-error">{loginError}</p>}
            <Button type="submit" variant="primary" size="lg">Sign in</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      <div>
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-secondary">Welcome back, {user?.email}. Manage photos, site content, and messages.</p>
      </div>

      {error && <Card className="p-4 text-secondary">{error}</Card>}

      {loading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Upload New Photo</h2>
        <Card className="p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handlePhotoSubmit}>
            <Input
              label="Title"
              value={photoForm.title}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPhotoForm((prev) => ({ ...prev, title: event.target.value }))
              }
            />
            <Input
              label="Image URL"
              value={photoForm.url}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPhotoForm((prev) => ({ ...prev, url: event.target.value }))
              }
              required
            />
            <Input
              label="Thumbnail URL"
              value={photoForm.thumbnailUrl}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPhotoForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))
              }
            />
            <Input
              label="Tags (comma separated)"
              value={photoForm.tags}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPhotoForm((prev) => ({ ...prev, tags: event.target.value }))
              }
            />
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium" htmlFor="caption">Caption</label>
              <textarea
                id="caption"
                className="min-h-[90px] w-full rounded-md border border-border px-3 py-2 text-sm"
                value={photoForm.caption}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setPhotoForm((prev) => ({ ...prev, caption: event.target.value }))
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={photoForm.published}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setPhotoForm((prev) => ({ ...prev, published: event.target.checked }))
                }
              />
              Publish immediately
            </label>
            <div className="md:col-span-2">
              <Button type="submit" variant="primary">Save Photo</Button>
            </div>
          </form>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Photo Library</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {photos.length === 0 ? (
            <Card className="p-6 text-secondary">No photos available yet.</Card>
          ) : (
            photos.map((photo) => (
              <Card key={photo.id} className="flex gap-4 p-4">
                <img
                  src={photo.thumbnailUrl ?? photo.url ?? ''}
                  alt={photo.title ?? 'Photo thumbnail'}
                  className="h-20 w-24 rounded-md object-cover"
                />
                <div className="space-y-1">
                  <p className="font-semibold">{photo.title ?? 'Untitled'}</p>
                  <p className="text-xs text-secondary">{photo.published ? 'Published' : 'Draft'}</p>
                  <p className="text-xs text-secondary">{photo.caption ?? 'No caption'}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Site Content</h2>
        <Card className="p-6 space-y-4">
          <Input
            label="Hero Title"
            value={content?.heroTitle ?? ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setContent((prev) => ({
                id: prev?.id ?? 'default',
                heroTitle: event.target.value,
                heroImageUrl: prev?.heroImageUrl ?? '',
                aboutHtml: prev?.aboutHtml ?? '',
                metaTitle: prev?.metaTitle ?? '',
                metaDescription: prev?.metaDescription ?? ''
              }))
            }
          />
          <Input
            label="Hero Image URL"
            value={content?.heroImageUrl ?? ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setContent((prev) => ({
                id: prev?.id ?? 'default',
                heroTitle: prev?.heroTitle ?? '',
                heroImageUrl: event.target.value,
                aboutHtml: prev?.aboutHtml ?? '',
                metaTitle: prev?.metaTitle ?? '',
                metaDescription: prev?.metaDescription ?? ''
              }))
            }
          />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="about">About HTML</label>
            <textarea
              id="about"
              className="min-h-[120px] w-full rounded-md border border-border px-3 py-2 text-sm"
              value={content?.aboutHtml ?? ''}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setContent((prev) => ({
                  id: prev?.id ?? 'default',
                  heroTitle: prev?.heroTitle ?? '',
                  heroImageUrl: prev?.heroImageUrl ?? '',
                  aboutHtml: event.target.value,
                  metaTitle: prev?.metaTitle ?? '',
                  metaDescription: prev?.metaDescription ?? ''
                }))
              }
            />
          </div>
          <Input
            label="Meta Title"
            value={content?.metaTitle ?? ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setContent((prev) => ({
                id: prev?.id ?? 'default',
                heroTitle: prev?.heroTitle ?? '',
                heroImageUrl: prev?.heroImageUrl ?? '',
                aboutHtml: prev?.aboutHtml ?? '',
                metaTitle: event.target.value,
                metaDescription: prev?.metaDescription ?? ''
              }))
            }
          />
          <Input
            label="Meta Description"
            value={content?.metaDescription ?? ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setContent((prev) => ({
                id: prev?.id ?? 'default',
                heroTitle: prev?.heroTitle ?? '',
                heroImageUrl: prev?.heroImageUrl ?? '',
                aboutHtml: prev?.aboutHtml ?? '',
                metaTitle: prev?.metaTitle ?? '',
                metaDescription: event.target.value
              }))
            }
          />
          <Button variant="secondary" onClick={handleContentSave}>Save Content</Button>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Contact Messages</h2>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card className="p-6 text-secondary">No messages yet.</Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className="p-6 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{message.name ?? 'Unknown'} — {message.subject ?? 'Inquiry'}</p>
                    <p className="text-sm text-secondary">{message.email ?? 'N/A'}</p>
                  </div>
                  <div className="text-sm text-secondary">
                    {message.receivedAt ? new Date(message.receivedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <p className="text-sm text-secondary">{message.message ?? 'No message provided.'}</p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-secondary">{message.resolved ? 'Resolved' : 'Open'}</span>
                  {!message.resolved && (
                    <Button variant="outline" size="sm" onClick={() => resolveMessage(message.id)}>
                      Mark resolved
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

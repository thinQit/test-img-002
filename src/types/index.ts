export type Photo = {
  id: string;
  title?: string | null;
  caption?: string | null;
  url?: string | null;
  thumbnailUrl?: string | null;
  tags?: string | null;
  published?: boolean | null;
  createdAt?: string | Date | null;
};

export type ContactMessage = {
  id: string;
  name?: string | null;
  email?: string | null;
  subject?: string | null;
  message?: string | null;
  receivedAt?: string | Date | null;
  resolved?: boolean | null;
};

export type SiteContent = {
  id: string;
  heroTitle?: string | null;
  heroImageUrl?: string | null;
  aboutHtml?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type AdminUser = {
  id: string;
  email: string;
  passwordHash?: string;
  createdAt?: string | Date | null;
};

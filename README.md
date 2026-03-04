# LensLight

LensLight is a modern, responsive photography portfolio and admin dashboard built with Next.js 14. It features a rich landing page, full gallery, about section, contact form, and secure admin tools for managing photos, site content, and inquiries.

## Features
- Hero-driven landing page with gallery preview and CTA
- Full gallery with tag filtering, pagination, and lightbox preview
- About page with rich text support
- Contact form with validation and honeypot protection
- Admin dashboard for photos, site content, and messages
- JWT-based authentication for admin APIs

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM (SQLite)

## Getting Started
1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   ./install.sh
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev` — start dev server
- `npm run build` — generate Prisma client and build app
- `npm run start` — start production server
- `npm run lint` — run ESLint

## API Endpoints
- `GET /api/health`
- `GET /api/photos`
- `GET /api/photos/:id`
- `POST /api/photos` (admin)
- `PUT /api/photos/:id` (admin)
- `DELETE /api/photos/:id` (admin)
- `GET /api/gallery/preview`
- `GET /api/site/content`
- `PUT /api/site/content` (admin)
- `POST /api/contact`
- `GET /api/contact/messages` (admin)
- `PUT /api/contact/messages/:id/resolve` (admin)
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/register`
- `GET /api/auth/me`

## Notes
- Admin authentication uses JWT in the `Authorization: Bearer` header.
- Prisma uses SQLite by default. Update `DATABASE_URL` for production.

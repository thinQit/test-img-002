import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import type { Photo as PrismaPhoto } from '@prisma/client';

type AuthPayload = { id: string; email: string };

const photoSchema = z.object({
  title: z.string().optional(),
  caption: z.string().optional(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional()
});

function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializePhoto(photo: PrismaPhoto) {
  return {
    ...photo,
    tags: parseTags(photo.tags)
  };
}

async function getAuthPayload(request: NextRequest): Promise<AuthPayload | null> {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    if (typeof payload === 'object' && payload && 'id' in payload && 'email' in payload) {
      return { id: String(payload.id), email: String(payload.email) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '12');
    const tag = searchParams.get('tag');

    const authPayload = await getAuthPayload(request);
    const isAdmin = !!authPayload;

    const where = isAdmin ? {} : { published: true };
    const photos = await db.photo.findMany({ where, orderBy: { createdAt: 'desc' } });

    const filtered = tag
      ? photos.filter((photo) => parseTags(photo.tags).includes(tag))
      : photos;

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit).map(serializePhoto);

    return NextResponse.json({
      success: true,
      data: { photos: paginated, total, page, limit }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Failed to load photos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authPayload = await getAuthPayload(request);
    if (!authPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = photoSchema.parse(body);

    const created = await db.photo.create({
      data: {
        title: parsed.title,
        caption: parsed.caption,
        url: parsed.url,
        thumbnailUrl: parsed.thumbnailUrl,
        tags: JSON.stringify(parsed.tags || []),
        published: parsed.published ?? false
      }
    });

    return NextResponse.json({ success: true, data: serializePhoto(created) });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid photo payload.' }, { status: 400 });
  }
}

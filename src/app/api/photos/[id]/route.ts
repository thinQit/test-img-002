import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import type { Photo as PrismaPhoto } from '@prisma/client';

type AuthPayload = { id: string; email: string };

const updateSchema = z.object({
  title: z.string().optional(),
  caption: z.string().optional(),
  url: z.string().url().optional(),
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authPayload = await getAuthPayload(request);
  const photo = await db.photo.findUnique({ where: { id: params.id } });

  if (!photo || (!photo.published && !authPayload)) {
    return NextResponse.json({ success: false, error: 'Photo not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: serializePhoto(photo) });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authPayload = await getAuthPayload(request);
    if (!authPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const data: {
      title?: string;
      caption?: string;
      url?: string;
      thumbnailUrl?: string;
      tags?: string;
      published?: boolean;
    } = {
      title: parsed.title,
      caption: parsed.caption,
      url: parsed.url,
      thumbnailUrl: parsed.thumbnailUrl,
      published: parsed.published
    };

    if (parsed.tags) {
      data.tags = JSON.stringify(parsed.tags);
    }

    const updated = await db.photo.update({ where: { id: params.id }, data });

    return NextResponse.json({ success: true, data: serializePhoto(updated) });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid update payload.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    await db.photo.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Photo not found.' }, { status: 404 });
  }
}

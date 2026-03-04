import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Photo as PrismaPhoto } from '@prisma/client';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = Number(searchParams.get('count') || '6');

    const photos = await db.photo.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: count
    });

    return NextResponse.json({
      success: true,
      data: { photos: photos.map(serializePhoto) }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Failed to load preview.' }, { status: 500 });
  }
}

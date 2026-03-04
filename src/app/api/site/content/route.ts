import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

type AuthPayload = { id: string; email: string };

const contentSchema = z.object({
  heroTitle: z.string().optional(),
  heroImageUrl: z.string().optional(),
  aboutHtml: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

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
    const keysParam = searchParams.get('keys');
    const keys = keysParam ? keysParam.split(',').map((key) => key.trim()) : null;

    const content = await db.siteContent.findUnique({ where: { id: 'default' } });
    const payload =
      content ||
      ({
        id: 'default',
        heroTitle: '',
        heroImageUrl: '',
        aboutHtml: '',
        metaTitle: '',
        metaDescription: ''
      } as const);

    if (keys && content) {
      const filtered: Record<string, string> = { id: payload.id };
      keys.forEach((key) => {
        const value = payload[key as keyof typeof payload];
        if (typeof value === 'string') {
          filtered[key] = value;
        }
      });
      return NextResponse.json({ success: true, data: filtered });
    }

    return NextResponse.json({ success: true, data: payload });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Failed to load content.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authPayload = await getAuthPayload(request);
    if (!authPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = contentSchema.parse(body);

    const updated = await db.siteContent.upsert({
      where: { id: 'default' },
      update: parsed,
      create: { id: 'default', ...parsed }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid content payload.' }, { status: 400 });
  }
}

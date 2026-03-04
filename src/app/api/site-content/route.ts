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

export async function GET() {
  try {
    const content = await db.siteContent.findMany();
    return NextResponse.json({ success: true, data: content });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Failed to load site content.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authPayload = await getAuthPayload(request);
    if (!authPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = contentSchema.parse(body);

    const created = await db.siteContent.create({
      data: { id: 'default', ...parsed }
    });

    return NextResponse.json({ success: true, data: created });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid content payload.' }, { status: 400 });
  }
}

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

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const content = await db.siteContent.findUnique({ where: { id: params.id } });
  if (!content) {
    return NextResponse.json({ success: false, error: 'Content not found.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: content });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authPayload = await getAuthPayload(request);
    if (!authPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = contentSchema.parse(body);

    const updated = await db.siteContent.update({
      where: { id: params.id },
      data: parsed
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid content payload.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    await db.siteContent.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Content not found.' }, { status: 404 });
  }
}

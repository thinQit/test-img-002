import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

type AuthPayload = { id: string; email: string };

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  subject: z.string().optional(),
  message: z.string().min(10).optional(),
  resolved: z.boolean().optional()
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const message = await db.contactMessage.findUnique({ where: { id: params.id } });
  if (!message) {
    return NextResponse.json({ success: false, error: 'Message not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: message });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const updated = await db.contactMessage.update({
      where: { id: params.id },
      data: parsed
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid message payload.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    await db.contactMessage.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Message not found.' }, { status: 404 });
  }
}

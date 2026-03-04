import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

type AuthPayload = { id: string; email: string };

const messageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
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

export async function GET(request: NextRequest) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const messages = await db.contactMessage.findMany({ orderBy: { receivedAt: 'desc' } });
    return NextResponse.json({ success: true, data: messages });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Failed to load messages.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = messageSchema.parse(body);

    const created = await db.contactMessage.create({ data: parsed });
    return NextResponse.json({ success: true, data: created });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid message payload.' }, { status: 400 });
  }
}

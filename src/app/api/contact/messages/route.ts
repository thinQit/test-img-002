import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

type AuthPayload = { id: string; email: string };

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
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');

    const [messages, total] = await db.$transaction([
      db.contactMessage.findMany({
        orderBy: { receivedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.contactMessage.count()
    ]);

    return NextResponse.json({
      success: true,
      data: { messages, total, page, limit }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Failed to load messages.' }, { status: 500 });
  }
}

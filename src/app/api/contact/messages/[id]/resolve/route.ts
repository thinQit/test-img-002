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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    await db.contactMessage.update({
      where: { id: params.id },
      data: { resolved: true }
    });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Message not found.' }, { status: 404 });
  }
}

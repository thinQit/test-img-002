import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

type AuthPayload = { id: string; email: string };

function getAuthPayload(request: NextRequest): AuthPayload | null {
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
  const payload = getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const admin = await db.adminUser.findUnique({ where: { id: payload.id } });
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: { id: admin.id, email: admin.email } });
}

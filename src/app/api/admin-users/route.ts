import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, hashPassword, verifyToken } from '@/lib/auth';

type AuthPayload = { id: string; email: string };

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
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

  const admins = await db.adminUser.findMany({ select: { id: true, email: true } });
  return NextResponse.json({ success: true, data: admins });
}

export async function POST(request: NextRequest) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = adminSchema.parse(body);

    const existing = await db.adminUser.findUnique({ where: { email: parsed.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Admin already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.password);
    const admin = await db.adminUser.create({
      data: { email: parsed.email, passwordHash }
    });

    return NextResponse.json({ success: true, data: { id: admin.id, email: admin.email } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid admin payload.' }, { status: 400 });
  }
}

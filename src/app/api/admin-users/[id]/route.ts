import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, hashPassword, verifyToken } from '@/lib/auth';

type AuthPayload = { id: string; email: string };

const updateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional()
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

  const admin = await db.adminUser.findUnique({ where: { id: params.id } });
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { id: admin.id, email: admin.email } });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const data: { email?: string; passwordHash?: string } = {};
    if (parsed.email) data.email = parsed.email;
    if (parsed.password) data.passwordHash = await hashPassword(parsed.password);

    const updated = await db.adminUser.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, data: { id: updated.id, email: updated.email } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid admin payload.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    await db.adminUser.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Admin not found.' }, { status: 404 });
  }
}

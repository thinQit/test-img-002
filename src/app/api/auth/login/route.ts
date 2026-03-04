import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { signToken, verifyPassword } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);

    const admin = await db.adminUser.findUnique({ where: { email: parsed.email } });
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const valid = await verifyPassword(parsed.password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = signToken({ id: admin.id, email: admin.email });

    return NextResponse.json({
      success: true,
      data: { token, expiresIn: 86400 }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid login payload.' }, { status: 400 });
  }
}

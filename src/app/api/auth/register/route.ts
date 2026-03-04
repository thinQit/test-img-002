import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

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
    return NextResponse.json({ success: false, error: 'Invalid registration payload.' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
  honeypot: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.parse(body);

    if (parsed.honeypot) {
      return NextResponse.json({ success: true, data: { success: true, message: 'Thanks for reaching out.' } });
    }

    await db.contactMessage.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        subject: parsed.subject,
        message: parsed.message
      }
    });

    return NextResponse.json({
      success: true,
      data: { success: true, message: 'Message received.' }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Invalid contact payload.' }, { status: 400 });
  }
}

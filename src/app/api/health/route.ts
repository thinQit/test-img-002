import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: { status: 'ok', uptimeSeconds: Math.floor(process.uptime()) }
  });
}

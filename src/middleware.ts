export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*']
};

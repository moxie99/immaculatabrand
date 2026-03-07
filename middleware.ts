import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware
 * 
 * Note: Admin authentication is handled client-side via AdminAuthProvider and AdminLoginModal.
 * No server-side authentication middleware is needed for admin routes.
 * 
 * This file is kept to prevent Next.js warnings about missing middleware.
 */
export function middleware(_request: NextRequest) {
  // All requests pass through without modification
  return NextResponse.next();
}

// No specific routes need middleware protection
export const config = {
  matcher: []
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Admin Authentication Middleware
 * 
 * Protects all /admin routes with Basic Authentication.
 * Validates credentials against ADMIN_USERNAME and ADMIN_PASSWORD environment variables.
 * 
 * Note: This file uses process.env directly instead of the env module to maintain
 * testability with environment variable mocking in tests.
 */
export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    
    // No auth header provided - request authentication
    if (!authHeader) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"'
        }
      });
    }
    
    // Parse Basic Auth credentials
    try {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');
      
      const validUsername = process.env.ADMIN_USERNAME;
      const validPassword = process.env.ADMIN_PASSWORD;
      
      // Validate credentials
      if (username !== validUsername || password !== validPassword) {
        return new NextResponse('Invalid credentials', { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"'
          }
        });
      }
    } catch (error) {
      // Invalid auth header format
      return new NextResponse('Invalid authentication format', { 
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"'
        }
      });
    }
  }
  
  // Allow request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: '/admin/:path*'
};

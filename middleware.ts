import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Check for NextAuth session token
  const nextAuthToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Check for custom JWT token in cookies
  const customTokenCookie = request.cookies.get('soundlens_token');

  // We can't check localStorage in middleware (server-side)
  // We'll rely on client-side checks instead

  // Check if the user is trying to access a protected route
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/music-reel')) {

    // If neither token is present, redirect to login
    if (!nextAuthToken && !customTokenCookie) {
      console.log('🔒 No authentication token found, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // We'll assume the token is valid if it exists
    // For better security, implement a separate API route to validate tokens
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/music-reel/:path*'],
};

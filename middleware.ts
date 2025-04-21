import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// This protects all routes including api/trpc routes
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information
export default clerkMiddleware((auth, req) => {
  // Public routes that don't require authentication
  const publicPaths = [
    '/',
    '/properties',
    '/properties/(.*)',
    '/api/chatbot',
    '/api/payment',
    '/api/confirm',
    '/images/(.*)',
    '/favicon.ico',
  ];

  // Check if the current path matches any public paths
  const isPublicPath = publicPaths.some(path => {
    const pathRegex = new RegExp(`^${path.replace(/\(.*\)/g, '.*')}$`);
    return pathRegex.test(req.nextUrl.pathname);
  });

  // If the path is public or the request is for a static asset, allow it
  if (isPublicPath || req.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // For admin routes, check if the user is an admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const isAdminUser = auth().userId === process.env.ADMIN_USER_ID;
    if (!isAdminUser) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // For protected routes, ensure the user is authenticated
  const { userId } = auth();
  if (!userId) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

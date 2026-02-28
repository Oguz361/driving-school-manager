import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Middleware using Edge-compatible auth config.
 * This file runs in Edge Runtime, so it must NOT import bcrypt, prisma,
 * or any Node.js-only modules.
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Match all routes except static files, images, and public assets
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

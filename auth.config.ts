import type { NextAuthConfig } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

/**
 * Edge-compatible auth configuration.
 * This file must NOT import bcrypt, prisma, or any Node.js-only modules.
 * Used by middleware.ts which runs in Edge Runtime.
 *
 * Token validation (blacklist check, user status) happens in auth.ts
 * which runs in Node.js runtime and has access to Prisma.
 */
export const authConfig: NextAuthConfig = {
  providers: [], // Providers are added in auth.ts (requires Node.js runtime)
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // Initial sign in - generate unique JWT ID for blacklisting
      if (user) {
        token.id = user.id!;
        token.username = user.username;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
        token.jti = uuidv4(); // Unique token identifier for blacklisting
        token.iat = Math.floor(Date.now() / 1000);
        token.lastValidated = Date.now();
      }

      // Handle session update (e.g., after password change)
      if (trigger === 'update' && session) {
        if (session.mustChangePassword !== undefined) {
          token.mustChangePassword = session.mustChangePassword;
        }
      }

      return token;
    },
    session({ session, token }) {
      // Add custom fields to session
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.firstName = token.firstName as string;
      session.user.lastName = token.lastName as string;
      session.user.role = token.role as 'OWNER' | 'ADMIN' | 'INSTRUCTOR';
      session.user.mustChangePassword = token.mustChangePassword as boolean;

      return session;
    },
    authorized({ auth, request }) {
      // This is called by the middleware
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/kalender') ||
        request.nextUrl.pathname.startsWith('/schueler') ||
        request.nextUrl.pathname.startsWith('/fahrzeuge') ||
        request.nextUrl.pathname.startsWith('/benutzer') ||
        request.nextUrl.pathname.startsWith('/aktivitaeten') ||
        request.nextUrl.pathname.startsWith('/finanzen') ||
        request.nextUrl.pathname.startsWith('/statistiken') ||
        request.nextUrl.pathname.startsWith('/info');

      const isApiRoute = request.nextUrl.pathname.startsWith('/api') &&
        !request.nextUrl.pathname.startsWith('/api/auth');

      if (isProtectedRoute || isApiRoute) {
        return isLoggedIn;
      }

      return true;
    },
  },
  pages: {
    signIn: '/management',
    error: '/management',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
};

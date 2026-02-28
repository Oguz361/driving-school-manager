import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

// Session max age in seconds (must match auth.config.ts)
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours

// This route is called BEFORE NextAuth signOut to log the activity and blacklist the token
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      // User already logged out or session expired
      return NextResponse.json({ message: 'OK' });
    }

    // Get the JWT token to extract jti for blacklisting
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    // Add token to blacklist if jti exists
    if (token?.jti) {
      // Calculate token expiration time
      const issuedAt = (token.iat as number) || Math.floor(Date.now() / 1000);
      const expiresAt = new Date((issuedAt + SESSION_MAX_AGE) * 1000);

      await prisma.tokenBlacklist.create({
        data: {
          tokenId: token.jti,
          userId: session.user.id,
          expiresAt,
        },
      });
    }

    // Log the logout activity
    await prisma.activityLog.create({
      data: {
        action: 'LOGOUT',
        entityType: 'Auth',
        entityId: session.user.id,
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Erfolgreich abgemeldet' });
  } catch (error) {
    console.error('Logout activity log error:', error);
    // Don't fail the logout just because logging failed
    return NextResponse.json({ message: 'OK' });
  }
}

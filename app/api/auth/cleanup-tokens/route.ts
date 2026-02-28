import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This route cleans up expired tokens from the blacklist
// Should be called periodically by a cron job (e.g., daily)
// Protected by a secret key to prevent unauthorized access
export async function POST(request: NextRequest) {
  try {
    // Verify the cleanup secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cleanupSecret = process.env.CLEANUP_SECRET;

    if (!cleanupSecret) {
      console.warn('CLEANUP_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cleanupSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete expired tokens from blacklist
    const result = await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({
      message: 'Cleanup completed',
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Token cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

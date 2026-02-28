import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Session } from 'next-auth';

// Type for authenticated user from session
export type AuthUser = NonNullable<Session['user']>;
export type UserRole = 'OWNER' | 'ADMIN' | 'INSTRUCTOR';

// Handler types
type AuthHandler = (request: NextRequest, user: AuthUser) => Promise<NextResponse>;
type RoleAuthHandler = (request: NextRequest, user: AuthUser) => Promise<NextResponse>;

// Authenticate and get user from session
export async function withAuth(
  request: NextRequest,
  handler: AuthHandler
): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: { message: 'Nicht authentifiziert', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  return handler(request, session.user);
}

// Helper: Check if user has admin-level access (OWNER or ADMIN)
export function hasAdminAccess(role: UserRole): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}

// Owner-Only Middleware (for managing admins)
export async function withOwner(
  request: NextRequest,
  handler: RoleAuthHandler
): Promise<NextResponse> {
  return withAuth(request, async (req, user) => {
    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { error: { message: 'Zugriff verweigert. Inhaber-Rechte erforderlich.', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    return handler(req, user);
  });
}

// Admin-Only Middleware (OWNER also has access)
export async function withAdmin(
  request: NextRequest,
  handler: RoleAuthHandler
): Promise<NextResponse> {
  return withAuth(request, async (req, user) => {
    if (!hasAdminAccess(user.role)) {
      return NextResponse.json(
        { error: { message: 'Zugriff verweigert. Admin-Rechte erforderlich.', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    return handler(req, user);
  });
}

// Instructor-or-Admin Middleware (for own resources)
export async function withInstructorOrAdmin(
  request: NextRequest,
  handler: RoleAuthHandler,
  resourceInstructorId?: string
): Promise<NextResponse> {
  return withAuth(request, async (req, user) => {
    // OWNER and Admin have full access
    if (hasAdminAccess(user.role)) {
      return handler(req, user);
    }

    // Instructor only if it's their own resource
    if (resourceInstructorId && user.id !== resourceInstructorId) {
      return NextResponse.json(
        { error: { message: 'Zugriff verweigert. Sie können nur Ihre eigenen Daten sehen.', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    return handler(req, user);
  });
}

import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';

// Brute-Force Protection Constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// Token Validation Constants
const USER_STATUS_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms

// Custom error for better error messages
class InvalidCredentialsError extends CredentialsSignin {
  code = 'invalid_credentials';
}

class AccountDisabledError extends CredentialsSignin {
  code = 'account_disabled';
}

class AccountLockedError extends CredentialsSignin {
  code = 'account_locked';
}

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Benutzername ist erforderlich'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // Call the base jwt callback first
      const baseResult = authConfig.callbacks?.jwt?.({
        token,
        user,
        trigger,
        session,
        account: null,
      } as Parameters<NonNullable<typeof authConfig.callbacks.jwt>>[0]);

      const updatedToken =
        baseResult instanceof Promise ? await baseResult : baseResult;

      if (!updatedToken) return token;

      // Only validate on existing sessions (not initial sign in)
      if (!user && updatedToken.jti && updatedToken.id) {
        // Check if token is blacklisted
        const blacklistedToken = await prisma.tokenBlacklist.findUnique({
          where: { tokenId: updatedToken.jti as string },
        });

        if (blacklistedToken) {
          // Token is blacklisted - invalidate session
          throw new Error('Token has been revoked');
        }

        // Periodically check if user is still active (every 5 minutes)
        const lastValidated = updatedToken.lastValidated as number | undefined;
        const shouldRevalidate =
          !lastValidated ||
          Date.now() - lastValidated > USER_STATUS_CHECK_INTERVAL;

        if (shouldRevalidate) {
          const dbUser = await prisma.user.findUnique({
            where: { id: updatedToken.id as string },
            select: { isActive: true, isDeleted: true },
          });

          if (!dbUser || !dbUser.isActive || dbUser.isDeleted) {
            // User is deactivated or deleted - invalidate session
            throw new Error('User account is no longer active');
          }

          updatedToken.lastValidated = Date.now();
        }
      }

      return updatedToken;
    },
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Benutzername', type: 'text' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(credentials, request) {
        // Validate input
        const validation = loginSchema.safeParse(credentials);
        if (!validation.success) {
          throw new InvalidCredentialsError();
        }

        const { username, password } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
          where: { username },
        });

        // Check if account is locked (brute-force protection)
        if (user?.lockedUntil && user.lockedUntil > new Date()) {
          throw new AccountLockedError();
        }

        // Use constant-time comparison to prevent timing attacks
        // If user doesn't exist, still do a bcrypt compare to maintain timing
        const passwordHash = user?.passwordHash || '$2b$12$dummy.hash.to.prevent.timing.attacks';
        const isValidPassword = await bcrypt.compare(password, passwordHash);

        if (!user || !isValidPassword) {
          // Handle failed login attempt
          if (user) {
            const newFailedAttempts = user.failedLoginAttempts + 1;
            const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS;

            // Update failed attempts and lock if threshold reached
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: newFailedAttempts,
                lockedUntil: shouldLock
                  ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
                  : null,
              },
            });

            // Log failed attempt
            const userAgent = request?.headers?.get?.('user-agent') || 'unknown';
            await prisma.activityLog.create({
              data: {
                action: 'LOGIN_FAILED',
                entityType: 'Auth',
                entityId: user.id,
                userAgent,
                userId: user.id,
                changes: shouldLock
                  ? { locked: true, lockedFor: LOCKOUT_DURATION_MINUTES }
                  : { failedAttempts: newFailedAttempts },
              },
            });

            if (shouldLock) {
              throw new AccountLockedError();
            }
          }
          throw new InvalidCredentialsError();
        }

        // Check if account is active
        if (!user.isActive) {
          throw new AccountDisabledError();
        }

        // Reset failed login attempts on successful login
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
          });
        }

        // Log successful login
        const userAgent = request?.headers?.get?.('user-agent') || 'unknown';
        await prisma.activityLog.create({
          data: {
            action: 'LOGIN',
            entityType: 'Auth',
            entityId: user.id,
            userAgent,
            userId: user.id,
          },
        });

        // Return user object (will be passed to jwt callback)
        return {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});

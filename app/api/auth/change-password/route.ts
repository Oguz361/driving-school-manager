import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Aktuelles Passwort ist erforderlich'),
  newPassword: z
    .string()
    .min(12, 'Passwort muss mindestens 12 Zeichen lang sein')
    .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
    .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
    .regex(/[0-9]/, 'Passwort muss mindestens eine Ziffer enthalten')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Passwort muss mindestens ein Sonderzeichen enthalten'),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: { message: 'Nicht authentifiziert', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = passwordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            message: 'Ungültige Eingabe',
            details: validation.error.issues
          }
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    const userWithPassword = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userWithPassword) {
      return NextResponse.json(
        { error: { message: 'Benutzer nicht gefunden' } },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: { message: 'Aktuelles Passwort ist falsch', code: 'INVALID_CURRENT_PASSWORD' } },
        { status: 401 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'User',
        entityId: session.user.id,
        changes: {
          field: 'password',
          note: 'Passwort geändert',
        },
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Passwort erfolgreich geändert' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: { message: 'Interner Serverfehler' } },
      { status: 500 }
    );
  }
}

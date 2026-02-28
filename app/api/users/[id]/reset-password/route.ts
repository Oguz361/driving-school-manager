import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { withAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(12, 'Passwort muss mindestens 12 Zeichen lang sein')
    .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
    .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
    .regex(/[0-9]/, 'Passwort muss mindestens eine Ziffer enthalten')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Passwort muss mindestens ein Sonderzeichen enthalten'),
  mustChangePassword: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAdmin(request, async (req, user) => {
    try {
      const body = await req.json();

      const validation = resetPasswordSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: { message: 'Ungültige Eingabe', details: validation.error.issues } },
          { status: 400 }
        );
      }

      const targetUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: { message: 'Benutzer nicht gefunden' } },
          { status: 404 }
        );
      }

      const newPasswordHash = await bcrypt.hash(validation.data.newPassword, 12);

      await prisma.user.update({
        where: { id },
        data: {
          passwordHash: newPasswordHash,
          mustChangePassword: validation.data.mustChangePassword ?? true, // Default: Benutzer muss Passwort ändern
        },
      });

      await prisma.activityLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'User',
          entityId: id,
          changes: {
            field: 'password',
            note: 'Passwort durch Admin zurückgesetzt',
            targetUser: `${targetUser.firstName} ${targetUser.lastName} (${targetUser.username})`,
          },
          userAgent: req.headers.get('user-agent') || 'unknown',
          userId: user.id,
        },
      });

      return NextResponse.json({
        message: 'Passwort erfolgreich zurückgesetzt',
        mustChangePassword: validation.data.mustChangePassword ?? true,
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Zurücksetzen des Passworts' } },
        { status: 500 }
      );
    }
  });
}

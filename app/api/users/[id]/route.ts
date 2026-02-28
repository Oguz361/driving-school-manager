import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { withAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

// Helper: Sanitize user object for activity log (remove sensitive fields)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitizeUserForLog = (user: any): Record<string, any> => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['OWNER', 'ADMIN', 'INSTRUCTOR']).optional(),
  isActive: z.boolean().optional(),
  mustChangePassword: z.boolean().optional(),
  assignedVehicleId: z.string().uuid().optional().nullable(),
  password: z
    .string()
    .min(12, 'Passwort muss mindestens 12 Zeichen lang sein')
    .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
    .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
    .regex(/[0-9]/, 'Passwort muss mindestens eine Ziffer enthalten')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Passwort muss mindestens ein Sonderzeichen enthalten')
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAdmin(request, async (req, user) => {
    try {
      const foundUser = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
          assignedVehicleId: true,
          assignedVehicle: {
            select: {
              id: true,
              name: true,
              licensePlate: true,
              transmission: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              appointments: true,
              unavailabilities: true,
            },
          },
        },
      });

      if (!foundUser) {
        return NextResponse.json(
          { error: { message: 'Benutzer nicht gefunden' } },
          { status: 404 }
        );
      }

      return NextResponse.json(foundUser);
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Laden des Benutzers' } },
        { status: 500 }
      );
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAdmin(request, async (req, user) => {
    try {
      const body = await req.json();

      const validation = updateUserSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: { message: 'Ungültige Eingabe', details: validation.error.issues } },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: { message: 'Benutzer nicht gefunden' } },
          { status: 404 }
        );
      }

      // OWNER kann nicht von anderen bearbeitet werden (nur sich selbst)
      if (existingUser.role === 'OWNER' && user.id !== id) {
        return NextResponse.json(
          { error: { message: 'Der Inhaber kann nicht von anderen bearbeitet werden', code: 'OWNER_PROTECTED' } },
          { status: 403 }
        );
      }

      // OWNER-Rolle kann nicht vergeben werden (außer User ist schon OWNER)
      // OWNER-Rolle kann nicht von OWNER entzogen werden
      if (
        (validation.data.role === 'OWNER' && existingUser.role !== 'OWNER') ||
        (existingUser.role === 'OWNER' && validation.data.role && validation.data.role !== 'OWNER')
      ) {
        return NextResponse.json(
          { error: { message: 'Inhaber-Rolle kann nicht geändert werden', code: 'OWNER_PROTECTED' } },
          { status: 400 }
        );
      }

      // Nur OWNER darf ADMIN-Rolle vergeben oder entziehen
      if ((validation.data.role === 'ADMIN' || existingUser.role === 'ADMIN') && user.role !== 'OWNER') {
        // Ausnahme: Admin darf sich selbst nicht ändern (keine Rollenänderung)
        if (validation.data.role && validation.data.role !== existingUser.role) {
          return NextResponse.json(
            { error: { message: 'Nur der Inhaber kann Administratoren verwalten', code: 'OWNER_REQUIRED' } },
            { status: 403 }
          );
        }
      }

      // OWNER kann nicht deaktiviert werden
      if (existingUser.role === 'OWNER' && validation.data.isActive === false) {
        return NextResponse.json(
          { error: { message: 'Der Inhaber kann nicht deaktiviert werden', code: 'OWNER_PROTECTED' } },
          { status: 400 }
        );
      }

      // Verhindern, dass der letzte Admin sich selbst zum Instructor macht (wenn kein OWNER existiert)
      if (existingUser.role === 'ADMIN' && validation.data.role === 'INSTRUCTOR') {
        const adminOrOwnerCount = await prisma.user.count({
          where: { role: { in: ['ADMIN', 'OWNER'] }, isActive: true },
        });

        if (adminOrOwnerCount <= 1) {
          return NextResponse.json(
            {
              error: {
                message: 'Es muss mindestens ein Admin oder Inhaber aktiv bleiben',
                code: 'LAST_ADMIN'
              }
            },
            { status: 400 }
          );
        }
      }

      // Verhindern, dass der letzte Admin deaktiviert wird (wenn kein OWNER existiert)
      if (existingUser.role === 'ADMIN' && validation.data.isActive === false) {
        const activeAdminOrOwnerCount = await prisma.user.count({
          where: { role: { in: ['ADMIN', 'OWNER'] }, isActive: true },
        });

        if (activeAdminOrOwnerCount <= 1) {
          return NextResponse.json(
            {
              error: {
                message: 'Es muss mindestens ein Admin oder Inhaber aktiv bleiben',
                code: 'LAST_ADMIN'
              }
            },
            { status: 400 }
          );
        }
      }

      // Auto-Clearing: Wenn Rolle von INSTRUCTOR zu ADMIN wechselt, Fahrzeug entfernen
      if (existingUser.role === 'INSTRUCTOR' && validation.data.role === 'ADMIN') {
        validation.data.assignedVehicleId = null;
      }

      // Validierung: Nur INSTRUCTOR kann Fahrzeug zugewiesen bekommen
      const finalRole = validation.data.role ?? existingUser.role;
      if (validation.data.assignedVehicleId !== undefined && validation.data.assignedVehicleId !== null) {
        if (finalRole !== 'INSTRUCTOR') {
          return NextResponse.json(
            { error: { message: 'Nur Fahrlehrer können einem Fahrzeug zugewiesen werden', code: 'INVALID_VEHICLE_ASSIGNMENT' } },
            { status: 400 }
          );
        }

        // Validierung: Fahrzeug muss existieren und aktiv sein
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: validation.data.assignedVehicleId }
        });

        if (!vehicle) {
          return NextResponse.json(
            { error: { message: 'Fahrzeug nicht gefunden', code: 'VEHICLE_NOT_FOUND' } },
            { status: 404 }
          );
        }

        if (!vehicle.isActive) {
          return NextResponse.json(
            { error: { message: 'Inaktives Fahrzeug kann nicht zugewiesen werden', code: 'VEHICLE_INACTIVE' } },
            { status: 400 }
          );
        }
      }

      // Prepare update data and hash password if provided
      const { password, ...restData } = validation.data;
      const updateData: typeof restData & { passwordHash?: string } = { ...restData };

      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 12);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
          assignedVehicleId: true,
          assignedVehicle: {
            select: {
              id: true,
              name: true,
              licensePlate: true,
              transmission: true,
              isActive: true,
            },
          },
        },
      });

      // Activity Log (passwordHash excluded)
      await prisma.activityLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'User',
          entityId: updatedUser.id,
          changes: {
            before: sanitizeUserForLog(existingUser),
            after: sanitizeUserForLog(updatedUser),
          },
          userAgent: req.headers.get('user-agent') || 'unknown',
          userId: user.id,
        },
      });

      return NextResponse.json(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Aktualisieren des Benutzers' } },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAdmin(request, async (req, user) => {
    try {
      // Passwort aus Request-Body lesen
      const body = await req.json().catch(() => ({}));
      const { password } = body;

      if (!password) {
        return NextResponse.json(
          { error: { message: 'Passwort erforderlich', code: 'PASSWORD_REQUIRED' } },
          { status: 400 }
        );
      }

      // Admin-Passwort verifizieren
      const admin = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true },
      });

      if (!admin) {
        return NextResponse.json(
          { error: { message: 'Admin nicht gefunden' } },
          { status: 404 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: { message: 'Falsches Passwort', code: 'INVALID_PASSWORD' } },
          { status: 401 }
        );
      }

      // Nur OWNER darf Benutzer löschen
      if (user.role !== 'OWNER') {
        return NextResponse.json(
          {
            error: {
              message: 'Nur der Inhaber kann Benutzer löschen. Admins können Benutzer nur deaktivieren.',
              code: 'OWNER_REQUIRED_FOR_DELETE'
            }
          },
          { status: 403 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: { message: 'Benutzer nicht gefunden' } },
          { status: 404 }
        );
      }

      // Verhindern, dass sich ein Benutzer selbst löscht
      if (existingUser.id === user.id) {
        return NextResponse.json(
          { error: { message: 'Sie können sich nicht selbst löschen', code: 'SELF_DELETE' } },
          { status: 400 }
        );
      }

      // OWNER kann NIEMALS gelöscht werden
      if (existingUser.role === 'OWNER') {
        return NextResponse.json(
          { error: { message: 'Der Inhaber kann nicht gelöscht werden', code: 'OWNER_PROTECTED' } },
          { status: 400 }
        );
      }

      // Prüfen ob Termine existieren
      const appointmentCount = await prisma.appointment.count({
        where: { instructorId: id },
      });

      if (appointmentCount > 0) {
        return NextResponse.json(
          {
            error: {
              message: `Benutzer kann nicht gelöscht werden. Es existieren noch ${appointmentCount} Termine. Bitte deaktivieren Sie den Benutzer stattdessen.`,
              code: 'HAS_APPOINTMENTS'
            }
          },
          { status: 400 }
        );
      }

      // Soft-Delete: User als gelöscht markieren statt zu löschen
      await prisma.user.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          isActive: false,
        },
      });

      // Activity Log (passwordHash excluded)
      await prisma.activityLog.create({
        data: {
          action: 'DELETE',
          entityType: 'User',
          entityId: id,
          changes: { softDeleted: sanitizeUserForLog(existingUser) },
          userAgent: req.headers.get('user-agent') || 'unknown',
          userId: user.id,
        },
      });

      return NextResponse.json({ message: 'Benutzer gelöscht' }, { status: 200 });
    } catch (error) {
      console.error('Delete user error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Löschen des Benutzers' } },
        { status: 500 }
      );
    }
  });
}

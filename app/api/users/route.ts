import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { withAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const createUserSchema = z.object({
  username: z.string().min(3, 'Benutzername muss mindestens 3 Zeichen lang sein'),
  password: z
    .string()
    .min(12, 'Passwort muss mindestens 12 Zeichen lang sein')
    .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
    .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
    .regex(/[0-9]/, 'Passwort muss mindestens eine Ziffer enthalten')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Passwort muss mindestens ein Sonderzeichen enthalten'),
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  role: z.enum(['OWNER', 'ADMIN', 'INSTRUCTOR']),
  mustChangePassword: z.boolean().optional(),
  assignedVehicleId: z.string().uuid().optional().nullable(),
});

export async function GET(request: NextRequest) {
  return withAdmin(request, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const role = searchParams.get('role');
      const isActive = searchParams.get('isActive');

      const where: any = {
        isDeleted: false, // Soft-deleted Users ausblenden
      };

      if (role) {
        where.role = role;
      }

      if (isActive !== null) {
        where.isActive = isActive === 'true';
      }

      const users = await prisma.user.findMany({
        where,
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
          // passwordHash ausschließen!
        },
        orderBy: [
          { role: 'asc' },
          { lastName: 'asc' },
        ],
      });

      return NextResponse.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Laden der Benutzer' } },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAdmin(request, async (req, user) => {
    try {
      const body = await req.json();

      const validation = createUserSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: { message: 'Ungültige Eingabe', details: validation.error.issues } },
          { status: 400 }
        );
      }

      const data = validation.data;

      // OWNER-Rolle kann nicht über API vergeben werden
      if (data.role === 'OWNER') {
        return NextResponse.json(
          { error: { message: 'Inhaber-Rolle kann nicht zugewiesen werden', code: 'OWNER_PROTECTED' } },
          { status: 400 }
        );
      }

      // Nur OWNER darf ADMIN erstellen
      if (data.role === 'ADMIN' && user.role !== 'OWNER') {
        return NextResponse.json(
          { error: { message: 'Nur der Inhaber kann Administratoren erstellen', code: 'OWNER_REQUIRED' } },
          { status: 403 }
        );
      }

      // Prüfen ob Benutzername bereits existiert
      const existing = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existing) {
        return NextResponse.json(
          { error: { message: 'Benutzername bereits vergeben', code: 'USERNAME_EXISTS' } },
          { status: 409 }
        );
      }

      // Validierung: Nur INSTRUCTOR kann Fahrzeug zugewiesen bekommen
      if (data.assignedVehicleId && data.role !== 'INSTRUCTOR') {
        return NextResponse.json(
          { error: { message: 'Nur Fahrlehrer können einem Fahrzeug zugewiesen werden', code: 'INVALID_VEHICLE_ASSIGNMENT' } },
          { status: 400 }
        );
      }

      // Validierung: Fahrzeug muss existieren und aktiv sein
      if (data.assignedVehicleId) {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: data.assignedVehicleId }
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

      const passwordHash = await bcrypt.hash(data.password, 12);

      const newUser = await prisma.user.create({
        data: {
          username: data.username,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          mustChangePassword: data.mustChangePassword ?? true, // Default: Passwort ändern
          isActive: true,
          assignedVehicleId: data.assignedVehicleId,
        },
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

      await prisma.activityLog.create({
        data: {
          action: 'CREATE',
          entityType: 'User',
          entityId: newUser.id,
          changes: { user: newUser },
          userAgent: req.headers.get('user-agent') || 'unknown',
          userId: user.id,
        },
      });

      return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
      console.error('Create user error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Erstellen des Benutzers' } },
        { status: 500 }
      );
    }
  });
}
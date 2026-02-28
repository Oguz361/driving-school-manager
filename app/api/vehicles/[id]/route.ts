import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, withAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const vehicleSchema = z.object({
  name: z.string().min(1).optional(),
  licensePlate: z.string().min(1).optional(),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth(request, async (req, user) => {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
      });

      if (!vehicle) {
        return NextResponse.json(
          { error: { message: 'Fahrzeug nicht gefunden' } },
          { status: 404 }
        );
      }

      return NextResponse.json(vehicle);
    } catch (error) {
      console.error('Get vehicle error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Laden des Fahrzeugs' } },
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

      const validation = vehicleSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: { message: 'Ungültige Eingabe', details: validation.error.issues } },
          { status: 400 }
        );
      }

      const existingVehicle = await prisma.vehicle.findUnique({
        where: { id },
      });

      if (!existingVehicle) {
        return NextResponse.json(
          { error: { message: 'Fahrzeug nicht gefunden' } },
          { status: 404 }
        );
      }

      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: validation.data,
      });

      await prisma.activityLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'Vehicle',
          entityId: vehicle.id,
          changes: {
            before: existingVehicle,
            after: vehicle,
          },
          userAgent: req.headers.get('user-agent') || 'unknown',
          userId: user.id,
        },
      });

      return NextResponse.json(vehicle);
    } catch (error) {
      console.error('Update vehicle error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Aktualisieren des Fahrzeugs' } },
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
      // Prüfen ob Termine existieren
      const appointmentCount = await prisma.appointment.count({
        where: { vehicleId: id },
      });

      if (appointmentCount > 0) {
        return NextResponse.json(
          {
            error: {
              message: `Fahrzeug kann nicht gelöscht werden. Es existieren noch ${appointmentCount} Termine.`,
              code: 'HAS_APPOINTMENTS'
            }
          },
          { status: 400 }
        );
      }

      // Prüfen ob Fahrzeug einem Fahrlehrer zugewiesen ist
      const assignedUsersCount = await prisma.user.count({
        where: { assignedVehicleId: id },
      });

      if (assignedUsersCount > 0) {
        return NextResponse.json(
          {
            error: {
              message: `Fahrzeug kann nicht gelöscht werden. Es ist ${assignedUsersCount} Fahrlehrer(n) zugewiesen. Bitte zuerst die Zuweisung aufheben.`,
              code: 'VEHICLE_ASSIGNED_TO_USERS'
            }
          },
          { status: 400 }
        );
      }

      const vehicle = await prisma.vehicle.delete({
        where: { id },
      });

      await prisma.activityLog.create({
        data: {
          action: 'DELETE',
          entityType: 'Vehicle',
          entityId: id,
          changes: { deleted: vehicle },
          userAgent: req.headers.get('user-agent') || 'unknown',
          userId: user.id,
        },
      });

      return NextResponse.json({ message: 'Fahrzeug gelöscht' }, { status: 200 });
    } catch (error) {
      console.error('Delete vehicle error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Löschen des Fahrzeugs' } },
        { status: 500 }
      );
    }
  });
}

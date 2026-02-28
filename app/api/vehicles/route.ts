import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, withAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { TransmissionType } from '@/types';

const vehicleSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  licensePlate: z.string().min(1, 'Kennzeichen ist erforderlich'),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const vehicles = await prisma.vehicle.findMany({
        orderBy: { name: 'asc' },
        include: {
          assignedToUsers: {
            where: { role: 'INSTRUCTOR' },
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      return NextResponse.json(vehicles);
    } catch (error) {
      console.error('Get vehicles error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Laden der Fahrzeuge' } },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
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

      // Prüfen ob Kennzeichen bereits existiert
      const existing = await prisma.vehicle.findUnique({
        where: { licensePlate: validation.data.licensePlate },
      });

      if (existing) {
        return NextResponse.json(
          { error: { message: 'Kennzeichen bereits vergeben', code: 'DUPLICATE_LICENSE_PLATE' } },
          { status: 409 }
        );
      }

      const vehicle = await prisma.vehicle.create({
        data: validation.data,
      });

      await prisma.activityLog.create({
        data: {
          action: 'CREATE',
          entityType: 'Vehicle',
          entityId: vehicle.id,
          changes: { vehicle },
          userAgent: req.headers.get('user-agent') || 'unknown',
          userId: user.id,
        },
      });

      return NextResponse.json(vehicle, { status: 201 });
    } catch (error) {
      console.error('Create vehicle error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Erstellen des Fahrzeugs' } },
        { status: 500 }
      );
    }
  });
}
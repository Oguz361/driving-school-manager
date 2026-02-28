import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/middleware';
import { conflictDetectionService } from '@/lib/services/conflictDetection';

const checkConflictsSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  instructorId: z.string().uuid(),
  vehicleId: z.string().uuid().optional().nullable(),
  excludeAppointmentId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const body = await req.json();

      const validation = checkConflictsSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: { message: 'Ungültige Eingabe', details: validation.error.issues } },
          { status: 400 }
        );
      }

      const { startTime, endTime, instructorId, vehicleId, excludeAppointmentId } = validation.data;

      // Zeitvalidierung
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        return NextResponse.json(
          { error: { message: 'Startzeit muss vor Endzeit liegen' } },
          { status: 400 }
        );
      }

      const duration = (end.getTime() - start.getTime()) / 1000 / 60; // Minuten
      if (duration < 15) {
        return NextResponse.json(
          { error: { message: 'Termin muss mindestens 15 Minuten lang sein' } },
          { status: 400 }
        );
      }

      if (duration > 480) {
        return NextResponse.json(
          { error: { message: 'Termin darf nicht länger als 8 Stunden sein' } },
          { status: 400 }
        );
      }

      // Konfliktprüfung
      const result = await conflictDetectionService.checkConflicts({
        startTime: start,
        endTime: end,
        instructorId,
        vehicleId,
        excludeAppointmentId,
      });

      return NextResponse.json(result);
    } catch (error) {
      console.error('Check conflicts error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler bei der Konfliktprüfung' } },
        { status: 500 }
      );
    }
  });
}
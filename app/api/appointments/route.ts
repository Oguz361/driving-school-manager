import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth, hasAdminAccess } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { conflictDetectionService } from "@/lib/services/conflictDetection";

const appointmentSchema = z.object({
  type: z.enum([
    "PRACTICAL_LESSON",
    "THEORY_LESSON",
    "EXAM",
    "HIGHWAY",
    "NIGHT_DRIVE",
    "COUNTRY_ROAD",
  ]),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  routeType: z
    .enum(["COUNTRY", "HIGHWAY", "NIGHT"])
    .optional()
    .nullable(),
  paymentStatus: z.enum(["OPEN", "PAID"]).optional(),
  notes: z.string().optional().nullable(),
  instructorId: z.string().uuid(),
  studentId: z.string().uuid().optional().nullable(),
  vehicleId: z.string().uuid().optional().nullable(),
});

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const start = searchParams.get("start");
      const end = searchParams.get("end");
      const instructorId = searchParams.get("instructorId");
      const type = searchParams.get("type");
      const paymentStatus = searchParams.get("paymentStatus");

      const where: any = {
        deletedAt: null, // Exclude soft-deleted appointments
      };

      // Fahrlehrer sieht nur eigene Termine
      if (user.role === "INSTRUCTOR") {
        where.instructorId = user.id;
      } else if (instructorId) {
        where.instructorId = instructorId;
      }

      // Zeitraum-Filter (Prüfung auf Überlappung)
      if (start && end) {
        where.AND = [
          { startTime: { lt: new Date(end) } },
          { endTime: { gt: new Date(start) } },
        ];
      }

      if (type) {
        where.type = type;
      }

      if (paymentStatus) {
        where.paymentStatus = paymentStatus;
      }

      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              name: true,
              licensePlate: true,
              transmission: true,
            },
          },
          student: {
            select: { id: true, firstName: true, lastName: true },
          }
        },
        orderBy: { startTime: "asc" },
      });

      return NextResponse.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Laden der Termine" } },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const body = await req.json();

      const validation = appointmentSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: {
              message: "Ungültige Eingabe",
              details: validation.error.issues,
            },
          },
          { status: 400 }
        );
      }

      const data = validation.data;

      // Berechtigungsprüfung: Fahrlehrer kann nur eigene Termine anlegen
      if (user.role === "INSTRUCTOR" && data.instructorId !== user.id) {
        return NextResponse.json(
          {
            error: {
              message: "Sie können nur Termine für sich selbst anlegen",
            },
          },
          { status: 403 }
        );
      }

      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);

      // Zeitvalidierung
      if (startTime >= endTime) {
        return NextResponse.json(
          { error: { message: "Startzeit muss vor Endzeit liegen" } },
          { status: 400 }
        );
      }

      // Duration-Validierung (15 Minuten bis 8 Stunden)
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = durationMs / (1000 * 60);
      if (durationMinutes < 15) {
        return NextResponse.json(
          { error: { message: "Termin muss mindestens 15 Minuten dauern" } },
          { status: 400 }
        );
      }
      if (durationMinutes > 480) {
        return NextResponse.json(
          { error: { message: "Termin darf maximal 8 Stunden dauern" } },
          { status: 400 }
        );
      }

      // Vergangenheit prüfen (außer Admin/Owner)
      if (!hasAdminAccess(user.role) && startTime < new Date()) {
        return NextResponse.json(
          {
            error: {
              message:
                "Termine können nicht in der Vergangenheit angelegt werden",
            },
          },
          { status: 400 }
        );
      }

      // Praktische Fahrt braucht Fahrzeug
      if (
        ["PRACTICAL_LESSON", "HIGHWAY", "NIGHT_DRIVE", "COUNTRY_ROAD"].includes(
          data.type
        )
      ) {
        if (!data.vehicleId) {
          return NextResponse.json(
            { error: { message: "Praktische Fahrten benötigen ein Fahrzeug" } },
            { status: 400 }
          );
        }
      }

      // Konfliktprüfung (außer wenn Admin Konflikte ignoriert)

      const conflictResult = await conflictDetectionService.checkConflicts({
        startTime,
        endTime,
        instructorId: data.instructorId,
        vehicleId: data.vehicleId,
      });

      if (conflictResult.hasConflicts) {
        return NextResponse.json(
          {
            error: {
              message: "Konflikte erkannt",
              code: "CONFLICTS_DETECTED",
            },
            conflicts: conflictResult.conflicts,
          },
          { status: 409 }
        );
      }

      const appointment = await prisma.appointment.create({
        data: {
          type: data.type,
          startTime,
          endTime,
          routeType: data.routeType || null,
          paymentStatus: data.paymentStatus || "OPEN",
          notes: data.notes || null,
          instructorId: data.instructorId,
          studentId: data.studentId || null,
          vehicleId: data.vehicleId || null,
        },
        include: {
          instructor: {
            select: { firstName: true, lastName: true },
          },
          vehicle: {
            select: { name: true, licensePlate: true, transmission: true },
          },
          student: { select: { firstName: true, lastName: true } }
        },
      });

      if (data.studentId) {
        await prisma.student.update({
          where: { id: data.studentId },
          data: { 
            lastActivity: new Date(), // Aktuelles Datum (Buchungszeitpunkt)
            isActive: true           // Reaktiviert den Schüler automatisch, falls er inaktiv war
          }
        });
      }

      await prisma.activityLog.create({
        data: {
          action: "CREATE",
          entityType: "Appointment",
          entityId: appointment.id,
          changes: {
            appointment,
          },
          userAgent: req.headers.get("user-agent") || "unknown",
          userId: user.id,
        },
      });

      return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
      console.error("Create appointment error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Erstellen des Termins" } },
        { status: 500 }
      );
    }
  });
}

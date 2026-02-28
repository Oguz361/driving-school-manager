import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

const unavailabilitySchema = z.object({
  type: z.string().default("BLOCKED"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.string().optional().nullable(),
  instructorId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const instructorId = searchParams.get("instructorId");
      const start = searchParams.get("start");
      const end = searchParams.get("end");
      const type = searchParams.get("type");

      const where: any = {};

      // Fahrlehrer sieht nur eigene Abwesenheiten
      if (user.role === "INSTRUCTOR") {
        where.instructorId = user.id;
      } else if (instructorId) {
        // Admin kann nach Fahrlehrer filtern
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

      const unavailabilities = await prisma.unavailability.findMany({
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
        },
        orderBy: { startTime: "asc" },
      });

      return NextResponse.json(unavailabilities);
    } catch (error) {
      console.error("Get unavailabilities error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Laden der Abwesenheiten" } },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const body = await req.json();

      const validation = unavailabilitySchema.safeParse(body);
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

      // Berechtigungsprüfung: Fahrlehrer kann nur eigene Abwesenheiten anlegen
      if (user.role === "INSTRUCTOR" && data.instructorId !== user.id) {
        return NextResponse.json(
          {
            error: {
              message: "Sie können nur Abwesenheiten für sich selbst anlegen",
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

      // Überschneidungen prüfen
      const overlapping = await prisma.unavailability.findMany({
        where: {
          instructorId: data.instructorId,
          AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
        },
      });

      if (overlapping.length > 0) {
        return NextResponse.json(
          {
            error: {
              message:
                "Es existiert bereits eine Abwesenheit in diesem Zeitraum",
              code: "OVERLAP",
              overlapping,
            },
          },
          { status: 409 }
        );
      }

      // Prüfen ob der Fahrlehrer bereits Termine im Zeitraum hat
      const conflictingAppointments = await prisma.appointment.findMany({
        where: {
          instructorId: data.instructorId,
          deletedAt: null, // Exclude soft-deleted appointments
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          type: true,
          student: { select: { firstName: true, lastName: true } },
        },
      });

      if (conflictingAppointments.length > 0) {
        return NextResponse.json(
          {
            error: {
              message: `Es existieren ${conflictingAppointments.length} Termin(e) in diesem Zeitraum. Bitte zuerst die Termine absagen oder verschieben.`,
              code: "APPOINTMENTS_CONFLICT",
              conflictingAppointments,
            },
          },
          { status: 409 }
        );
      }

      const unavailability = await prisma.unavailability.create({
        data: {
          type: data.type,
          startTime,
          endTime,
          reason: data.reason || null,
          instructorId: data.instructorId,
        },
        include: {
          instructor: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "CREATE",
          entityType: "Unavailability",
          entityId: unavailability.id,
          changes: { unavailability },
          userAgent: req.headers.get("user-agent") || "unknown",
          userId: user.id,
        },
      });

      return NextResponse.json(unavailability, { status: 201 });
    } catch (error) {
      console.error("Create unavailability error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Erstellen der Abwesenheit" } },
        { status: 500 }
      );
    }
  });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { conflictDetectionService } from "@/lib/services/conflictDetection";

const updateAppointmentSchema = z.object({
  type: z
    .enum([
      "PRACTICAL_LESSON",
      "THEORY_LESSON",
      "EXAM",
      "HIGHWAY",
      "NIGHT_DRIVE",
      "COUNTRY_ROAD",
    ])
    .optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  routeType: z
    .enum(["COUNTRY", "HIGHWAY", "NIGHT"])
    .optional()
    .nullable(),
  paymentStatus: z.enum(["OPEN", "PAID"]).optional(),
  notes: z.string().optional().nullable(),
  instructorId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth(request, async (req, user) => {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
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
        },
      });

      if (!appointment) {
        return NextResponse.json(
          { error: { message: "Termin nicht gefunden" } },
          { status: 404 }
        );
      }

      // Berechtigungsprüfung: Fahrlehrer kann nur eigene Termine sehen
      if (user.role === "INSTRUCTOR" && appointment.instructorId !== user.id) {
        return NextResponse.json(
          { error: { message: "Sie können nur Ihre eigenen Termine sehen" } },
          { status: 403 }
        );
      }

      return NextResponse.json(appointment);
    } catch (error) {
      console.error("Get appointment error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Laden des Termins" } },
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

  return withAuth(request, async (req, user) => {
    try {
      const existingAppointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (!existingAppointment) {
        return NextResponse.json(
          { error: { message: "Termin nicht gefunden" } },
          { status: 404 }
        );
      }

      // Berechtigungsprüfung
      if (
        user.role === "INSTRUCTOR" &&
        existingAppointment.instructorId !== user.id
      ) {
        return NextResponse.json(
          {
            error: {
              message: "Sie können nur Ihre eigenen Termine bearbeiten",
            },
          },
          { status: 403 }
        );
      }

      // Prevent instructors from editing past appointments
      if (user.role === "INSTRUCTOR" && existingAppointment.endTime < new Date()) {
        return NextResponse.json(
          { error: { message: "Vergangene Termine können nicht mehr bearbeitet werden" } },
          { status: 403 }
        );
      }

      const body = await req.json();
      const validation = updateAppointmentSchema.safeParse(body);

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

      // Wenn Zeit oder Fahrlehrer/Fahrzeug geändert wird → Konfliktprüfung
      if (
        (data.startTime ||
          data.endTime ||
          data.instructorId ||
          data.vehicleId !== undefined)
      ) {
        const startTime = data.startTime
          ? new Date(data.startTime)
          : existingAppointment.startTime;
        const endTime = data.endTime
          ? new Date(data.endTime)
          : existingAppointment.endTime;
        const instructorId =
          data.instructorId || existingAppointment.instructorId;
        const vehicleId =
          data.vehicleId !== undefined
            ? data.vehicleId
            : existingAppointment.vehicleId;

        const conflictResult = await conflictDetectionService.checkConflicts({
          startTime,
          endTime,
          instructorId,
          vehicleId,
          excludeAppointmentId: id,
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
      }

      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          ...(data.type && { type: data.type }),
          ...(data.startTime && { startTime: new Date(data.startTime) }),
          ...(data.endTime && { endTime: new Date(data.endTime) }),
          ...(data.routeType !== undefined && { routeType: data.routeType }),
          ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.instructorId && { instructorId: data.instructorId }),
          ...(data.vehicleId !== undefined && { vehicleId: data.vehicleId }),
        },
        include: {
          instructor: {
            select: { firstName: true, lastName: true },
          },
          vehicle: {
            select: { name: true, licensePlate: true },
          },
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "UPDATE",
          entityType: "Appointment",
          entityId: appointment.id,
          changes: {
            before: existingAppointment,
            after: appointment,
          },
          userAgent: req.headers.get("user-agent") || "unknown",
          userId: user.id,
        },
      });

      return NextResponse.json(appointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Aktualisieren des Termins" } },
        { status: 500 }
      );
    }
  });
}

// DELETE - Termin löschen (Hard/Soft Delete basierend auf Zeitpunkt)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth(request, async (req, user) => {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        return NextResponse.json(
          { error: { message: "Termin nicht gefunden" } },
          { status: 404 }
        );
      }

      // Berechtigungsprüfung
      if (user.role === "INSTRUCTOR" && appointment.instructorId !== user.id) {
        return NextResponse.json(
          { error: { message: "Sie können nur Ihre eigenen Termine löschen" } },
          { status: 403 }
        );
      }

      const now = new Date();
      const isPastAppointment = appointment.endTime < now;

      if (isPastAppointment) {
        // SOFT DELETE: Vergangene Termine nur markieren (steuerlicher Beleg)
        await prisma.appointment.update({
          where: { id },
          data: { deletedAt: now },
        });
      } else {
        // HARD DELETE: Zukünftige Termine physisch löschen
        await prisma.appointment.delete({
          where: { id },
        });
      }

      await prisma.activityLog.create({
        data: {
          action: "DELETE",
          entityType: "Appointment",
          entityId: id,
          changes: {
            deleted: appointment,
            deleteType: isPastAppointment ? "SOFT" : "HARD",
          },
          userAgent: req.headers.get("user-agent") || "unknown",
          userId: user.id,
        },
      });

      return NextResponse.json(
        {
          message: isPastAppointment
            ? "Termin archiviert (steuerlicher Beleg)"
            : "Termin gelöscht",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete appointment error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Löschen des Termins" } },
        { status: 500 }
      );
    }
  });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

const updateUnavailabilitySchema = z.object({
  type: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  reason: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth(request, async (req, user) => {
    try {
      const unavailability = await prisma.unavailability.findUnique({
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
        },
      });

      if (!unavailability) {
        return NextResponse.json(
          { error: { message: "Abwesenheit nicht gefunden" } },
          { status: 404 }
        );
      }

      // Berechtigungsprüfung: Fahrlehrer kann nur eigene Abwesenheiten sehen
      if (
        user.role === "INSTRUCTOR" &&
        unavailability.instructorId !== user.id
      ) {
        return NextResponse.json(
          {
            error: {
              message: "Sie können nur Ihre eigenen Abwesenheiten sehen",
            },
          },
          { status: 403 }
        );
      }

      return NextResponse.json(unavailability);
    } catch (error) {
      console.error("Get unavailability error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Laden der Abwesenheit" } },
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
      const existingUnavailability = await prisma.unavailability.findUnique({
        where: { id },
      });

      if (!existingUnavailability) {
        return NextResponse.json(
          { error: { message: "Abwesenheit nicht gefunden" } },
          { status: 404 }
        );
      }

      // Berechtigungsprüfung
      if (
        user.role === "INSTRUCTOR" &&
        existingUnavailability.instructorId !== user.id
      ) {
        return NextResponse.json(
          {
            error: {
              message: "Sie können nur Ihre eigenen Abwesenheiten bearbeiten",
            },
          },
          { status: 403 }
        );
      }

      const body = await req.json();
      const validation = updateUnavailabilitySchema.safeParse(body);

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

      // Zeitvalidierung wenn geändert
      if (data.startTime || data.endTime) {
        const startTime = data.startTime
          ? new Date(data.startTime)
          : existingUnavailability.startTime;
        const endTime = data.endTime
          ? new Date(data.endTime)
          : existingUnavailability.endTime;

        if (startTime >= endTime) {
          return NextResponse.json(
            { error: { message: "Startzeit muss vor Endzeit liegen" } },
            { status: 400 }
          );
        }

        // Überschneidungen prüfen (außer mit sich selbst)
        const overlapping = await prisma.unavailability.findMany({
          where: {
            id: { not: id },
            instructorId: existingUnavailability.instructorId,
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gt: startTime } },
            ],
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
      }

      const unavailability = await prisma.unavailability.update({
        where: { id },
        data: {
          ...(data.type && { type: data.type }),
          ...(data.startTime && { startTime: new Date(data.startTime) }),
          ...(data.endTime && { endTime: new Date(data.endTime) }),
          ...(data.reason !== undefined && { reason: data.reason }),
        },
        include: {
          instructor: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "UPDATE",
          entityType: "Unavailability",
          entityId: unavailability.id,
          changes: {
            before: existingUnavailability,
            after: unavailability,
          },
          userAgent: req.headers.get("user-agent") || "unknown",
          userId: user.id,
        },
      });

      return NextResponse.json(unavailability);
    } catch (error) {
      console.error("Update unavailability error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Aktualisieren der Abwesenheit" } },
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

  return withAuth(request, async (req, user) => {
    try {
      const unavailability = await prisma.unavailability.findUnique({
        where: { id },
      });

      if (!unavailability) {
        return NextResponse.json(
          { error: { message: "Abwesenheit nicht gefunden" } },
          { status: 404 }
        );
      }

      // Berechtigungsprüfung
      if (
        user.role === "INSTRUCTOR" &&
        unavailability.instructorId !== user.id
      ) {
        return NextResponse.json(
          {
            error: {
              message: "Sie können nur Ihre eigenen Abwesenheiten löschen",
            },
          },
          { status: 403 }
        );
      }

      await prisma.unavailability.delete({
        where: { id },
      });

      await prisma.activityLog.create({
        data: {
          action: "DELETE",
          entityType: "Unavailability",
          entityId: id,
          changes: { deleted: unavailability },
          userAgent: req.headers.get("user-agent") || "unknown",
          userId: user.id,
        },
      });

      return NextResponse.json(
        { message: "Abwesenheit gelöscht" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete unavailability error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Löschen der Abwesenheit" } },
        { status: 500 }
      );
    }
  });
}

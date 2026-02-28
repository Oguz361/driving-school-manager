import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

const updateStudentSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  birthDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
  passedAt: z.string().datetime().optional().nullable(),
  isDeleted: z.boolean().optional(),
  examAuthority: z.enum(["TUV", "DEKRA"]).optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth(request, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const countFutureAppointments = searchParams.get("countFutureAppointments") === "true";

      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          _count: {
            select: { appointments: true },
          },
        },
      });

      if (!student) {
        return NextResponse.json(
          { error: { message: "Schüler nicht gefunden" } },
          { status: 404 }
        );
      }

      // Optional: Count future appointments for soft-delete dialog
      if (countFutureAppointments) {
        const futureAppointmentsCount = await prisma.appointment.count({
          where: {
            studentId: id,
            startTime: { gte: new Date() },
          },
        });

        return NextResponse.json({
          ...student,
          futureAppointmentsCount,
        });
      }

      return NextResponse.json(student);
    } catch (error) {
      console.error("Get student error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Laden des Schülers" } },
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
      const existingStudent = await prisma.student.findUnique({
        where: { id },
      });

      if (!existingStudent) {
        return NextResponse.json(
          { error: { message: "Schüler nicht gefunden" } },
          { status: 404 }
        );
      }

      const body = await req.json();
      const validation = updateStudentSchema.safeParse(body);

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

      // Block restore if passedAt is older than 6 months (auto-archived students)
      if (data.isDeleted === false && existingStudent.passedAt) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        if (existingStudent.passedAt < sixMonthsAgo) {
          return NextResponse.json(
            {
              error: {
                message:
                  "Schüler kann nicht wiederhergestellt werden - automatisch archiviert nach 6 Monaten",
              },
            },
            { status: 400 }
          );
        }
      }

      // Block restore if inactive for more than 1 year (and not passed)
      if (data.isDeleted === false && !existingStudent.passedAt && existingStudent.lastActivity) {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        if (existingStudent.lastActivity < oneYearAgo) {
          return NextResponse.json(
            {
              error: {
                message:
                  "Schüler kann nicht wiederhergestellt werden - automatisch archiviert nach 1 Jahr Inaktivität",
              },
            },
            { status: 400 }
          );
        }
      }

      const student = await prisma.student.update({
        where: { id },
        data: {
          ...(data.firstName && { firstName: data.firstName.trim() }),
          ...(data.lastName && { lastName: data.lastName.trim() }),
          ...(data.birthDate !== undefined && {
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
          }),
          ...(data.examAuthority !== undefined && {
            examAuthority: data.examAuthority,
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.passedAt !== undefined && {
            passedAt: data.passedAt ? new Date(data.passedAt) : null,
          }),
          // Wenn reaktiviert wird, lastActivity aktualisieren
          ...(data.isActive === true && { lastActivity: new Date() }),
          // Restore from archived state
          ...(data.isDeleted === false && {
            isDeleted: false,
            deletedAt: null,
            isActive: true,
            lastActivity: new Date(),
          }),
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "UPDATE",
          entityType: "Student",
          entityId: student.id,
          changes: {
            before: existingStudent,
            after: student,
          },
          userAgent: req.headers.get("user-agent") || "unknown",
          userId: user.id,
        },
      });

      return NextResponse.json(student);
    } catch (error) {
      console.error("Update student error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Aktualisieren des Schülers" } },
        { status: 500 }
      );
    }
  });
}

// DELETE - Schüler löschen (Hybrid: Hard Delete oder Anonymisierung)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth(request, async (req, user) => {
    try {
      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          appointments: {
            where: {
              endTime: { lt: new Date() },
              deletedAt: null,
            },
            select: { id: true },
          },
          _count: {
            select: { appointments: true },
          },
        },
      });

      if (!student) {
        return NextResponse.json(
          { error: { message: "Schüler nicht gefunden" } },
          { status: 404 }
        );
      }

      const now = new Date();
      const hasPastAppointments = student.appointments.length > 0;

      if (hasPastAppointments) {
        // ANONYMISIERUNG: DSGVO-Daten nullen, Name behalten
        await prisma.$transaction([
          // 1. Student anonymisieren
          prisma.student.update({
            where: { id },
            data: {
              isDeleted: true,
              deletedAt: now,
              isActive: false,
            },
          }),
          // 2. Vergangene Termine soft-deleten (archivieren)
          prisma.appointment.updateMany({
            where: {
              studentId: id,
              endTime: { lt: now },
              deletedAt: null,
            },
            data: { deletedAt: now },
          }),
          // 3. Zukünftige Termine hard-deleten
          prisma.appointment.deleteMany({
            where: {
              studentId: id,
              startTime: { gte: now },
            },
          }),
        ]);
      } else {
        // HARD DELETE: Schüler komplett löschen (CASCADE löscht Termine)
        await prisma.student.delete({
          where: { id },
        });
      }

      await prisma.activityLog.create({
        data: {
          action: "DELETE",
          entityType: "Student",
          entityId: id,
          changes: {
            deleted: {
              ...student,
              appointmentsCount: student._count.appointments,
            },
            deleteType: hasPastAppointments ? "ANONYMIZED" : "HARD",
            pastAppointmentsArchived: hasPastAppointments ? student.appointments.length : 0,
          },
          userAgent: req.headers.get("user-agent") || "unknown",
          userId: user.id,
        },
      });

      return NextResponse.json(
        {
          message: hasPastAppointments
            ? "Schüler anonymisiert (DSGVO-konform archiviert)"
            : "Schüler gelöscht",
          deleteType: hasPastAppointments ? "ANONYMIZED" : "HARD",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete student error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Löschen des Schülers" } },
        { status: 500 }
      );
    }
  });
}

// app/api/students/[id]/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, hasAdminAccess } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    const { id } = await params;

    // Prüfen ob Schüler existiert
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json(
        { error: { message: "Schüler nicht gefunden" } },
        { status: 404 }
      );
    }

    // IDOR-Schutz: Instructor darf nur Schüler sehen, mit denen er Termine hat
    if (!hasAdminAccess(user.role)) {
      const hasAccess = await prisma.appointment.count({
        where: {
          studentId: id,
          instructorId: user.id,
        },
      });

      if (hasAccess === 0) {
        return NextResponse.json(
          { error: { message: "Zugriff verweigert" } },
          { status: 403 }
        );
      }
    }

    // Alle Termine des Schülers laden (Praktische Fahrstunden + Prüfungen)
    const appointments = await prisma.appointment.findMany({
      where: {
        studentId: id,
        type: { in: ["PRACTICAL_LESSON", "EXAM"] },
        deletedAt: null, // Exclude soft-deleted appointments
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    const practicalLessons = appointments.filter((a) => a.type === "PRACTICAL_LESSON");
    const exams = appointments.filter((a) => a.type === "EXAM");

    const stats = {
      totalLessons: practicalLessons.length,
      totalExams: exams.length,
      byRouteType: {
        COUNTRY: practicalLessons.filter((a) => a.routeType === "COUNTRY").length,
        HIGHWAY: practicalLessons.filter((a) => a.routeType === "HIGHWAY").length,
        NIGHT: practicalLessons.filter((a) => a.routeType === "NIGHT").length,
        NONE: practicalLessons.filter((a) => !a.routeType).length,
      },
      firstLesson: appointments.length > 0 
        ? appointments[appointments.length - 1].startTime 
        : null,
      lastLesson: appointments.length > 0 
        ? appointments[0].startTime 
        : null,
      // Fahrlehrer-Aufschlüsselung
      byInstructor: Object.values(
        practicalLessons.reduce((acc, a) => {
          const instructorId = a.instructor.id;
          if (!acc[instructorId]) {
            acc[instructorId] = {
              id: instructorId,
              name: `${a.instructor.firstName} ${a.instructor.lastName}`,
              count: 0,
            };
          }
          acc[instructorId].count++;
          return acc;
        }, {} as Record<string, { id: string; name: string; count: number }>)
      ),
    };

    const lessons = appointments.map((a) => ({
      id: a.id,
      date: a.startTime,
      type: a.type,
      routeType: a.routeType,
      instructor: `${a.instructor.firstName} ${a.instructor.lastName}`,
      instructorId: a.instructor.id,
      notes: a.notes,
      paymentStatus: a.paymentStatus,
      duration: Math.round((a.endTime.getTime() - a.startTime.getTime()) / (1000 * 60)),
    }));

    return NextResponse.json({
      stats,
      lessons,
    });
  });
}
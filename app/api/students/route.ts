// app/api/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

const studentSchema = z.object({
  firstName: z.string().min(2, "Vorname muss mindestens 2 Zeichen lang sein"),
  lastName: z.string().min(2, "Nachname muss mindestens 2 Zeichen lang sein"),
  birthDate: z.string().datetime().optional().nullable(), // Erwartet ISO String
  examAuthority: z.enum(["TUV", "DEKRA"]).optional().nullable(),
});

export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    const showAll = searchParams.get("all") === "true";
    const showPassed = searchParams.get("passed") === "true";
    const instructorId = searchParams.get("instructorId");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const where: any = {};

    // Standardmäßig gelöschte Schüler ausblenden
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    // Filter by instructor (students who have at least one appointment with this instructor)
    if (instructorId) {
      where.appointments = {
        some: {
          instructorId: instructorId,
        },
      };
    }

    if (showPassed) {
      where.passedAt = { not: null };
    } else if (!showAll) {
      where.passedAt = null;
      where.isActive = true;
    }

    // Wenn eine Sucheingabe da ist, filtere zusätzlich nach Namen
    // Suchbegriff bei Leerzeichen aufteilen, damit "Max Müller" funktioniert
    if (query) {
      const searchTerms = query.trim().split(/\s+/);
      where.AND = searchTerms.map(term => ({
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
        ],
      }));
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { lastName: 'asc' },
      take: showPassed || showAll ? 200 : 50, // Mehr Ergebnisse für Listenansicht
    });

    return NextResponse.json(students);
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const body = await req.json();
      const validation = studentSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: { message: "Ungültige Eingabe", details: validation.error.issues } },
          { status: 400 }
        );
      }

      const data = validation.data;

      const student = await prisma.student.create({
        data: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          examAuthority: data.examAuthority || null,
          isActive: true,
          lastActivity: new Date(),
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "CREATE",
          entityType: "Student",
          entityId: student.id,
          changes: { student },
          userAgent: req.headers.get("user-agent") || "unknown",
          userId: user.id,
        },
      });

      return NextResponse.json(student, { status: 201 });
    } catch (error) {
      console.error("Create student error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Erstellen des Schülers" } },
        { status: 500 }
      );
    }
  });
}
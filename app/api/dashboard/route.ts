import { NextRequest, NextResponse } from "next/server";
import { withAuth, hasAdminAccess } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const now = new Date();
      const today = startOfDay(now);
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Montag
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sonntag

      const isAdmin = hasAdminAccess(user.role);
      const instructorFilter = isAdmin ? {} : { instructorId: user.id };

      // Anstehende Prüfungen (nächste 30 Tage)
      const upcomingExams = await prisma.appointment.findMany({
        where: {
          ...instructorFilter,
          type: "EXAM",
          startTime: {
            gte: now,
            lte: addDays(now, 30),
          },
          deletedAt: null, // Exclude soft-deleted appointments
        },
        include: {
          instructor: {
            select: { firstName: true, lastName: true },
          },
          vehicle: {
            select: { name: true, licensePlate: true },
          },
        },
        orderBy: { startTime: "asc" },
        take: 5,
      });

      // Offene Zahlungen für heute (nur für Admin)
      let openPayments: any[] = [];
      if (isAdmin) {
        const rawOpenPayments = await prisma.appointment.findMany({
          where: {
            paymentStatus: "OPEN",
            type: { not: "THEORY_LESSON" }, // Theorie hat keine Zahlung
            startTime: {
              gte: today,
              lte: endOfDay(now),
            },
            deletedAt: null, // Exclude soft-deleted appointments
          },
          include: {
            instructor: {
              select: { firstName: true, lastName: true },
            },
            student: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { startTime: "desc" },
          take: 10,
        });

        openPayments = rawOpenPayments.map((payment) => ({
          ...payment,
          studentName: payment.student
            ? `${payment.student.firstName} ${payment.student.lastName}`
            : null,
        }));
      }

      // Meine nächsten Termine (für Fahrlehrer)
      let myNextAppointments: any[] = [];
      if (!isAdmin) {
        myNextAppointments = await prisma.appointment.findMany({
          where: {
            instructorId: user.id,
            startTime: { gte: now },
            deletedAt: null, // Exclude soft-deleted appointments
          },
          include: {
            vehicle: {
              select: { name: true, licensePlate: true },
            },
          },
          orderBy: { startTime: "asc" },
          take: 4,
        });
      }

      // Wochenübersicht: Termine pro Tag
      const weekAppointments = await prisma.appointment.findMany({
        where: {
          ...instructorFilter,
          startTime: {
            gte: weekStart,
            lte: weekEnd,
          },
          deletedAt: null, // Exclude soft-deleted appointments
        },
        select: {
          startTime: true,
        },
      });

      const weekOverview: Record<number, number> = {
        0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
      };
      
      weekAppointments.forEach((apt) => {
        const dayOfWeek = apt.startTime.getDay();
        // Konvertiere: Sonntag (0) -> 6, Montag (1) -> 0, etc.
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weekOverview[adjustedDay]++;
      });

      const totalAppointmentsThisWeek = weekAppointments.length;
      const openPaymentsCount = isAdmin
        ? await prisma.appointment.count({
            where: {
              paymentStatus: "OPEN",
              type: { not: "THEORY_LESSON" },
              startTime: {
                gte: today,
                lte: endOfDay(now),
              },
              deletedAt: null, // Exclude soft-deleted appointments
            },
          })
        : 0;

      // Cached open payments from yesterday (nur für Admin)
      let previousDayOpenPayments: any[] = [];
      let previousDayOpenPaymentsCount = 0;
      if (isAdmin) {
        const yesterday = subDays(startOfDay(now), 1);
        previousDayOpenPayments = await prisma.cachedOpenPayment.findMany({
          where: { cachedDate: yesterday },
          orderBy: { startTime: "desc" },
          take: 10,
        });
        previousDayOpenPaymentsCount = await prisma.cachedOpenPayment.count({
          where: { cachedDate: yesterday },
        });
      }

      return NextResponse.json({
        upcomingExams,
        openPayments,
        openPaymentsCount,
        myNextAppointments,
        weekOverview,
        totalAppointmentsThisWeek,
        isAdmin,
        previousDayOpenPayments,
        previousDayOpenPaymentsCount,
      });
    } catch (error) {
      console.error("Dashboard data error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Laden der Dashboard-Daten" } },
        { status: 500 }
      );
    }
  });
}
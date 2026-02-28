import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = startOfDay(now);

    // Find all appointments from today with OPEN payment status
    const openPayments = await prisma.appointment.findMany({
      where: {
        paymentStatus: "OPEN",
        type: { not: "THEORY_LESSON" },
        startTime: {
          gte: today,
          lte: endOfDay(now),
        },
        deletedAt: null,
      },
      include: {
        instructor: {
          select: { firstName: true, lastName: true },
        },
        student: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    // Delete old cache entries (older than 7 days)
    const sevenDaysAgo = subDays(today, 7);
    const deletedOldEntries = await prisma.cachedOpenPayment.deleteMany({
      where: {
        cachedDate: { lt: sevenDaysAgo },
      },
    });

    // Cache the open payments for today (will be "yesterday" when viewed tomorrow)
    let cachedCount = 0;
    for (const payment of openPayments) {
      const studentName = payment.student
        ? `${payment.student.firstName} ${payment.student.lastName}`
        : null;

      await prisma.cachedOpenPayment.upsert({
        where: {
          appointmentId_cachedDate: {
            appointmentId: payment.id,
            cachedDate: today,
          },
        },
        update: {
          studentName,
          type: payment.type,
          startTime: payment.startTime,
          instructorFirstName: payment.instructor.firstName,
          instructorLastName: payment.instructor.lastName,
        },
        create: {
          appointmentId: payment.id,
          cachedDate: today,
          studentName,
          type: payment.type,
          startTime: payment.startTime,
          instructorFirstName: payment.instructor.firstName,
          instructorLastName: payment.instructor.lastName,
        },
      });
      cachedCount++;
    }

    return NextResponse.json({
      success: true,
      cachedPayments: cachedCount,
      deletedOldEntries: deletedOldEntries.count,
      cachedDate: today.toISOString(),
      executedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Cache open payments cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

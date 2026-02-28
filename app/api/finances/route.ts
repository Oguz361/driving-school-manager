import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  return withAdmin(request, async (req) => {
    const { searchParams } = new URL(req.url);
    const paymentStatus = searchParams.get("paymentStatus");
    const query = searchParams.get("query");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      studentId: { not: null },
      type: { not: "THEORY_LESSON" },
    };

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    // Suche nach Schülername
    if (query) {
      const searchTerms = query.trim().split(/\s+/);
      where.AND = searchTerms.map(term => ({
        student: {
          OR: [
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
          ],
        },
      }));
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
      take: 200,
    });

    const stats = await prisma.appointment.groupBy({
      by: ["paymentStatus"],
      where: {
        studentId: { not: null },
        type: { not: "THEORY_LESSON" },
      },
      _count: true,
    });

    const openCount = stats.find((s) => s.paymentStatus === "OPEN")?._count || 0;
    const paidCount = stats.find((s) => s.paymentStatus === "PAID")?._count || 0;
    const totalCount = openCount + paidCount;

    return NextResponse.json({
      appointments,
      stats: {
        open: openCount,
        paid: paidCount,
        total: totalCount,
      },
    });
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Cleanup activity logs older than 90 days
    const logsCutoffDate = new Date();
    logsCutoffDate.setDate(logsCutoffDate.getDate() - 90);

    const deletedLogs = await prisma.activityLog.deleteMany({
      where: { timestamp: { lt: logsCutoffDate } },
    });

    // Deactivate students inactive for 6 months
    const studentCutoffDate = new Date();
    studentCutoffDate.setMonth(studentCutoffDate.getMonth() - 6);

    const deactivatedStudents = await prisma.student.updateMany({
      where: {
        isActive: true,
        passedAt: null,
        lastActivity: { lt: studentCutoffDate },
      },
      data: { isActive: false },
    });

    // Archive students who passed more than 6 months ago
    const passedCutoffDate = new Date();
    passedCutoffDate.setMonth(passedCutoffDate.getMonth() - 6);

    const archivedPassedStudents = await prisma.student.updateMany({
      where: {
        passedAt: {
          not: null,
          lt: passedCutoffDate,
        },
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    // Archive students inactive for more than 1 year (and not passed)
    const inactiveCutoffDate = new Date();
    inactiveCutoffDate.setFullYear(inactiveCutoffDate.getFullYear() - 1);

    const archivedInactiveStudents = await prisma.student.updateMany({
      where: {
        lastActivity: { lt: inactiveCutoffDate },
        passedAt: null,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    // DSGVO: Permanently delete soft-deleted users after 10 years
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

    const permanentlyDeletedUsers = await prisma.user.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: tenYearsAgo },
      },
    });

    // DSGVO: Permanently delete soft-deleted students after 10 years
    const permanentlyDeletedStudents = await prisma.student.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: tenYearsAgo },
      },
    });

    return NextResponse.json({
      success: true,
      deletedLogs: deletedLogs.count,
      deactivatedStudents: deactivatedStudents.count,
      archivedPassedStudents: archivedPassedStudents.count,
      archivedInactiveStudents: archivedInactiveStudents.count,
      permanentlyDeletedUsers: permanentlyDeletedUsers.count,
      permanentlyDeletedStudents: permanentlyDeletedStudents.count,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron cleanup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

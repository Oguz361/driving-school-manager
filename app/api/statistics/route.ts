import { NextRequest, NextResponse } from "next/server";
import { withAuth, hasAdminAccess } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInMinutes,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  getDay,
} from "date-fns";
import { de } from "date-fns/locale";

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const period = (searchParams.get("period") || "month") as "week" | "month" | "year";
      const view = searchParams.get("view") || "overview"; // overview, individual
      const instructorIdParam = searchParams.get("instructorId");
      const lessonTypeFilter = searchParams.get("lessonType");

      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case "week":
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          endDate = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case "year":
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        case "month":
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
      }

      const isAdmin = hasAdminAccess(user.role);

      // New view-based response
      if (view === "overview") {
        // Gesamtübersicht: Schülerwachstum + Fahrlehrer-Breakdown
        const studentGrowth = await getStudentGrowthData(startDate, endDate, period);
        const instructorBreakdown = await getInstructorBreakdownData(
          startDate,
          endDate,
          isAdmin ? undefined : user.id
        );

        return NextResponse.json({
          view: "overview",
          studentGrowth,
          instructorBreakdown,
          period,
          isAdmin,
        });
      }

      if (view === "billing") {
        // Abrechnungsübersicht: Stunden pro Fahrlehrer
        const customStartDate = searchParams.get("startDate");
        const customEndDate = searchParams.get("endDate");

        const billingStartDate = customStartDate ? new Date(customStartDate) : startDate;
        const billingEndDate = customEndDate ? new Date(customEndDate) : endDate;

        // Normalize billingEndDate to end of day (23:59:59.999)
        billingEndDate.setHours(23, 59, 59, 999);

        const billingData = await getBillingData(
          billingStartDate,
          billingEndDate,
          isAdmin ? undefined : user.id
        );

        return NextResponse.json({
          view: "billing",
          ...billingData,
          period: {
            startDate: billingStartDate.toISOString(),
            endDate: billingEndDate.toISOString(),
          },
          isAdmin,
        });
      }

      if (view === "individual") {
        // Einzelübersicht: Fahrlehrer-Analyse + Detailtabelle
        const customStartDate = searchParams.get("startDate");
        const customEndDate = searchParams.get("endDate");

        const individualStartDate = customStartDate ? new Date(customStartDate) : startDate;
        const individualEndDate = customEndDate ? new Date(customEndDate) : endDate;

        // Normalize individualEndDate to end of day (23:59:59.999)
        individualEndDate.setHours(23, 59, 59, 999);

        const instructors = await getInstructorList(isAdmin ? undefined : user.id);

        // Wenn kein Fahrlehrer ausgewählt, den ersten oder eigenen nehmen
        let selectedInstructorId = instructorIdParam;
        if (!selectedInstructorId && instructors.length > 0) {
          selectedInstructorId = isAdmin ? instructors[0].id : user.id;
        }

        const instructorTimeline = selectedInstructorId
          ? await getInstructorTimelineData(individualStartDate, individualEndDate, selectedInstructorId, period)
          : [];

        const lessons = selectedInstructorId
          ? await getInstructorLessonsData(individualStartDate, individualEndDate, selectedInstructorId, lessonTypeFilter)
          : [];

        const summary = selectedInstructorId
          ? await getInstructorSummary(individualStartDate, individualEndDate, selectedInstructorId)
          : { totalLessons: 0, totalHours: 0, totalStudents: 0 };

        return NextResponse.json({
          view: "individual",
          instructors,
          instructorTimeline,
          lessons,
          summary,
          period,
          selectedInstructorId,
          isAdmin,
        });
      }

      // Legacy response for backwards compatibility
      const instructorStats = await getInstructorStats(
        startDate,
        endDate,
        isAdmin ? undefined : user.id
      );

      const lessonTypeDistribution = await getLessonTypeDistribution(
        startDate,
        endDate,
        isAdmin ? undefined : user.id
      );

      const examStats = await getExamStats(
        startDate,
        endDate,
        isAdmin ? undefined : user.id
      );

      const studentStats = await getStudentStats(isAdmin ? undefined : user.id);

      let vehicleStats: { id: string; name: string; licensePlate: string; totalLessons: number; totalHours: number }[] = [];
      if (isAdmin) {
        vehicleStats = await getVehicleStats(startDate, endDate);
      }

      let financialStats = null;
      if (isAdmin) {
        financialStats = await getFinancialStats(startDate, endDate);
      }

      const summary = await getSummary(
        startDate,
        endDate,
        isAdmin ? undefined : user.id
      );

      return NextResponse.json({
        instructorStats,
        lessonTypeDistribution,
        examStats,
        studentStats,
        vehicleStats,
        financialStats,
        summary,
        period,
        isAdmin,
      });
    } catch (error) {
      console.error("Statistics error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Laden der Statistiken" } },
        { status: 500 }
      );
    }
  });
}

async function getInstructorStats(
  startDate: Date,
  endDate: Date,
  instructorId?: string
) {
  const where: Prisma.AppointmentWhereInput = {
    startTime: { gte: startDate, lte: endDate },
    type: { not: "THEORY_LESSON" },
    deletedAt: null, // Exclude soft-deleted appointments
  };

  if (instructorId) {
    where.instructorId = instructorId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      instructor: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  const statsMap = new Map<
    string,
    {
      id: string;
      name: string;
      totalLessons: number;
      totalMinutes: number;
      practicalLessons: number;
      specialDrives: number;
    }
  >();

  appointments.forEach((apt) => {
    const instructorKey = apt.instructor.id;
    const existing = statsMap.get(instructorKey) || {
      id: apt.instructor.id,
      name: `${apt.instructor.firstName} ${apt.instructor.lastName}`,
      totalLessons: 0,
      totalMinutes: 0,
      practicalLessons: 0,
      specialDrives: 0,
    };

    existing.totalLessons++;
    existing.totalMinutes += differenceInMinutes(apt.endTime, apt.startTime);

    if (apt.type === "PRACTICAL_LESSON" && !apt.routeType) {
      existing.practicalLessons++;
    } else if (apt.routeType) {
      existing.specialDrives++;
    }

    statsMap.set(instructorKey, existing);
  });

  return Array.from(statsMap.values()).map((s) => ({
    ...s,
    totalHours: Math.round((s.totalMinutes / 60) * 10) / 10,
  }));
}

async function getLessonTypeDistribution(
  startDate: Date,
  endDate: Date,
  instructorId?: string
) {
  const where: Prisma.AppointmentWhereInput = {
    startTime: { gte: startDate, lte: endDate },
    deletedAt: null, // Exclude soft-deleted appointments
  };

  if (instructorId) {
    where.instructorId = instructorId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    select: { type: true, routeType: true },
  });

  const distribution: Record<string, number> = {
    PRACTICAL_LESSON: 0,
    THEORY_LESSON: 0,
    EXAM: 0,
    HIGHWAY: 0,
    NIGHT_DRIVE: 0,
    COUNTRY_ROAD: 0,
  };

  appointments.forEach((apt) => {
    if (apt.routeType) {
      // Sonderfahrten nach routeType zählen
      if (apt.routeType === "HIGHWAY") distribution.HIGHWAY++;
      else if (apt.routeType === "NIGHT") distribution.NIGHT_DRIVE++;
      else if (apt.routeType === "COUNTRY") distribution.COUNTRY_ROAD++;
    } else if (apt.type in distribution) {
      distribution[apt.type]++;
    }
  });

  return distribution;
}

async function getExamStats(
  startDate: Date,
  endDate: Date,
  instructorId?: string
) {
  // Prüfungsergebnisse werden über Student.passedAt getrackt, nicht über PaymentStatus
  // passedAt !== null = bestanden, passedAt === null = noch nicht bestanden
  // Exclude soft-deleted students from statistics
  const [passed, pending] = await Promise.all([
    prisma.student.count({ where: { passedAt: { not: null }, isDeleted: false } }),
    prisma.student.count({ where: { passedAt: null, isActive: true, isDeleted: false } }),
  ]);

  const total = passed + pending;

  return {
    total,
    passed,
    pending,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
  };
}

async function getStudentStats(instructorId?: string) {
  // Für Fahrlehrer: nur Schüler mit Terminen bei diesem Fahrlehrer
  if (instructorId) {
    const studentsWithAppointments = await prisma.student.findMany({
      where: {
        isDeleted: false, // Exclude soft-deleted students
        appointments: {
          some: { instructorId, deletedAt: null },
        },
      },
      select: {
        id: true,
        isActive: true,
        passedAt: true,
      },
    });

    return {
      total: studentsWithAppointments.length,
      active: studentsWithAppointments.filter((s) => s.isActive && !s.passedAt).length,
      completed: studentsWithAppointments.filter((s) => s.passedAt !== null).length,
      inactive: studentsWithAppointments.filter((s) => !s.isActive && !s.passedAt).length,
    };
  }

  // Für Admin: alle Schüler (excluding soft-deleted)
  const [total, active, completed] = await Promise.all([
    prisma.student.count({ where: { isDeleted: false } }),
    prisma.student.count({ where: { isActive: true, passedAt: null, isDeleted: false } }),
    prisma.student.count({ where: { passedAt: { not: null }, isDeleted: false } }),
  ]);

  return {
    total,
    active,
    completed,
    inactive: total - active - completed,
  };
}

async function getVehicleStats(startDate: Date, endDate: Date) {
  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true },
    include: {
      appointments: {
        where: {
          startTime: { gte: startDate, lte: endDate },
          deletedAt: null, // Exclude soft-deleted appointments
        },
        select: {
          startTime: true,
          endTime: true,
        },
      },
    },
  });

  return vehicles.map((vehicle) => {
    const totalMinutes = vehicle.appointments.reduce((sum, apt) => {
      return sum + differenceInMinutes(apt.endTime, apt.startTime);
    }, 0);

    return {
      id: vehicle.id,
      name: vehicle.name,
      licensePlate: vehicle.licensePlate,
      totalLessons: vehicle.appointments.length,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    };
  });
}

async function getFinancialStats(startDate: Date, endDate: Date) {
  const [openPayments, paidPayments] = await Promise.all([
    prisma.appointment.count({
      where: {
        paymentStatus: "OPEN",
        type: { not: "THEORY_LESSON" },
        startTime: { gte: startDate, lte: endDate },
        deletedAt: null, // Exclude soft-deleted appointments
      },
    }),
    prisma.appointment.count({
      where: {
        paymentStatus: "PAID",
        type: { not: "THEORY_LESSON" },
        startTime: { gte: startDate, lte: endDate },
        deletedAt: null, // Exclude soft-deleted appointments
      },
    }),
  ]);

  return {
    openPayments,
    paidPayments,
    totalAppointments: openPayments + paidPayments,
  };
}

async function getSummary(
  startDate: Date,
  endDate: Date,
  instructorId?: string
) {
  const where: Prisma.AppointmentWhereInput = {
    startTime: { gte: startDate, lte: endDate },
    type: { not: "THEORY_LESSON" },
    deletedAt: null, // Exclude soft-deleted appointments
  };

  if (instructorId) {
    where.instructorId = instructorId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    select: { startTime: true, endTime: true },
  });

  const totalLessons = appointments.length;
  const totalMinutes = appointments.reduce((sum, apt) => {
    return sum + differenceInMinutes(apt.endTime, apt.startTime);
  }, 0);

  return {
    totalLessons,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
  };
}

// ========================================
// NEW HELPER FUNCTIONS FOR REDESIGNED UI
// ========================================

const DAY_NAMES: Record<number, string> = {
  0: "Sonntag",
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
};

const LESSON_TYPE_LABELS: Record<string, string> = {
  PRACTICAL_LESSON: "Übungsfahrt",
  THEORY_LESSON: "Theorie",
  EXAM: "Prüfung",
  HIGHWAY: "Autobahnfahrt",
  NIGHT_DRIVE: "Nachtfahrt",
  COUNTRY_ROAD: "Überlandfahrt",
};

// Get student growth data for line chart
async function getStudentGrowthData(
  startDate: Date,
  endDate: Date,
  period: "week" | "month" | "year"
) {
  // Get all students to calculate active count at each point (excluding deleted)
  const students = await prisma.student.findMany({
    where: {
      isDeleted: false, // Exclude soft-deleted students
    },
    select: {
      id: true,
      registeredAt: true,
      passedAt: true,
      isActive: true,
    },
  });

  // Generate time points based on period
  let timePoints: Date[];
  let formatStr: string;

  switch (period) {
    case "week":
      timePoints = eachDayOfInterval({ start: startDate, end: endDate });
      formatStr = "EEE";
      break;
    case "month":
      timePoints = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      );
      formatStr = "'KW' w";
      break;
    case "year":
      timePoints = eachMonthOfInterval({ start: startDate, end: endDate });
      formatStr = "MMM";
      break;
    default:
      timePoints = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      );
      formatStr = "'KW' w";
  }

  // Calculate active students at each time point
  return timePoints.map((date) => {
    const activeCount = students.filter((student) => {
      // Student was registered before or on this date
      const wasRegistered = student.registeredAt <= date;
      // Student has not passed yet (or passed after this date)
      const hasNotPassed = !student.passedAt || student.passedAt > date;
      return wasRegistered && hasNotPassed && student.isActive;
    }).length;

    return {
      date: format(date, formatStr, { locale: de }),
      activeStudents: activeCount,
    };
  });
}

// Get instructor breakdown for stacked bar chart
async function getInstructorBreakdownData(
  startDate: Date,
  endDate: Date,
  instructorId?: string
) {
  const where: Prisma.AppointmentWhereInput = {
    startTime: { gte: startDate, lte: endDate },
    deletedAt: null, // Exclude soft-deleted appointments
  };

  if (instructorId) {
    where.instructorId = instructorId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      instructor: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  // Group by instructor
  const instructorMap = new Map<
    string,
    {
      instructorId: string;
      instructorName: string;
      uebungsfahrten: number;
      sonderfahrten: number;
      theorie: number;
      pruefungen: number;
    }
  >();

  appointments.forEach((apt) => {
    const key = apt.instructor.id;
    const existing = instructorMap.get(key) || {
      instructorId: apt.instructor.id,
      instructorName: `${apt.instructor.firstName} ${apt.instructor.lastName}`,
      uebungsfahrten: 0,
      sonderfahrten: 0,
      theorie: 0,
      pruefungen: 0,
    };

    // Categorize the appointment
    if (apt.type === "THEORY_LESSON") {
      existing.theorie++;
    } else if (apt.type === "EXAM") {
      existing.pruefungen++;
    } else if (
      apt.routeType ||
      ["HIGHWAY", "NIGHT_DRIVE", "COUNTRY_ROAD"].includes(apt.type)
    ) {
      existing.sonderfahrten++;
    } else {
      existing.uebungsfahrten++;
    }

    instructorMap.set(key, existing);
  });

  return Array.from(instructorMap.values());
}

// Get list of instructors for dropdown
async function getInstructorList(onlyThisInstructor?: string) {
  if (onlyThisInstructor) {
    const instructor = await prisma.user.findUnique({
      where: { id: onlyThisInstructor },
      select: { id: true, firstName: true, lastName: true },
    });
    return instructor
      ? [{ id: instructor.id, name: `${instructor.firstName} ${instructor.lastName}` }]
      : [];
  }

  const instructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR", isActive: true, isDeleted: false },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });

  return instructors.map((i) => ({
    id: i.id,
    name: `${i.firstName} ${i.lastName}`,
  }));
}

// Get instructor timeline for individual stacked bar chart
async function getInstructorTimelineData(
  startDate: Date,
  endDate: Date,
  instructorId: string,
  period: "week" | "month" | "year"
) {
  const appointments = await prisma.appointment.findMany({
    where: {
      instructorId,
      startTime: { gte: startDate, lte: endDate },
      deletedAt: null, // Exclude soft-deleted appointments
    },
    select: {
      type: true,
      routeType: true,
      startTime: true,
    },
  });

  // Generate time points
  let timePoints: Date[];
  let formatStr: string;

  switch (period) {
    case "week":
      timePoints = eachDayOfInterval({ start: startDate, end: endDate });
      formatStr = "EEE";
      break;
    case "month":
      timePoints = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      );
      formatStr = "'KW' w";
      break;
    case "year":
      timePoints = eachMonthOfInterval({ start: startDate, end: endDate });
      formatStr = "MMM";
      break;
    default:
      timePoints = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      );
      formatStr = "'KW' w";
  }

  // Calculate counts for each time point
  return timePoints.map((pointDate, index) => {
    const nextPoint = timePoints[index + 1];

    const pointAppointments = appointments.filter((apt) => {
      if (nextPoint) {
        return apt.startTime >= pointDate && apt.startTime < nextPoint;
      }
      return apt.startTime >= pointDate && apt.startTime <= endDate;
    });

    let fahrstunden = 0;
    let theorie = 0;
    let pruefungen = 0;

    pointAppointments.forEach((apt) => {
      if (apt.type === "THEORY_LESSON") {
        theorie++;
      } else if (apt.type === "EXAM") {
        pruefungen++;
      } else {
        fahrstunden++;
      }
    });

    return {
      period: format(pointDate, formatStr, { locale: de }),
      fahrstunden,
      theorie,
      pruefungen,
    };
  });
}

// Get detailed lessons list for table
async function getInstructorLessonsData(
  startDate: Date,
  endDate: Date,
  instructorId: string,
  lessonTypeFilter?: string | null
) {
  const where: Prisma.AppointmentWhereInput = {
    instructorId,
    startTime: { gte: startDate, lte: endDate },
    deletedAt: null, // Exclude soft-deleted appointments
  };

  // Apply lesson type filter
  if (lessonTypeFilter) {
    if (lessonTypeFilter === "SONDERFAHRT") {
      where.OR = [
        { type: "HIGHWAY" },
        { type: "NIGHT_DRIVE" },
        { type: "COUNTRY_ROAD" },
        { routeType: { not: null } },
      ];
    } else {
      where.type = lessonTypeFilter as Prisma.EnumAppointmentTypeFilter;
    }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      student: {
        select: { firstName: true, lastName: true, passedAt: true },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return appointments.map((apt) => {
    const duration = differenceInMinutes(apt.endTime, apt.startTime);
    const dayNum = getDay(apt.startTime);

    // Determine lesson type label
    let lessonType = LESSON_TYPE_LABELS[apt.type] || apt.type;
    if (apt.routeType) {
      const routeLabels: Record<string, string> = {
        COUNTRY: "Überlandfahrt",
        HIGHWAY: "Autobahnfahrt",
        NIGHT: "Nachtfahrt",
      };
      lessonType = routeLabels[apt.routeType] || lessonType;
    }

    // Determine exam result for EXAM appointments (based on Student.passedAt)
    let examResult: "passed" | "pending" | undefined;
    if (apt.type === "EXAM") {
      examResult = apt.student?.passedAt ? "passed" : "pending";
    }

    return {
      id: apt.id,
      date: format(apt.startTime, "dd.MM.yyyy", { locale: de }),
      dayName: DAY_NAMES[dayNum],
      studentName: apt.student
        ? `${apt.student.firstName} ${apt.student.lastName}`
        : "Kein Schüler",
      time: `${format(apt.startTime, "HH:mm")} - ${format(apt.endTime, "HH:mm")}`,
      lessonType,
      duration,
      examResult,
    };
  });
}

// Get summary stats for selected instructor
async function getInstructorSummary(
  startDate: Date,
  endDate: Date,
  instructorId: string
) {
  const appointments = await prisma.appointment.findMany({
    where: {
      instructorId,
      startTime: { gte: startDate, lte: endDate },
      type: { not: "THEORY_LESSON" },
      deletedAt: null, // Exclude soft-deleted appointments
    },
    select: {
      startTime: true,
      endTime: true,
      studentId: true,
    },
  });

  const totalMinutes = appointments.reduce((sum, apt) => {
    return sum + differenceInMinutes(apt.endTime, apt.startTime);
  }, 0);

  const uniqueStudents = new Set(
    appointments.filter((a) => a.studentId).map((a) => a.studentId)
  );

  return {
    totalLessons: appointments.length,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    totalStudents: uniqueStudents.size,
  };
}

// Get billing data for instructor hours breakdown
async function getBillingData(
  startDate: Date,
  endDate: Date,
  instructorId?: string
) {
  const where: Prisma.AppointmentWhereInput = {
    startTime: { gte: startDate, lte: endDate },
    deletedAt: null, // Exclude soft-deleted appointments
  };

  if (instructorId) {
    where.instructorId = instructorId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      instructor: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  // Group by instructor and calculate hours per type
  const instructorMap = new Map<
    string,
    {
      instructorId: string;
      instructorName: string;
      uebungsfahrten: number;
      sonderfahrten: number;
      theorie: number;
      pruefungen: number;
    }
  >();

  appointments.forEach((apt) => {
    const hours = differenceInMinutes(apt.endTime, apt.startTime) / 60;
    const key = apt.instructor.id;

    const existing = instructorMap.get(key) || {
      instructorId: apt.instructor.id,
      instructorName: `${apt.instructor.firstName} ${apt.instructor.lastName}`,
      uebungsfahrten: 0,
      sonderfahrten: 0,
      theorie: 0,
      pruefungen: 0,
    };

    // Categorize based on type and routeType
    if (apt.type === "THEORY_LESSON") {
      existing.theorie += hours;
    } else if (apt.type === "EXAM") {
      existing.pruefungen += hours;
    } else if (apt.routeType) {
      // Sonderfahrten: has routeType (COUNTRY, HIGHWAY, NIGHT)
      existing.sonderfahrten += hours;
    } else {
      // Regular practice drives
      existing.uebungsfahrten += hours;
    }

    instructorMap.set(key, existing);
  });

  const instructorHours = Array.from(instructorMap.values())
    .map((i) => ({
      ...i,
      // Round to 1 decimal place
      uebungsfahrten: Math.round(i.uebungsfahrten * 10) / 10,
      sonderfahrten: Math.round(i.sonderfahrten * 10) / 10,
      theorie: Math.round(i.theorie * 10) / 10,
      pruefungen: Math.round(i.pruefungen * 10) / 10,
      total: Math.round((i.uebungsfahrten + i.sonderfahrten + i.theorie + i.pruefungen) * 10) / 10,
    }))
    .sort((a, b) => a.instructorName.localeCompare(b.instructorName));

  // Calculate totals
  const totals = instructorHours.reduce(
    (acc, i) => ({
      uebungsfahrten: Math.round((acc.uebungsfahrten + i.uebungsfahrten) * 10) / 10,
      sonderfahrten: Math.round((acc.sonderfahrten + i.sonderfahrten) * 10) / 10,
      theorie: Math.round((acc.theorie + i.theorie) * 10) / 10,
      pruefungen: Math.round((acc.pruefungen + i.pruefungen) * 10) / 10,
      total: Math.round((acc.total + i.total) * 10) / 10,
    }),
    { uebungsfahrten: 0, sonderfahrten: 0, theorie: 0, pruefungen: 0, total: 0 }
  );

  return { instructorHours, totals };
}

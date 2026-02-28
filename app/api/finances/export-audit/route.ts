// app/api/finances/export-audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// Appointment type labels for CSV export
const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  PRACTICAL_LESSON: "Praktische Fahrstunde",
  THEORY_LESSON: "Theoriestunde",
  EXAM: "Prüfung",
  HIGHWAY: "Autobahnfahrt",
  NIGHT_DRIVE: "Nachtfahrt",
  COUNTRY_ROAD: "Überlandfahrt",
};

const ROUTE_TYPE_LABELS: Record<string, string> = {
  COUNTRY: "Überland",
  HIGHWAY: "Autobahn",
  NIGHT: "Nachtfahrt",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  OPEN: "Offen",
  PAID: "Bezahlt",
};

// Helper to escape CSV fields
function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Helper to format date for CSV
function formatDate(date: Date | null): string {
  if (!date) return "";
  return format(date, "dd.MM.yyyy HH:mm", { locale: de });
}

// GET: Export appointments for auditors (including deleted records)
export async function GET(request: NextRequest) {
  return withAdmin(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      // Build date filter (optional)
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }

      // Load ALL appointments (including deleted ones for audit trail)
      const appointments = await prisma.appointment.findMany({
        where: {
          ...(Object.keys(dateFilter).length > 0 && { startTime: dateFilter }),
          // NO deletedAt filter - load ALL records for audit
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              isDeleted: true,
            },
          },
          instructor: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          vehicle: {
            select: {
              name: true,
              licensePlate: true,
            },
          },
        },
        orderBy: { startTime: "asc" },
      });

      // CSV header
      const headers = [
        "Datum",
        "Startzeit",
        "Endzeit",
        "Typ",
        "Sonderfahrt",
        "Zahlungsstatus",
        "Schüler-Vorname",
        "Schüler-Nachname",
        "Schüler-Gelöscht",
        "Fahrlehrer-Name",
        "Fahrzeug",
        "Kennzeichen",
        "Termin-Gelöscht",
        "Termin-Gelöscht-Am",
        "Erstellt-Am",
        "Aktualisiert-Am",
      ];

      let csvContent = headers.join(";") + "\n";

      // CSV rows
      for (const apt of appointments) {
        const row = [
          escapeCSV(format(apt.startTime, "dd.MM.yyyy", { locale: de })),
          escapeCSV(format(apt.startTime, "HH:mm", { locale: de })),
          escapeCSV(format(apt.endTime, "HH:mm", { locale: de })),
          escapeCSV(APPOINTMENT_TYPE_LABELS[apt.type] || apt.type),
          escapeCSV(apt.routeType ? ROUTE_TYPE_LABELS[apt.routeType] || apt.routeType : ""),
          escapeCSV(PAYMENT_STATUS_LABELS[apt.paymentStatus] || apt.paymentStatus),
          escapeCSV(apt.student?.firstName),
          escapeCSV(apt.student?.lastName),
          escapeCSV(apt.student?.isDeleted ? "Ja" : "Nein"),
          escapeCSV(apt.instructor ? `${apt.instructor.firstName} ${apt.instructor.lastName}` : ""),
          escapeCSV(apt.vehicle?.name),
          escapeCSV(apt.vehicle?.licensePlate),
          escapeCSV(apt.deletedAt ? "Ja" : "Nein"),
          escapeCSV(formatDate(apt.deletedAt)),
          escapeCSV(formatDate(apt.createdAt)),
          escapeCSV(formatDate(apt.updatedAt)),
        ];
        csvContent += row.join(";") + "\n";
      }

      const filename = `audit-termine-${format(new Date(), "yyyy-MM-dd")}.csv`;

      // Add BOM for Excel UTF-8 compatibility
      const bom = "\uFEFF";
      const csvWithBom = bom + csvContent;

      // Return as downloadable CSV file
      return new NextResponse(csvWithBom, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      console.error("Export audit error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Exportieren der Audit-Daten" } },
        { status: 500 }
      );
    }
  });
}

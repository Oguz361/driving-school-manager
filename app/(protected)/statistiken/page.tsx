"use client";

import { useState, useEffect, useCallback } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/statistics/DateRangePicker";
import { StatisticsSummaryCards } from "@/components/statistics/StatisticsSummaryCards";
import { InstructorHoursTable } from "@/components/statistics/InstructorHoursTable";
import { ExportButtons } from "@/components/statistics/ExportButtons";
import { Calculator } from "lucide-react";

interface InstructorHours {
  instructorId: string;
  instructorName: string;
  uebungsfahrten: number;
  sonderfahrten: number;
  theorie: number;
  pruefungen: number;
  total: number;
}

interface BillingData {
  view: "billing";
  instructorHours: InstructorHours[];
  totals: {
    uebungsfahrten: number;
    sonderfahrten: number;
    theorie: number;
    pruefungen: number;
    total: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  isAdmin: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="border-border/40">
        <CardContent className="p-0">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1 max-w-[200px]" />
                <div className="flex-1 flex justify-end gap-8">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-12" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StatisticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [data, setData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        view: "billing",
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });

      const res = await fetch(`/api/statistics?${params}`, {
        credentials: "include",
      });

      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Statistiken:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const currentDate = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Page setup */
          @page {
            size: A4;
            margin: 20mm;
          }

          /* Hide everything by default */
          body * {
            visibility: hidden;
          }

          /* Show only print area */
          #print-area,
          #print-area * {
            visibility: visible;
          }

          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
          }

          /* Hide screen-only content */
          .screen-only {
            display: none !important;
          }

          /* Clean typography */
          #print-area {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11pt;
            color: #000;
            line-height: 1.4;
          }

          /* Header styling */
          .print-header {
            border-bottom: 2px solid #000;
            padding-bottom: 16px;
            margin-bottom: 28px;
          }

          .print-title {
            font-size: 20pt;
            font-weight: 600;
            letter-spacing: -0.5px;
            margin: 0 0 6px 0;
          }

          .print-subtitle {
            font-size: 10pt;
            color: #555;
            margin: 0;
          }

          /* Table styling */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #ccc;
            padding: 10px 14px;
            text-align: right;
          }

          .print-table th:first-child,
          .print-table td:first-child {
            text-align: left;
          }

          .print-table thead tr {
            background: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-table th {
            font-weight: 600;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #333;
          }

          .print-table tbody tr:nth-child(even) {
            background: #fafafa !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-table tfoot tr {
            background: #f0f0f0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-table tfoot td {
            font-weight: 600;
            border-top: 2px solid #000;
          }

          .print-table .total-cell {
            font-weight: 700;
          }

          /* Footer */
          .print-footer {
            margin-top: 36px;
            padding-top: 14px;
            border-top: 1px solid #ddd;
            font-size: 9pt;
            color: #777;
            display: flex;
            justify-content: space-between;
          }
        }
      `}</style>

      {/* Print-Only Content */}
      <div id="print-area" className="hidden print:block">
        <div className="print-header">
          <h1 className="print-title">Stundenabrechnung</h1>
          {data?.period && (
            <p className="print-subtitle">
              Zeitraum: {formatDate(data.period.startDate)} – {formatDate(data.period.endDate)}
            </p>
          )}
        </div>

        {data && (
          <table className="print-table">
            <thead>
              <tr>
                <th>Fahrlehrer</th>
                <th>Übungsfahrten</th>
                <th>Sonderfahrten</th>
                <th>Theorie</th>
                <th>Prüfungen</th>
                <th>Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {data.instructorHours.map((instructor) => (
                <tr key={instructor.instructorId}>
                  <td>{instructor.instructorName}</td>
                  <td>{instructor.uebungsfahrten.toFixed(1)} h</td>
                  <td>{instructor.sonderfahrten.toFixed(1)} h</td>
                  <td>{instructor.theorie.toFixed(1)} h</td>
                  <td>{instructor.pruefungen.toFixed(1)} h</td>
                  <td className="total-cell">{instructor.total.toFixed(1)} h</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Summe</td>
                <td>{data.totals.uebungsfahrten.toFixed(1)} h</td>
                <td>{data.totals.sonderfahrten.toFixed(1)} h</td>
                <td>{data.totals.theorie.toFixed(1)} h</td>
                <td>{data.totals.pruefungen.toFixed(1)} h</td>
                <td className="total-cell">{data.totals.total.toFixed(1)} h</td>
              </tr>
            </tfoot>
          </table>
        )}

        <div className="print-footer">
          <span>Erstellt am: {currentDate}</span>
          <span>Fahrschul-Management-System</span>
        </div>
      </div>

      {/* Screen-Only Content */}
      <div className="min-h-screen screen-only">
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Statistiken
              </h1>
              <p className="text-sm text-muted-foreground">
                Übersicht der geleisteten Stunden pro Fahrlehrer
              </p>
            </div>

            {/* Export Button */}
            {data && !isLoading && (
              <div className="no-print">
                <ExportButtons
                  instructors={data.instructorHours}
                  totals={data.totals}
                  period={data.period}
                />
              </div>
            )}
          </div>

          {/* Date Range Picker */}
          <Card className="border-border/40 no-print">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Zeitraum
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </CardContent>
          </Card>

          {/* Content */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : data ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <StatisticsSummaryCards totals={data.totals} />

              {/* Instructor Hours Table */}
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Aufschlüsselung nach Fahrlehrer
                </h2>
                <InstructorHoursTable
                  instructors={data.instructorHours}
                  totals={data.totals}
                  dateRange={dateRange}
                />
              </div>
            </div>
          ) : (
            <Card className="border-border/40">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-3 rounded-full bg-muted/50 mb-4">
                    <Calculator className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Keine Daten verfügbar
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Wähle einen Zeitraum aus, um die Statistiken zu laden
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

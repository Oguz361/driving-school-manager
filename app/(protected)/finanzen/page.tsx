"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Receipt,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Car,
  User,
  Calendar,
  Download,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/statistics/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
}

interface Appointment {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  paymentStatus: "OPEN" | "PAID";
  student: Student | null;
  instructor: Instructor;
  vehicle: Vehicle | null;
}

interface Stats {
  open: number;
  paid: number;
  total: number;
}

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  PRACTICAL_LESSON: "Fahrstunde",
  THEORY_LESSON: "Theorie",
  EXAM: "Prüfung",
  HIGHWAY: "Autobahn",
  NIGHT_DRIVE: "Nachtfahrt",
  COUNTRY_ROAD: "Überlandfahrt",
};

type FilterStatus = "all" | "OPEN" | "PAID";

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50"
        >
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  variant?: "default" | "warning" | "success";
}) {
  const variants = {
    default: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
    warning: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    success: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  };

  const iconVariants = {
    default: "text-neutral-500",
    warning: "text-amber-500",
    success: "text-emerald-500",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-5 transition-all duration-300",
        variants[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-70">
            {label}
          </p>
          <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "p-3 rounded-xl bg-white/50 dark:bg-black/20",
            iconVariants[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function PaymentStatusBadge({
  status,
  onClick,
}: {
  status: "OPEN" | "PAID";
  onClick: () => void;
}) {
  const isOpen = status === "OPEN";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
              "hover:scale-105 active:scale-95 cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              isOpen
                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 focus:ring-amber-500"
                : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 focus:ring-emerald-500"
            )}
          >
            {isOpen ? (
              <Clock className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {isOpen ? "Offen" : "Bezahlt"}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Klicken um auf {isOpen ? "Bezahlt" : "Offen"} zu setzen</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function FinanzenPage() {
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({ open: 0, paid: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (filterStatus !== "all") params.set("paymentStatus", filterStatus);
      if (dateRange?.from) params.set("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.set("endDate", dateRange.to.toISOString());

      const res = await fetch(`/api/finances?${params.toString()}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterStatus, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const togglePaymentStatus = async (appointment: Appointment) => {
    const newStatus = appointment.paymentStatus === "OPEN" ? "PAID" : "OPEN";

    setUpdatingIds((prev) => new Set(prev).add(appointment.id));

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      if (res.ok) {
        // Update local state optimistically
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointment.id ? { ...a, paymentStatus: newStatus } : a
          )
        );
        setStats((prev) => ({
          ...prev,
          open: newStatus === "OPEN" ? prev.open + 1 : prev.open - 1,
          paid: newStatus === "PAID" ? prev.paid + 1 : prev.paid - 1,
        }));
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(appointment.id);
        return next;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExportCSV = () => {
    const headers = ["Datum", "Zeit", "Schüler", "Typ", "Fahrlehrer", "Status"];

    const rows = appointments.map((a) => [
      formatDate(a.startTime),
      `${formatTime(a.startTime)} - ${formatTime(a.endTime)}`,
      a.student ? `${a.student.firstName} ${a.student.lastName}` : "-",
      APPOINTMENT_TYPE_LABELS[a.type] || a.type,
      `${a.instructor.firstName} ${a.instructor.lastName}`,
      a.paymentStatus === "PAID" ? "Bezahlt" : "Offen",
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Finanzen_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filterTabs: { label: string; value: FilterStatus; count: number }[] = [
    { label: "Alle", value: "all", count: stats.total },
    { label: "Offen", value: "OPEN", count: stats.open },
    { label: "Bezahlt", value: "PAID", count: stats.paid },
  ];

  return (
    <div className="min-h-screen">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Finanzverwaltung
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Zahlungsstatus aller Termine
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleExportCSV} className="gap-3 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <div className="flex flex-col">
                  <span className="font-medium">CSV Export</span>
                  <span className="text-xs text-muted-foreground">Für Excel</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatCard
            label="Offen"
            value={stats.open}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            label="Bezahlt"
            value={stats.paid}
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            label="Gesamt"
            value={stats.total}
            icon={Calendar}
            variant="default"
          />
        </div>

        <Card className="border-border/40">
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

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 gap-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500",
                  filterStatus === tab.value
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-2 px-1.5 py-0.5 rounded-md text-xs",
                    filterStatus === tab.value
                      ? "bg-neutral-100 dark:bg-neutral-600"
                      : "bg-neutral-200/50 dark:bg-neutral-700"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Schüler suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 rounded-xl"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex flex-col items-center justify-center">
                <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
                  <Receipt className="h-8 w-8 text-neutral-400" />
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Keine Termine gefunden
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  Passen Sie Ihre Filterkriterien an
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                    <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300">
                      Datum & Zeit
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300">
                      Schüler
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300">
                      Typ
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300">
                      Fahrlehrer
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300 text-right">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <Calendar className="h-4 w-4 text-neutral-500" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {formatDate(appointment.startTime)}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {formatTime(appointment.startTime)} -{" "}
                              {formatTime(appointment.endTime)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                            <User className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {appointment.student
                              ? `${appointment.student.firstName} ${appointment.student.lastName}`
                              : "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          <Car className="h-3 w-3" />
                          {APPOINTMENT_TYPE_LABELS[appointment.type] ||
                            appointment.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {appointment.instructor.firstName}{" "}
                          {appointment.instructor.lastName}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <PaymentStatusBadge
                          status={appointment.paymentStatus}
                          onClick={() => togglePaymentStatus(appointment)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          <Car className="h-3 w-3" />
                          {APPOINTMENT_TYPE_LABELS[appointment.type]}
                        </span>
                      </div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {appointment.student
                          ? `${appointment.student.firstName} ${appointment.student.lastName}`
                          : "-"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(appointment.startTime)}</span>
                        <span>•</span>
                        <span>
                          {formatTime(appointment.startTime)} -{" "}
                          {formatTime(appointment.endTime)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        {appointment.instructor.firstName}{" "}
                        {appointment.instructor.lastName}
                      </p>
                    </div>
                    <PaymentStatusBadge
                      status={appointment.paymentStatus}
                      onClick={() => togglePaymentStatus(appointment)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

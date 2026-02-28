"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  User,
  ChevronDown,
  Calendar,
  Clock,
  Users,
  Car,
  Route,
  BookOpen,
  GraduationCap,
  Check,
  X,
} from "lucide-react";
import { DateRange } from "react-day-picker";

interface InstructorHours {
  instructorId: string;
  instructorName: string;
  uebungsfahrten: number;
  sonderfahrten: number;
  theorie: number;
  pruefungen: number;
  total: number;
}

interface Lesson {
  id: string;
  date: string;
  dayName: string;
  studentName: string;
  time: string;
  lessonType: string;
  duration: number;
  examResult?: "passed" | "failed" | "pending";
}

interface Summary {
  totalLessons: number;
  totalHours: number;
  totalStudents: number;
}

interface InstructorHoursTableProps {
  instructors: InstructorHours[];
  totals: {
    uebungsfahrten: number;
    sonderfahrten: number;
    theorie: number;
    pruefungen: number;
    total: number;
  };
  className?: string;
  dateRange?: DateRange;
}

function HoursCell({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <TableCell className={cn("text-right tabular-nums", className)}>
      <span className={cn(value === 0 && "text-muted-foreground/50")}>
        {value.toFixed(1)}
        <span className="text-muted-foreground text-xs ml-0.5">h</span>
      </span>
    </TableCell>
  );
}

// Lesson badge styles
function getLessonTypeStyle(type: string) {
  if (
    type.includes("Autobahnfahrt") ||
    type.includes("Nachtfahrt") ||
    type.includes("Überlandfahrt")
  ) {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-500/20";
  }
  if (type.includes("Theorie")) {
    return "bg-purple-500/10 text-purple-700 dark:text-purple-400 ring-purple-500/20";
  }
  if (type.includes("Prüfung")) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20";
  }
  return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20";
}

// Expanded details skeleton
function ExpandedDetailsSkeleton() {
  return (
    <div className="p-5 space-y-5">
      <div className="flex gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-14" />
              <Skeleton className="h-5 w-10" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
      <div className="space-y-2.5">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Expanded instructor details component
function ExpandedInstructorDetails({
  instructor,
  dateRange,
  isVisible,
}: {
  instructor: InstructorHours;
  dateRange?: DateRange;
  isVisible: boolean;
}) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to || hasFetched) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        view: "individual",
        instructorId: instructor.instructorId,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });

      const res = await fetch(`/api/statistics?${params}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setLessons(data.lessons || []);
        setSummary(data.summary || null);
        setHasFetched(true);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [instructor.instructorId, dateRange, hasFetched]);

  useEffect(() => {
    if (isVisible && !hasFetched) {
      fetchDetails();
    }
  }, [isVisible, hasFetched, fetchDetails]);

  if (isLoading) {
    return <ExpandedDetailsSkeleton />;
  }

  return (
    <div className="p-5 space-y-6 bg-gradient-to-b from-muted/30 to-transparent">
      {/* Summary Stats */}
      <div
        className="flex flex-wrap gap-x-10 gap-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={{ animationDelay: "50ms" }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Termine
            </p>
            <p className="text-xl font-semibold tabular-nums leading-tight">
              {summary?.totalLessons ?? 0}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-emerald-500/10">
            <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stunden
            </p>
            <p className="text-xl font-semibold tabular-nums leading-tight">
              {(summary?.totalHours ?? 0).toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">
                h
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-blue-500/10">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Schüler
            </p>
            <p className="text-xl font-semibold tabular-nums leading-tight">
              {summary?.totalStudents ?? 0}
            </p>
          </div>
        </div>
        {/* Übungsfahrten */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-emerald-500/10">
            <Car className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Übungsfahrten
            </p>
            <p className="text-xl font-semibold tabular-nums leading-tight">
              {instructor.uebungsfahrten.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">h</span>
            </p>
          </div>
        </div>

        {/* Sonderfahrten */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-blue-500/10">
            <Route className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sonderfahrten
            </p>
            <p className="text-xl font-semibold tabular-nums leading-tight">
              {instructor.sonderfahrten.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">h</span>
            </p>
          </div>
        </div>

        {/* Theorie */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-purple-500/10">
            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Theorie
            </p>
            <p className="text-xl font-semibold tabular-nums leading-tight">
              {instructor.theorie.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">h</span>
            </p>
          </div>
        </div>

        {/* Prüfungen */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-amber-500/10">
            <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Prüfungen
            </p>
            <p className="text-xl font-semibold tabular-nums leading-tight">
              {instructor.pruefungen.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">h</span>
            </p>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div
        className="space-y-3 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
        style={{ animationDelay: "300ms", animationDuration: "400ms" }}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Termine
          </h4>
          <span className="text-xs text-muted-foreground">
            {lessons.length} Einträge
          </span>
        </div>

        {lessons.length > 0 ? (
          <div className="space-y-2">
            {lessons.slice(0, 6).map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-card/50 px-4 py-3
                  hover:bg-card hover:border-border/60 transition-colors animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
                style={{
                  animationDelay: `${350 + index * 50}ms`,
                  animationDuration: "300ms",
                }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-sm text-muted-foreground shrink-0">
                    <span className="font-medium text-foreground">
                      {lesson.date}
                    </span>
                    <span className="mx-2">·</span>
                    <span>{lesson.dayName}</span>
                    <span className="mx-2">·</span>
                    <span className="font-mono text-xs">{lesson.time}</span>
                  </div>
                  <span className="text-sm text-foreground/70 truncate">
                    {lesson.studentName}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                      getLessonTypeStyle(lesson.lessonType)
                    )}
                  >
                    {lesson.lessonType}
                  </span>
                  {lesson.examResult && (
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        lesson.examResult === "passed" &&
                          "bg-green-500/10 text-green-700 dark:text-green-400 ring-green-500/20",
                        lesson.examResult === "failed" &&
                          "bg-red-500/10 text-red-700 dark:text-red-400 ring-red-500/20",
                        lesson.examResult === "pending" &&
                          "bg-gray-500/10 text-gray-700 dark:text-gray-400 ring-gray-500/20"
                      )}
                    >
                      {lesson.examResult === "passed" && (
                        <>
                          <Check className="h-3 w-3" />
                          Bestanden
                        </>
                      )}
                      {lesson.examResult === "failed" && (
                        <>
                          <X className="h-3 w-3" />
                          Nicht bestanden
                        </>
                      )}
                      {lesson.examResult === "pending" && "Ausstehend"}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {lessons.length > 6 && (
              <p className="text-xs text-center text-muted-foreground pt-1">
                + {lessons.length - 6} weitere Termine
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border/50 py-8">
            <p className="text-sm text-muted-foreground">
              Keine Termine im Zeitraum
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function InstructorHoursTable({
  instructors,
  totals,
  className,
  dateRange,
}: InstructorHoursTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpand = (instructorId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(instructorId)) {
        next.delete(instructorId);
      } else {
        next.add(instructorId);
      }
      return next;
    });
  };

  if (instructors.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border/60 p-12", className)}>
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-full bg-muted/50 mb-4">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Keine Stunden im gewählten Zeitraum
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Wähle einen anderen Zeitraum aus
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 overflow-hidden",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold w-10">
              <span className="sr-only">Erweitern</span>
            </TableHead>
            <TableHead className="font-semibold">Fahrlehrer</TableHead>
            <TableHead className="text-right font-semibold">
              <span className="hidden sm:inline">Übungsfahrten</span>
              <span className="sm:hidden">Übung</span>
            </TableHead>
            <TableHead className="text-right font-semibold">
              <span className="hidden sm:inline">Sonderfahrten</span>
              <span className="sm:hidden">Sonder</span>
            </TableHead>
            <TableHead className="text-right font-semibold">Theorie</TableHead>
            <TableHead className="text-right font-semibold">
              <span className="hidden sm:inline">Prüfungen</span>
              <span className="sm:hidden">Prüf.</span>
            </TableHead>
            <TableHead className="text-right font-semibold">Gesamt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instructors.map((instructor, index) => {
            const isExpanded = expandedRows.has(instructor.instructorId);

            return (
              <Fragment key={instructor.instructorId}>
                <TableRow
                  className={cn(
                    "transition-colors cursor-pointer",
                    index % 2 === 0 && !isExpanded && "bg-muted/5",
                    isExpanded && "bg-muted/20 border-b-0",
                    "hover:bg-muted/20"
                  )}
                  onClick={() => toggleExpand(instructor.instructorId)}
                >
                  <TableCell className="w-10 pr-0">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground/60 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {instructor.instructorName}
                  </TableCell>
                  <HoursCell value={instructor.uebungsfahrten} />
                  <HoursCell value={instructor.sonderfahrten} />
                  <HoursCell value={instructor.theorie} />
                  <HoursCell value={instructor.pruefungen} />
                  <HoursCell
                    value={instructor.total}
                    className="font-semibold text-foreground"
                  />
                </TableRow>

                {/* Expanded Row */}
                {isExpanded && (
                  <TableRow className="bg-muted/10 hover:bg-muted/10">
                    <TableCell colSpan={7} className="p-0 border-t-0">
                      <div
                        className="overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300"
                        style={{ animationFillMode: "both" }}
                      >
                        <ExpandedInstructorDetails
                          instructor={instructor}
                          dateRange={dateRange}
                          isVisible={isExpanded}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/50 font-semibold">
            <TableCell />
            <TableCell>Summe</TableCell>
            <HoursCell value={totals.uebungsfahrten} className="font-semibold" />
            <HoursCell value={totals.sonderfahrten} className="font-semibold" />
            <HoursCell value={totals.theorie} className="font-semibold" />
            <HoursCell value={totals.pruefungen} className="font-semibold" />
            <TableCell className="text-right tabular-nums font-bold text-primary">
              {totals.total.toFixed(1)}
              <span className="text-primary/70 text-xs ml-0.5">h</span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

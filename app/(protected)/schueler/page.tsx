"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
  RefreshCw,
  ChevronDown,
  Car,
  ClipboardList,
  Clock,
  Users,
  UserX,
  UsersRound,
  Calendar,
  Route,
  Moon,
  Download,
} from "lucide-react";
import { IconSchool } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import StudentModal from "@/components/students/StudentModal";
import { StudentExportDialog } from "@/components/students/StudentExportDialog";
import { useSession } from "next-auth/react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  examAuthority: "TUV" | "DEKRA" | null;
  isActive: boolean;
  lastActivity: string;
  registeredAt: string;
  passedAt: string | null;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  _count?: {
    appointments: number;
  };
}

interface LessonStats {
  totalLessons: number;
  totalExams: number;
  byRouteType: {
    COUNTRY: number;
    HIGHWAY: number;
    NIGHT: number;
    NONE: number;
  };
  firstLesson: string | null;
  lastLesson: string | null;
  byInstructor: Array<{ id: string; name: string; count: number }>;
}

interface Lesson {
  id: string;
  date: string;
  type: string;
  routeType: string | null;
  instructor: string;
  instructorId: string;
  notes: string | null;
  paymentStatus: "OPEN" | "PAID";
  duration: number;
}

interface LessonsData {
  stats: LessonStats;
  lessons: Lesson[];
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
}

type FilterStatus = "all" | "active" | "inactive" | "passed";

const ROUTE_LABELS: Record<string, string> = {
  COUNTRY: "Überland",
  HIGHWAY: "Autobahn",
  NIGHT: "Nacht",
};

function ExpandedRowSkeleton() {
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
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
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

function PaymentStatus({ status }: { status: string }) {
  switch (status) {
    case "PAID":
      return (
        <div className="flex items-center gap-1.5 shrink-0">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-600">Bezahlt</span>
        </div>
      );
    case "OPEN":
      return (
        <div className="flex items-center gap-1.5 shrink-0">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-medium text-amber-600">Offen</span>
        </div>
      );
    default:
      return null;
  }
}

function getLessonBadgeStyle(type: string, routeType: string | null) {
  if (type === "EXAM") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20";
  }
  if (routeType === "HIGHWAY") {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-500/20";
  }
  if (routeType === "NIGHT") {
    return "bg-purple-500/10 text-purple-700 dark:text-purple-400 ring-purple-500/20";
  }
  if (routeType === "COUNTRY") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20";
  }
  return "bg-neutral-500/10 text-neutral-700 dark:text-neutral-400 ring-neutral-500/20";
}

export default function StudentsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN" || user?.role === "OWNER";

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("active");

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("all");

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [lessonsCache, setLessonsCache] = useState<Record<string, LessonsData>>(
    {}
  );
  const [loadingLessons, setLoadingLessons] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [futureAppointmentsCount, setFutureAppointmentsCount] = useState(0);
  const [deleteFutureAppointments, setDeleteFutureAppointments] = useState(true);
  const [isLoadingFutureCount, setIsLoadingFutureCount] = useState(false);

  const [undoPassedDialogOpen, setUndoPassedDialogOpen] = useState(false);
  const [studentToUndoPassed, setStudentToUndoPassed] = useState<Student | null>(
    null
  );
  const [isUndoingPassed, setIsUndoingPassed] = useState(false);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [studentToExport, setStudentToExport] = useState<Student | null>(null);

  const [markPassedDialogOpen, setMarkPassedDialogOpen] = useState(false);
  const [studentToMarkPassed, setStudentToMarkPassed] = useState<Student | null>(null);

  useEffect(() => {
    loadStudents();
  }, [selectedInstructorId, filterStatus]);

  useEffect(() => {
    if (isAdmin) {
      loadInstructors();
    }
  }, [isAdmin]);

  const loadInstructors = async () => {
    try {
      const res = await fetch(`/api/users?role=INSTRUCTOR&isActive=true`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setInstructors(data);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Fahrlehrer:", error);
    }
  };

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("all", "true");

      if (selectedInstructorId !== "all") {
        params.set("instructorId", selectedInstructorId);
      }

      const res = await fetch(`/api/students?${params.toString()}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Schüler:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLessons = async (studentId: string) => {
    if (lessonsCache[studentId] || loadingLessons.has(studentId)) return;

    setLoadingLessons((prev) => new Set(prev).add(studentId));

    try {
      const res = await fetch(`/api/students/${studentId}/lessons`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setLessonsCache((prev) => ({ ...prev, [studentId]: data }));
      }
    } catch (error) {
      console.error("Fehler beim Laden der Fahrstunden:", error);
    } finally {
      setLoadingLessons((prev) => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }
  };

  const toggleRow = (studentId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
        loadLessons(studentId);
      }
      return next;
    });
  };

  const stats = useMemo(() => {
    const all = students.length;
    const active = students.filter((s) => s.isActive && !s.passedAt).length;
    const inactive = students.filter((s) => !s.isActive && !s.passedAt).length;
    const passed = students.filter((s) => s.passedAt).length;
    return { all, active, inactive, passed };
  }, [students]);

  const filteredStudents = useMemo(() => {
    let result = students;

    if (filterStatus === "active") {
      result = result.filter((s) => s.isActive && !s.passedAt);
    } else if (filterStatus === "inactive") {
      result = result.filter((s) => !s.isActive && !s.passedAt);
    } else if (filterStatus === "passed") {
      result = result.filter((s) => s.passedAt !== null);
    }

    // Textsuche - Suchbegriff bei Leerzeichen aufteilen, damit "Max Müller" funktioniert
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      result = result.filter((s) =>
        searchTerms.every(term =>
          s.firstName.toLowerCase().includes(term) ||
          s.lastName.toLowerCase().includes(term)
        )
      );
    }

    return result;
  }, [students, searchQuery, filterStatus]);

  const handleOpenCreate = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSuccess = () => {
    loadStudents();
    handleCloseModal();
  };

  const handleOpenDelete = async (student: Student) => {
    setStudentToDelete(student);
    setDeleteFutureAppointments(true);
    setFutureAppointmentsCount(0);
    setDeleteDialogOpen(true);

    setIsLoadingFutureCount(true);
    try {
      const res = await fetch(
        `/api/students/${student.id}?countFutureAppointments=true`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setFutureAppointmentsCount(data.futureAppointmentsCount || 0);
      }
    } catch (error) {
      console.error("Fehler beim Laden der zukünftigen Termine:", error);
    } finally {
      setIsLoadingFutureCount(false);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      const params = new URLSearchParams();
      if (deleteFutureAppointments) {
        params.set("deleteFutureAppointments", "true");
      }

      const res = await fetch(
        `/api/students/${studentToDelete.id}?${params.toString()}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        loadStudents();
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
        setFutureAppointmentsCount(0);
      } else {
        const data = await res.json();
        alert(data.error?.message || "Fehler beim Archivieren");
      }
    } catch (error) {
      console.error("Fehler beim Archivieren:", error);
      alert("Fehler beim Archivieren des Schülers");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (student: Student) => {
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !student.isActive }),
      });

      if (res.ok) {
        loadStudents();
      } else {
        const data = await res.json();
        alert(data.error?.message || "Fehler beim Aktualisieren");
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  const handleOpenMarkPassed = (student: Student) => {
    setStudentToMarkPassed(student);
    setMarkPassedDialogOpen(true);
  };

  const handleMarkPassed = async () => {
    if (!studentToMarkPassed) return;

    try {
      const res = await fetch(`/api/students/${studentToMarkPassed.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ passedAt: new Date().toISOString() }),
      });

      if (res.ok) {
        loadStudents();
      } else {
        const data = await res.json();
        alert(data.error?.message || "Fehler beim Aktualisieren");
      }
    } catch (error) {
      console.error("Fehler:", error);
    } finally {
      setMarkPassedDialogOpen(false);
      setStudentToMarkPassed(null);
    }
  };

  const handleOpenUndoPassed = (student: Student) => {
    setStudentToUndoPassed(student);
    setUndoPassedDialogOpen(true);
  };

  const handleOpenExport = (student: Student) => {
    setStudentToExport(student);
    setExportDialogOpen(true);
  };

  const handleUndoPassed = async () => {
    if (!studentToUndoPassed) return;

    setIsUndoingPassed(true);
    try {
      const res = await fetch(`/api/students/${studentToUndoPassed.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ passedAt: null }),
      });

      if (res.ok) {
        loadStudents();
        setUndoPassedDialogOpen(false);
        setStudentToUndoPassed(null);
      } else {
        const data = await res.json();
        alert(data.error?.message || "Fehler beim Zurücksetzen");
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Zurücksetzen des Bestanden-Status");
    } finally {
      setIsUndoingPassed(false);
    }
  };

  const getStatusBadge = (student: Student) => {
    if (student.passedAt) {
      return (
        <Badge variant="default" className="bg-emerald-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Bestanden
        </Badge>
      );
    }
    if (!student.isActive) {
      return (
        <Badge variant="secondary">
          <XCircle className="w-3 h-3 mr-1" />
          Inaktiv
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-blue-600">
        Aktiv
      </Badge>
    );
  };

  const getTimeSpan = (
    firstLesson: string | null,
    lastLesson: string | null
  ) => {
    if (!firstLesson || !lastLesson) return "–";

    const first = new Date(firstLesson);
    const last = new Date(lastLesson);
    const diffMs = last.getTime() - first.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays === 1) return `1 Tag`;
    if (diffDays < 7) return `${diffDays} Tage`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} Wochen`;
    return `${Math.floor(diffDays / 30)} Monate`;
  };

  const renderExpandedRow = (student: Student) => {
    const isLoadingData = loadingLessons.has(student.id);
    const lessonsData = lessonsCache[student.id];
    const isExpanded = expandedRows.has(student.id);

    return (
      <TableRow className="bg-muted/10 hover:bg-muted/10">
        <TableCell colSpan={7} className="p-0 border-t-0">
          <div
            className="overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300"
            style={{ animationFillMode: "both" }}
          >
            {isLoadingData ? (
              <ExpandedRowSkeleton />
            ) : lessonsData ? (
              <div className="p-5 space-y-6 bg-gradient-to-b from-muted/30 to-transparent">
                <div
                  className="flex flex-wrap gap-x-10 gap-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: "50ms" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 bg-emerald-500/10">
                      <Car className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Fahrstunden
                      </p>
                      <p className="text-xl font-semibold tabular-nums leading-tight">
                        {lessonsData.stats.totalLessons}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 bg-amber-500/10">
                      <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Prüfungen
                      </p>
                      <p className="text-xl font-semibold tabular-nums leading-tight">
                        {lessonsData.stats.totalExams}
                      </p>
                    </div>
                  </div>
                  {lessonsData.stats.firstLesson && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2.5 bg-blue-500/10">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Zeitraum
                        </p>
                        <p className="text-sm font-medium leading-tight">
                          {format(
                            new Date(lessonsData.stats.firstLesson),
                            "dd.MM.yy"
                          )}{" "}
                          –{" "}
                          {format(
                            new Date(lessonsData.stats.lastLesson!),
                            "dd.MM.yy"
                          )}
                          <span className="ml-2 text-xs text-muted-foreground">
                            (
                            {getTimeSpan(
                              lessonsData.stats.firstLesson,
                              lessonsData.stats.lastLesson
                            )}
                            )
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                  {lessonsData.stats.byRouteType.COUNTRY > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2.5 bg-emerald-500/10">
                        <Route className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Überland
                        </p>
                        <p className="text-xl font-semibold tabular-nums leading-tight">
                          {lessonsData.stats.byRouteType.COUNTRY}
                        </p>
                      </div>
                    </div>
                  )}
                  {lessonsData.stats.byRouteType.HIGHWAY > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2.5 bg-blue-500/10">
                        <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Autobahn
                        </p>
                        <p className="text-xl font-semibold tabular-nums leading-tight">
                          {lessonsData.stats.byRouteType.HIGHWAY}
                        </p>
                      </div>
                    </div>
                  )}
                  {lessonsData.stats.byRouteType.NIGHT > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2.5 bg-purple-500/10">
                        <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Nacht
                        </p>
                        <p className="text-xl font-semibold tabular-nums leading-tight">
                          {lessonsData.stats.byRouteType.NIGHT}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {lessonsData.lessons.length > 0 && (
                  <div
                    className="space-y-3 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                    style={{ animationDelay: "300ms", animationDuration: "400ms" }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Termine
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {lessonsData.lessons.length} Einträge
                      </span>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {lessonsData.lessons.slice(0, 10).map((lesson, index) => (
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
                                {format(new Date(lesson.date), "dd.MM.yy")}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                {lesson.duration} Min.
                              </span>
                            </div>
                            <span
                              className={cn(
                                "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                                getLessonBadgeStyle(lesson.type, lesson.routeType)
                              )}
                            >
                              {lesson.type === "EXAM"
                                ? "Prüfung"
                                : lesson.routeType
                                ? ROUTE_LABELS[lesson.routeType]
                                : "Übung"}
                            </span>
                            <span className="text-sm text-foreground/70 truncate">
                              {lesson.instructor}
                            </span>
                          </div>
                          {lesson.type !== "THEORY_LESSON" && (
                            <PaymentStatus status={lesson.paymentStatus} />
                          )}
                        </div>
                      ))}
                    </div>

                    {lessonsData.lessons.length > 10 && (
                      <p className="text-xs text-center text-muted-foreground pt-1">
                        + {lessonsData.lessons.length - 10} weitere Termine
                      </p>
                    )}
                  </div>
                )}

                {lessonsData.stats.totalLessons === 0 &&
                  lessonsData.stats.totalExams === 0 && (
                    <div className="flex items-center justify-center rounded-lg border border-dashed border-border/50 py-8">
                      <p className="text-sm text-muted-foreground">
                        Noch keine Fahrstunden vorhanden
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <div className="p-5">
                <p className="text-sm text-muted-foreground">
                  Fehler beim Laden der Daten.
                </p>
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Schülerverwaltung
            </h1>
            <p className="text-sm text-muted-foreground">
              Verwalten Sie hier Ihre Fahrschüler
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Schüler
            </Button>
          )}
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Aktive Schüler
                </p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight">
                  {stats.active}
                </p>
              </div>
              <div className="rounded-lg p-2.5 bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Inaktive Schüler
                </p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-muted-foreground">
                  {stats.inactive}
                </p>
              </div>
              <div className="rounded-lg p-2.5 bg-muted">
                <UserX className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Bestanden
                </p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-emerald-600">
                  {stats.passed}
                </p>
              </div>
              <div className="rounded-lg p-2.5 bg-emerald-500/10">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Gesamt
                </p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight">
                  {stats.all}
                </p>
              </div>
              <div className="rounded-lg p-2.5 bg-blue-500/10">
                <UsersRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Schüler suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as FilterStatus)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktive</SelectItem>
              <SelectItem value="inactive">Inaktive</SelectItem>
              <SelectItem value="passed">Bestanden</SelectItem>
              <SelectItem value="all">Alle</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedInstructorId}
            onValueChange={setSelectedInstructorId}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Fahrlehrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Schüler</SelectItem>
              {isAdmin ? (
                instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.firstName} {instructor.lastName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={user?.id || ""}>Meine Schüler</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border/60 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 bg-card">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-card">
              <div className="flex flex-col items-center justify-center">
                <div className="p-3 rounded-full bg-muted/50 mb-4">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {searchQuery
                    ? "Keine Schüler gefunden"
                    : "Noch keine Schüler vorhanden"}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {searchQuery
                    ? "Versuche einen anderen Suchbegriff"
                    : "Füge einen neuen Schüler hinzu"}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-10 font-semibold">
                    <span className="sr-only">Erweitern</span>
                  </TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold">
                    Geburtsdatum
                  </TableHead>
                  <TableHead className="hidden sm:table-cell font-semibold">
                    Angemeldet
                  </TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold">
                    Prüfungsstelle
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">
                    Aktionen
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => {
                  const isExpanded = expandedRows.has(student.id);

                  return (
                    <Fragment key={student.id}>
                      <TableRow
                        className={cn(
                          "transition-colors cursor-pointer",
                          index % 2 === 0 && !isExpanded && "bg-muted/5",
                          isExpanded && "bg-muted/20 border-b-0",
                          "hover:bg-muted/20"
                        )}
                        onClick={() => toggleRow(student.id)}
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
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {student.birthDate
                            ? format(new Date(student.birthDate), "dd.MM.yyyy")
                            : "–"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {format(new Date(student.registeredAt), "dd.MM.yyyy")}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {student.examAuthority === "TUV" ? "TÜV" :
                           student.examAuthority === "DEKRA" ? "DEKRA" : "–"}
                        </TableCell>
                        <TableCell>{getStatusBadge(student)}</TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(student)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenExport(student)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Exportieren
                              </DropdownMenuItem>

                              {!student.passedAt && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleToggleActive(student)}
                                  >
                                    {student.isActive ? (
                                      <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Deaktivieren
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reaktivieren
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleOpenMarkPassed(student)}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Als bestanden markieren
                                  </DropdownMenuItem>
                                </>
                              )}

                              {student.passedAt && (
                                <DropdownMenuItem
                                  onClick={() => handleOpenUndoPassed(student)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Bestanden-Status zurücksetzen
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleOpenDelete(student)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Archivieren
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {isExpanded && renderExpandedRow(student)}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Schüler werden automatisch als inaktiv markiert, wenn sie 6 Monate
          keine Fahrstunde hatten. Klicken Sie auf eine Zeile für die
          Fahrstunden-Übersicht.
        </p>

        <StudentModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          student={selectedStudent}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Schüler archivieren?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <span>
                    <strong>
                      {studentToDelete?.firstName} {studentToDelete?.lastName}
                    </strong>{" "}
                    wird archiviert. Vergangene Termine bleiben für Statistiken
                    erhalten.
                  </span>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            {isLoadingFutureCount ? (
              <div className="flex items-center gap-2 py-4">
                <Spinner className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  Lade Termininformationen...
                </span>
              </div>
            ) : futureAppointmentsCount > 0 ? (
              <div className="flex items-start space-x-3 py-4 px-1">
                <Checkbox
                  id="deleteFuture"
                  checked={deleteFutureAppointments}
                  onCheckedChange={(checked) =>
                    setDeleteFutureAppointments(checked === true)
                  }
                />
                <label
                  htmlFor="deleteFuture"
                  className="text-sm leading-tight cursor-pointer"
                >
                  <span className="font-medium">
                    Zukünftige Termine löschen ({futureAppointmentsCount})
                  </span>
                  <span className="block text-muted-foreground mt-0.5">
                    Offene Termine in der Zukunft werden entfernt
                  </span>
                </label>
              </div>
            ) : null}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isDeleting ? <Spinner className="h-4 w-4" /> : "Archivieren"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={undoPassedDialogOpen}
          onOpenChange={setUndoPassedDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bestanden-Status zurücksetzen?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie den Bestanden-Status von{" "}
                <strong>
                  {studentToUndoPassed?.firstName} {studentToUndoPassed?.lastName}
                </strong>{" "}
                wirklich zurücksetzen?
                {studentToUndoPassed?.passedAt && (
                  <span className="block mt-2 text-xs">
                    Bestanden seit:{" "}
                    {format(new Date(studentToUndoPassed.passedAt), "dd.MM.yyyy", {
                      locale: de,
                    })}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUndoingPassed}>
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUndoPassed}
                disabled={isUndoingPassed}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isUndoingPassed ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  "Zurücksetzen"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={markPassedDialogOpen} onOpenChange={setMarkPassedDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Schüler als bestanden markieren?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie{" "}
                <strong>
                  {studentToMarkPassed?.firstName} {studentToMarkPassed?.lastName}
                </strong>{" "}
                wirklich als bestanden markieren?
                <span className="block mt-2 text-xs">
                  Das heutige Datum wird als Bestanden-Datum gesetzt.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleMarkPassed}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Als bestanden markieren
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {studentToExport && (
          <StudentExportDialog
            open={exportDialogOpen}
            onClose={() => {
              setExportDialogOpen(false);
              setStudentToExport(null);
            }}
            student={studentToExport}
          />
        )}
      </div>
    </div>
  );
}

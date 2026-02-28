"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { FileSpreadsheet, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  examAuthority: "TUV" | "DEKRA" | null;
  isActive: boolean;
  registeredAt: string;
  passedAt: string | null;
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
}

interface Lesson {
  id: string;
  date: string;
  type: string;
  routeType: string | null;
  instructor: string;
  notes: string | null;
  paymentStatus: "OPEN" | "PAID";
  duration: number;
}

interface LessonsData {
  stats: LessonStats;
  lessons: Lesson[];
}

interface StudentExportDialogProps {
  open: boolean;
  onClose: () => void;
  student: Student;
}

const ROUTE_LABELS: Record<string, string> = {
  COUNTRY: "Überland",
  HIGHWAY: "Autobahn",
  NIGHT: "Nacht",
};

const PAYMENT_LABELS: Record<string, string> = {
  OPEN: "Offen",
  PAID: "Bezahlt",
};

export function StudentExportDialog({
  open,
  onClose,
  student,
}: StudentExportDialogProps) {
  const [lessonsData, setLessonsData] = useState<LessonsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && student) {
      loadLessons();
    }
  }, [open, student]);

  const loadLessons = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/students/${student.id}/lessons`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setLessonsData(data);
      } else {
        setError("Fehler beim Laden der Fahrstunden");
      }
    } catch (err) {
      console.error("Fehler beim Laden der Fahrstunden:", err);
      setError("Fehler beim Laden der Fahrstunden");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!lessonsData) return;

    const today = format(new Date(), "dd.MM.yyyy", { locale: de });
    const fileName = `Schueler_${student.lastName}_${student.firstName}_${format(new Date(), "dd-MM-yyyy")}.csv`;

    // Build CSV content
    const lines: string[] = [];

    // Header
    lines.push(`Schülerdaten Export - ${student.firstName} ${student.lastName}`);
    lines.push(`Erstellt am: ${today}`);
    lines.push("");

    // Student information section
    lines.push("--- SCHÜLER-INFORMATIONEN ---");
    lines.push("Vorname;Nachname;Geburtsdatum;Prüfungsstelle;Status;Anmeldedatum;Bestanden am");

    const birthDateStr = student.birthDate
      ? format(new Date(student.birthDate), "dd.MM.yyyy")
      : "-";
    const examAuthority = student.examAuthority === "TUV"
      ? "TÜV"
      : student.examAuthority === "DEKRA"
        ? "DEKRA"
        : "-";
    const status = student.passedAt
      ? "Bestanden"
      : student.isActive
        ? "Aktiv"
        : "Inaktiv";
    const registeredAtStr = format(new Date(student.registeredAt), "dd.MM.yyyy");
    const passedAtStr = student.passedAt
      ? format(new Date(student.passedAt), "dd.MM.yyyy")
      : "-";

    lines.push(
      `${student.firstName};${student.lastName};${birthDateStr};${examAuthority};${status};${registeredAtStr};${passedAtStr}`
    );
    lines.push("");

    // Statistics section
    lines.push("--- STATISTIKEN ---");
    lines.push("Fahrstunden gesamt;Prüfungen;Überlandfahrten;Autobahnfahrten;Nachtfahrten");
    lines.push(
      `${lessonsData.stats.totalLessons};${lessonsData.stats.totalExams};${lessonsData.stats.byRouteType.COUNTRY};${lessonsData.stats.byRouteType.HIGHWAY};${lessonsData.stats.byRouteType.NIGHT}`
    );
    lines.push("");

    // Appointments section
    lines.push("--- TERMINE ---");
    lines.push("Datum;Dauer (Min.);Typ;Art;Fahrlehrer;Zahlungsstatus;Notizen");

    lessonsData.lessons.forEach((lesson) => {
      const date = format(new Date(lesson.date), "dd.MM.yyyy");
      const type = lesson.type === "EXAM" ? "Prüfung" : "Fahrstunde";
      const routeType = lesson.routeType
        ? ROUTE_LABELS[lesson.routeType] || lesson.routeType
        : "Übung";
      const paymentStatus = PAYMENT_LABELS[lesson.paymentStatus] || lesson.paymentStatus;
      const notes = lesson.notes ? lesson.notes.replace(/;/g, ",").replace(/\n/g, " ") : "-";

      lines.push(
        `${date};${lesson.duration};${type};${routeType};${lesson.instructor};${paymentStatus};${notes}`
      );
    });

    // Create CSV with BOM for UTF-8 encoding
    const csvContent = lines.join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // Download file
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onClose();
  };

  const handleExportPDF = () => {
    window.print();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schülerdaten exportieren</DialogTitle>
          <DialogDescription>
            Export für {student.firstName} {student.lastName}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
            <span className="ml-3 text-sm text-muted-foreground">
              Lade Fahrstunden...
            </span>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadLessons}>
              Erneut versuchen
            </Button>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={handleExportCSV}
            >
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              <div className="flex flex-col items-start">
                <span className="font-medium">CSV Export</span>
                <span className="text-xs text-muted-foreground">
                  Für Excel & Co.
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={handleExportPDF}
            >
              <Printer className="h-5 w-5 text-blue-600" />
              <div className="flex flex-col items-start">
                <span className="font-medium">PDF / Drucken</span>
                <span className="text-xs text-muted-foreground">
                  Als PDF speichern
                </span>
              </div>
            </Button>

            {lessonsData && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                {lessonsData.stats.totalLessons} Fahrstunden, {lessonsData.stats.totalExams} Prüfungen
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

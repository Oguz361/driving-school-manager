"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const studentSchema = z.object({
  firstName: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben"),
  lastName: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben"),
  birthDate: z.date().optional().nullable(),
  examAuthority: z.enum(["TUV", "DEKRA"]).optional().nullable(),
});

type StudentFormData = z.infer<typeof studentSchema>;

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
}

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: Student | null;
}

export default function StudentModal({
  open,
  onClose,
  onSuccess,
  student,
}: StudentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const isEditing = !!student;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const birthDate = watch("birthDate");
  const examAuthority = watch("examAuthority");

  useEffect(() => {
    if (open) {
      setError(null);
      setIsCalendarOpen(false);
      if (student) {
        const parsedBirthDate = student.birthDate ? new Date(student.birthDate) : null;
        reset({
          firstName: student.firstName,
          lastName: student.lastName,
          birthDate: parsedBirthDate,
          examAuthority: student.examAuthority,
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          birthDate: null,
          examAuthority: null,
        });
      }
    }
  }, [open, student, reset]);

  const handleDateSelect = (date: Date | undefined) => {
    setValue("birthDate", date ?? null);
    if (date) {
      setIsCalendarOpen(false);
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        birthDate: data.birthDate ? data.birthDate.toISOString() : null,
        examAuthority: data.examAuthority || null,
      };

      const url = isEditing ? `/api/students/${student.id}` : "/api/students";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || "Fehler beim Speichern");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Schüler bearbeiten" : "Neuen Schüler anlegen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Bearbeiten Sie die Daten des Fahrschülers."
              : "Legen Sie einen neuen Fahrschüler an."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Max"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Mustermann"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Geburtsdatum (optional)</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {birthDate
                      ? format(birthDate, "PPP", { locale: de })
                      : "Geburtsdatum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate ?? undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1940}
                    toYear={new Date().getFullYear() - 14}
                  />
                </PopoverContent>
              </Popover>
              {errors.birthDate && (
                <p className="text-sm text-red-600">{errors.birthDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Prüfungsstelle (optional)</Label>
              <Select
                value={examAuthority ?? undefined}
                onValueChange={(value) => setValue("examAuthority", value as "TUV" | "DEKRA")}
                disabled={isLoading}
              >
                <SelectTrigger className={cn(!examAuthority && "text-muted-foreground")}>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TUV">TÜV</SelectItem>
                  <SelectItem value="DEKRA">DEKRA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEditing && student && (
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p>
                Angemeldet:{" "}
                {format(new Date(student.registeredAt), "dd.MM.yyyy")}
              </p>
              <p>
                Letzte Aktivität:{" "}
                {format(new Date(student.lastActivity), "dd.MM.yyyy")}
              </p>
              {student.passedAt && (
                <p className="text-green-600">
                  Bestanden: {format(new Date(student.passedAt), "dd.MM.yyyy")}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : isEditing ? (
                "Speichern"
              ) : (
                "Anlegen"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
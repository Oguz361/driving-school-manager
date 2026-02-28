"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, set } from "date-fns";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  User,
  Car,
  CreditCard,
  AlignLeft,
  Edit2,
  Search,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

type MainEntryType =
  | "PRACTICAL_LESSON"
  | "SPECIAL_TRIP"
  | "THEORY_LESSON"
  | "EXAM"
  | "UNAVAILABILITY";

const appointmentSchema = z.object({
  mainType: z.enum(["PRACTICAL_LESSON", "SPECIAL_TRIP", "THEORY_LESSON", "EXAM"]),
  startTime: z.string().min(1, "Startzeit ist erforderlich"),
  endTime: z.string().min(1, "Endzeit ist erforderlich"),
  // ÄNDERUNG: studentId statt Name, optional weil Theorieunterricht keine ID braucht
  studentId: z.string().uuid("Bitte wählen Sie einen Schüler aus").nullish(),
  instructorId: z.string().uuid("Fahrlehrer ist erforderlich"),
  vehicleId: z.string().optional().nullable(),
  routeType: z.enum(["COUNTRY", "HIGHWAY", "NIGHT"]).optional().nullable(),
  paymentStatus: z.enum(["OPEN", "PAID"]),
  notes: z.string().optional().nullable(),
}).refine((data) => {
  // Validierung: Praktische Stunden BRAUCHEN einen Schüler
  if ((data.mainType === "PRACTICAL_LESSON" || data.mainType === "SPECIAL_TRIP" || data.mainType === "EXAM") && !data.studentId) {
    return false;
  }
  return true;
}, {
  message: "Für praktische Stunden/Prüfungen muss ein Schüler ausgewählt werden",
  path: ["studentId"],
});

const unavailabilitySchema = z.object({
  mainType: z.literal("UNAVAILABILITY"),
  unavailabilityType: z.literal("BLOCKED"),
  startTime: z.string().min(1, "Startzeit ist erforderlich"),
  endTime: z.string().min(1, "Endzeit ist erforderlich"),
  instructorId: z.string().uuid("Fahrlehrer ist erforderlich"),
  reason: z.string().optional(),
});

const entrySchema = z.discriminatedUnion("mainType", [
  appointmentSchema,
  unavailabilitySchema,
]);

type EntryFormData = z.infer<typeof entrySchema>;

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

const TYPE_LABELS: Record<string, string> = {
  PRACTICAL_LESSON: "Übungsfahrt",
  THEORY_LESSON: "Theorieunterricht",
  EXAM: "Prüfung",
  BLOCKED: "Abwesend",
};

const PAYMENT_LABELS: Record<string, string> = {
  OPEN: "Offen",
  PAID: "Bezahlt",
};

const ROUTE_LABELS: Record<string, string> = {
  COUNTRY: "Überland",
  HIGHWAY: "Autobahn",
  NIGHT: "Nachtfahrt",
};

interface EntryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entry?: any;
  entryType?: "appointment" | "unavailability";
  defaultDate?: Date;
  defaultInstructorId?: string;
  instructors: Array<{
    id: string;
    firstName: string;
    lastName: string;
    assignedVehicleId?: string | null;
    assignedVehicle?: {
      id: string;
      name: string;
      licensePlate: string;
      transmission: string;
      isActive: boolean;
    } | null;
  }>;
  vehicles: Array<{
    id: string;
    name: string;
    licensePlate: string;
    transmission: string;
  }>;
}

export default function EntryModal({
  open,
  onClose,
  onSuccess,
  entry,
  entryType,
  defaultDate,
  defaultInstructorId,
  instructors,
  vehicles,
}: EntryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [selectedMainType, setSelectedMainType] = useState<MainEntryType | "">("");
  const [isEditing, setIsEditing] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [foundStudents, setFoundStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [showStudentResults, setShowStudentResults] = useState(false);

  const isEntryExisting = !!entry;
  const showForm = isEditing || !entry;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
  });

  useEffect(() => {
    if (open) {
      setIsLoading(false);
      setConflicts([]);
      setShowConflicts(false);
      setFormError(null);
      setStudentSearch("");
      setFoundStudents([]);
      setSelectedStudent(null);
      setShowStudentResults(false);

      if (entry) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }

      if (entry && entryType) {
        if (entryType === "appointment") {
          // Mapping: DB-Typ + routeType -> UI-Typ
          let uiType: MainEntryType = entry.type as MainEntryType;
          if (entry.type === "PRACTICAL_LESSON" && entry.routeType && ["COUNTRY", "HIGHWAY", "NIGHT"].includes(entry.routeType)) {
            uiType = "SPECIAL_TRIP";
          }
          setSelectedMainType(uiType);
          
          if (entry.student) {
            setSelectedStudent(entry.student);
            setStudentSearch(`${entry.student.firstName} ${entry.student.lastName}`);
          }

          reset({
            mainType: uiType, // UI-Typ verwenden (SPECIAL_TRIP wenn Sonderfahrt)
            startTime: entry.startTime,
            endTime: entry.endTime,
            studentId: entry.studentId || entry.student?.id || null, // Wichtig für Validierung
            instructorId: entry.instructorId,
            vehicleId: entry.vehicleId || null,
            routeType: entry.routeType || null,
            paymentStatus: entry.paymentStatus || "OPEN",
            notes: entry.notes || "",
          } as any);
        } else {
          setSelectedMainType("UNAVAILABILITY");
          reset({
            mainType: "UNAVAILABILITY",
            unavailabilityType: entry.type,
            startTime: entry.startTime,
            endTime: entry.endTime,
            instructorId: entry.instructorId,
            reason: entry.reason || "",
          } as any);
        }
      } else {
        setSelectedMainType("");
        const now = defaultDate || new Date();
        const endTime = new Date(now.getTime() + 90 * 60000);

        const instructorIdToUse = defaultInstructorId || instructors[0]?.id || "";
        let vehicleIdToUse = null;

        if (instructorIdToUse) {
          const instructor = instructors.find((i) => i.id === instructorIdToUse);
          if (instructor?.assignedVehicleId && instructor?.assignedVehicle?.isActive) {
            vehicleIdToUse = instructor.assignedVehicleId;
          }
        }

        reset({
          mainType: undefined as any,
          startTime: now.toISOString(),
          endTime: endTime.toISOString(),
          instructorId: instructorIdToUse,
          vehicleId: vehicleIdToUse,
          paymentStatus: "OPEN",
        } as any);
      }
    }
  }, [open, entry, entryType, defaultDate, defaultInstructorId, instructors, reset]);

  useEffect(() => {
    if (!studentSearch || selectedStudent) {
        setFoundStudents([]);
        return;
    }

    const timer = setTimeout(async () => {
        if (studentSearch.length < 1) return;

        setIsSearchingStudents(true);
        try {
            const res = await fetch(`/api/students?query=${encodeURIComponent(studentSearch)}`);
            if (res.ok) {
                const data = await res.json();
                setFoundStudents(data);
                setShowStudentResults(true);
            }
        } catch (error) {
            console.error("Fehler bei Schülersuche:", error);
        } finally {
            setIsSearchingStudents(false);
        }
    }, 150);

    return () => clearTimeout(timer);
  }, [studentSearch, selectedStudent]);

  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const instructorId = watch("instructorId");
  const vehicleId = watch("vehicleId" as any);

  useEffect(() => {
    if (!entry && instructorId && selectedMainType && selectedMainType !== "THEORY_LESSON" && selectedMainType !== "UNAVAILABILITY") {
      const instructor = instructors.find((i) => i.id === instructorId);
      if (instructor?.assignedVehicleId && instructor?.assignedVehicle?.isActive) {
        setValue("vehicleId" as any, instructor.assignedVehicleId);
      }
    }
  }, [instructorId, entry, selectedMainType, instructors, setValue]);

  const safeStartDate = startTime && !isNaN(new Date(startTime).getTime()) ? new Date(startTime) : new Date();
  const safeEndDate = endTime && !isNaN(new Date(endTime).getTime()) ? new Date(endTime) : new Date();
  const startTimeStr = format(safeStartDate, "HH:mm");
  const endTimeStr = format(safeEndDate, "HH:mm");

  const requiresVehicle = selectedMainType === "PRACTICAL_LESSON" || selectedMainType === "SPECIAL_TRIP" || selectedMainType === "EXAM";
  const isSpecialTrip = selectedMainType === "SPECIAL_TRIP";
  const isUnavailability = selectedMainType === "UNAVAILABILITY";

  const handleMainTypeChange = (value: MainEntryType) => {
    setSelectedMainType(value);
    setValue("mainType", value as any);
    
    if (value === "SPECIAL_TRIP") {
      setValue("routeType" as any, "COUNTRY"); // Default: Überland
    } else {
      setValue("routeType" as any, null);
    }
    
    if (value === "UNAVAILABILITY") {
      setValue("unavailabilityType" as any, "BLOCKED");
    } else {
      setValue("paymentStatus" as any, "OPEN");
    }
  };

  const handleStartDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    const currentStart = new Date(startTime);
    const newStart = set(newDate, { hours: currentStart.getHours(), minutes: currentStart.getMinutes() });
    setValue("startTime", newStart.toISOString());
    if (!isUnavailability) {
      const currentEnd = new Date(endTime);
      const newEnd = set(newDate, { hours: currentEnd.getHours(), minutes: currentEnd.getMinutes() });
      setValue("endTime", newEnd.toISOString());
    }
    setIsStartCalendarOpen(false);
  };

  const handleEndDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    const currentEnd = new Date(endTime);
    const newEnd = set(newDate, { hours: currentEnd.getHours(), minutes: currentEnd.getMinutes() });
    setValue("endTime", newEnd.toISOString());
    setIsEndCalendarOpen(false);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (!newTime) return;
    const [hours, minutes] = newTime.split(":").map(Number);
    const newStart = set(new Date(startTime), { hours, minutes });
    setValue("startTime", newStart.toISOString());
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (!newTime) return;
    const [hours, minutes] = newTime.split(":").map(Number);
    const newEnd = set(new Date(endTime), { hours, minutes });
    setValue("endTime", newEnd.toISOString());
  };

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentSearch(`${student.firstName} ${student.lastName}`);
    setValue("studentId", student.id);
    setShowStudentResults(false);
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setValue("studentId", null);
  };

  useEffect(() => {
    if (!showForm || !startTime || !endTime || !instructorId || isUnavailability) return;

    const checkConflicts = async () => {
      try {
        const response = await fetch("/api/appointments/check-conflicts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            instructorId,
            vehicleId: vehicleId || null,
            excludeAppointmentId: entry?.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setConflicts(data.conflicts || []);
          setShowConflicts(data.hasConflicts);
        }
      } catch (error) {
        console.error("Konfliktprüfung fehlgeschlagen:", error);
      }
    };

    const debounce = setTimeout(checkConflicts, 500);
    return () => clearTimeout(debounce);
  }, [startTime, endTime, instructorId, vehicleId, entry?.id, isUnavailability, showForm]);

  const onSubmit = async (data: EntryFormData) => {
    setIsLoading(true);
    setFormError(null);
    try {
      if (data.mainType === "UNAVAILABILITY") {
        const payload = {
            type: (data as any).unavailabilityType,
            startTime: new Date(data.startTime).toISOString(),
            endTime: new Date(data.endTime).toISOString(),
            instructorId: data.instructorId,
            reason: (data as any).reason || null,
        };
        const url = isEntryExisting && entryType === "unavailability" ? `/api/unavailabilities/${entry.id}` : "/api/unavailabilities";
        const method = isEntryExisting && entryType === "unavailability" ? "PUT" : "POST";
        const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
        const result = await response.json();
        if (!response.ok) {
          setFormError(result.error?.message || "Fehler beim Speichern der Abwesenheit");
          setIsLoading(false);
          return;
        }

      } else {
        // SPECIAL_TRIP ist nur ein UI-Typ, ans Backend geht PRACTICAL_LESSON
        const dbType = data.mainType === "SPECIAL_TRIP" ? "PRACTICAL_LESSON" : data.mainType;

        const payload = {
          type: dbType,
          startTime: new Date(data.startTime).toISOString(),
          endTime: new Date(data.endTime).toISOString(),
          // WICHTIG: studentId senden!
          studentId: (data as any).studentId,
          instructorId: data.instructorId,
          vehicleId: (data as any).vehicleId || null,
          routeType: (data as any).routeType || null,
          paymentStatus: (data as any).paymentStatus,
          notes: (data as any).notes || null,
        };

        const url = isEntryExisting && entryType === "appointment" ? `/api/appointments/${entry.id}` : "/api/appointments";
        const method = isEntryExisting && entryType === "appointment" ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
          if (response.status === 409 && result.conflicts) {
            setConflicts(result.conflicts);
            setShowConflicts(true);
            setIsLoading(false);
            return;
          }
          setFormError(result.error?.message || "Fehler beim Speichern des Termins");
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Fehler:", error);
      setFormError(error.message || "Ein unerwarteter Fehler ist aufgetreten");
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
      if (!entry) return;
      setIsLoading(true);
      setFormError(null);
      try {
        const url = entryType === "appointment" ? `/api/appointments/${entry.id}` : `/api/unavailabilities/${entry.id}`;
        const response = await fetch(url, { method: "DELETE", credentials: "include" });
        if (!response.ok) {
          const result = await response.json();
          setFormError(result.error?.message || "Fehler beim Löschen");
          setIsLoading(false);
          return;
        }
        onSuccess();
        onClose();
      } catch (error: any) {
        setFormError(error.message || "Fehler beim Löschen");
        setIsLoading(false);
      }
  };

  const ViewRow = ({ icon: Icon, label, value, className }: any) => {
    if (!value) return null;
    return (
      <div className={cn("flex items-start gap-3 p-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors", className)}>
        <Icon className="w-5 h-5 text-neutral-500 mt-0.5 shrink-0" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</span>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{value}</span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{showForm ? (isEntryExisting ? "Eintrag bearbeiten" : "Neuer Eintrag") : "Details"}</DialogTitle>
          <DialogDescription>{showForm ? "Füllen Sie die Details aus" : "Informationen zum ausgewählten Eintrag"}</DialogDescription>
        </DialogHeader>

        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="mainType">Art des Eintrags</Label>
              <Select value={selectedMainType} onValueChange={(value) => handleMainTypeChange(value as MainEntryType)} disabled={isEntryExisting || !!selectedMainType}>
                <SelectTrigger className="disabled:cursor-default disabled:opacity-50"><SelectValue placeholder="Bitte wählen..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRACTICAL_LESSON">Übungsfahrt</SelectItem>
                  <SelectItem value="SPECIAL_TRIP">Sonderfahrt</SelectItem>
                  <SelectItem value="THEORY_LESSON">Theorieunterricht</SelectItem>
                  <SelectItem value="EXAM">Prüfung</SelectItem>
                  <SelectItem value="UNAVAILABILITY">Abwesenheit</SelectItem>
                </SelectContent>
              </Select>
              {errors.mainType && <p className="text-sm text-red-600">Bitte wählen Sie einen Typ</p>}
            </div>

            {selectedMainType && (
              <div className="overflow-hidden transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2 space-y-4">
                {isUnavailability ? (
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs">Startdatum</Label>
                            <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                        {format(safeStartDate, "PPP", { locale: de })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={safeStartDate}
                                        onSelect={handleStartDateSelect}
                                        initialFocus
                                        captionLayout="dropdown"
                                        fromYear={new Date().getFullYear() - 1}
                                        toYear={new Date().getFullYear() + 2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label className="text-xs">Enddatum</Label>
                            <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                        {format(safeEndDate, "PPP", { locale: de })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={safeEndDate}
                                        onSelect={handleEndDateSelect}
                                        initialFocus
                                        captionLayout="dropdown"
                                        fromYear={new Date().getFullYear() - 1}
                                        toYear={new Date().getFullYear() + 2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                ) : (
                  <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md border">
                    <div className="flex flex-col gap-1.5">
                      <Label>Datum</Label>
                      <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
                        <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal")}><CalendarIcon className="mr-2 h-4 w-4 opacity-50" />{format(safeStartDate, "PPP", { locale: de })}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={safeStartDate} onSelect={handleStartDateSelect} initialFocus /></PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1"><Label>Von</Label><Input type="time" value={startTimeStr} onChange={handleStartTimeChange} /></div>
                      <div className="flex-1"><Label>Bis</Label><Input type="time" value={endTimeStr} onChange={handleEndTimeChange} /></div>
                    </div>
                  </div>
                )}

                {isSpecialTrip && (
                  <div className="space-y-2">
                    <Label htmlFor="routeType">Art der Sonderfahrt</Label>
                    <Select value={watch("routeType" as any) || "COUNTRY"} onValueChange={(value) => setValue("routeType" as any, value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COUNTRY">Überlandfahrt</SelectItem>
                        <SelectItem value="HIGHWAY">Autobahnfahrt</SelectItem>
                        <SelectItem value="NIGHT">Nachtfahrt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!isUnavailability && selectedMainType !== "THEORY_LESSON" && (
                  <div className="space-y-2 relative">
                    <Label htmlFor="studentSearch">Fahrschüler</Label>
                    <div className="relative">
                        <div className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500"><Search className="h-4 w-4" /></div>
                        <Input
                            id="studentSearch"
                            placeholder="Schüler suchen..."
                            value={studentSearch}
                            onChange={(e) => {
                                setStudentSearch(e.target.value);
                                if (!e.target.value) {
                                    setSelectedStudent(null);
                                    setValue("studentId", null);
                                    setShowStudentResults(false);
                                }
                            }}
                            className="pl-9 pr-9"
                            onFocus={() => { if(foundStudents.length > 0) setShowStudentResults(true); }}
                        />
                        {studentSearch && (
                            <button type="button" onClick={clearStudent} className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    
                    {showStudentResults && foundStudents.length > 0 && (
                        <div className="absolute z-10 w-full bg-white dark:bg-neutral-950 border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                            {foundStudents.map(student => (
                                <div 
                                    key={student.id} 
                                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer flex justify-between items-center text-sm"
                                    onClick={() => selectStudent(student)}
                                >
                                    <div>
                                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                                    </div>
                                    {selectedStudent?.id === student.id && <Check className="h-4 w-4 text-green-600" />}
                                </div>
                            ))}
                        </div>
                    )}
                    {isSearchingStudents && <div className="absolute right-3 top-9"><Spinner className="h-4 w-4" /></div>}
                    
                    {(errors as any).studentId && (
                        <p className="text-sm text-red-600">{(errors as any).studentId?.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="instructorId">Fahrlehrer</Label>
                  <Select value={watch("instructorId")} onValueChange={(value) => setValue("instructorId", value)}>
                    <SelectTrigger><SelectValue placeholder="Fahrlehrer wählen" /></SelectTrigger>
                    <SelectContent>
                      {instructors.map((i) => (<SelectItem key={i.id} value={i.id}>{i.firstName} {i.lastName}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                {!isUnavailability && selectedMainType !== "THEORY_LESSON" && (
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Zahlungsstatus</Label>
                    <Select value={watch("paymentStatus" as any)} onValueChange={(value) => setValue("paymentStatus" as any, value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="OPEN">Offen</SelectItem><SelectItem value="PAID">Bezahlt</SelectItem></SelectContent>
                    </Select>
                  </div>
                )}

                {requiresVehicle && (() => {
                  const currentInstructor = instructors.find(i => i.id === instructorId);
                  const assignedVehicleId = currentInstructor?.assignedVehicleId;
                  const filteredVehicles = vehicles.filter(v =>
                    v.transmission === "MANUAL" || v.id === assignedVehicleId
                  );
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="vehicleId">Fahrzeug</Label>
                      <Select value={watch("vehicleId" as any) || "none"} onValueChange={(value) => setValue("vehicleId" as any, value === "none" ? null : value)}>
                        <SelectTrigger><SelectValue placeholder="Fahrzeug wählen" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Kein Fahrzeug</SelectItem>
                          {filteredVehicles.map((v) => (<SelectItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })()}

                {!isUnavailability && (
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notizen</Label>
                    <Input id="notes" {...register("notes" as any)} />
                  </div>
                )}

                {showConflicts && conflicts.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">Konflikte:</div>
                      <ul className="list-disc pl-4 text-xs">{conflicts.map((c, i) => (<li key={i}>{c.message}</li>))}</ul>
                    </AlertDescription>
                  </Alert>
                )}

                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">{formError}</div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <DialogFooter className={cn("flex flex-row items-center w-full pt-4 gap-2", isEntryExisting ? "justify-between sm:justify-between" : "justify-end sm:justify-end")}>
              {isEntryExisting && (
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button type="button" variant="destructive" disabled={isLoading} className="shrink-0">Löschen</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle><AlertDialogDescription>Der Eintrag wird dauerhaft gelöscht.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Abbrechen</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Löschen</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={isEntryExisting ? () => setIsEditing(false) : onClose}>Abbrechen</Button>
                <Button type="submit" disabled={isLoading || !selectedMainType || (showConflicts && conflicts.length > 0)}>{isLoading ? <Spinner /> : "Speichern"}</Button>
              </div>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-1">
             <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-1 border mb-4">
              <ViewRow icon={CalendarIcon} label="Zeitraum" value={`${format(safeStartDate, "dd.MM.yyyy")} | ${format(safeStartDate, "HH:mm")} - ${format(safeEndDate, "HH:mm")}`} />
              <ViewRow icon={AlignLeft} label="Art" value={
                isUnavailability 
                  ? TYPE_LABELS[entry.type] 
                  : entry.type === "PRACTICAL_LESSON" && entry.routeType && ["COUNTRY", "HIGHWAY", "NIGHT"].includes(entry.routeType)
                    ? `Sonderfahrt (${ROUTE_LABELS[entry.routeType]})`
                    : TYPE_LABELS[entry.type] || entry.type
              } />
            </div>
            {!isUnavailability && (
              <>
                {entry.student && (
                  <ViewRow icon={User} label="Fahrschüler" value={`${entry.student.firstName} ${entry.student.lastName}`} />
                )}
                
                {entry.instructor && <ViewRow icon={User} label="Fahrlehrer" value={`${entry.instructor.firstName} ${entry.instructor.lastName}`} />}
                {entry.vehicle && <ViewRow icon={Car} label="Fahrzeug" value={`${entry.vehicle.name} (${entry.vehicle.licensePlate})`} />}
                {entry.type !== "THEORY_LESSON" && entry.paymentStatus && (
                  <div className={cn("flex items-start gap-3 p-2 rounded-md")}>
                    <CreditCard className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Status</span>
                      <span className={cn("text-sm font-bold", entry.paymentStatus === "PAID" ? "text-green-600" : "text-orange-600")}>{PAYMENT_LABELS[entry.paymentStatus]}</span>
                    </div>
                  </div>
                )}
                {entry.notes && <ViewRow icon={AlignLeft} label="Notiz" value={entry.notes} />}
              </>
            )}
            {isUnavailability && entry.reason && <ViewRow icon={AlignLeft} label="Grund" value={entry.reason} />}
            <DialogFooter className="flex flex-row justify-end items-center pt-6 mt-4 border-t gap-2">
              <Button variant="outline" onClick={onClose}>Schließen</Button>
              <Button onClick={() => setIsEditing(true)}><Edit2 className="w-4 h-4 mr-2" />Bearbeiten</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
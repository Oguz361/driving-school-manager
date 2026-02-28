"use client";

import { format, isToday, isTomorrow } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarClock, User, Car, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  studentName?: string;
  vehicle?: {
    name: string;
    licensePlate: string;
  };
}

interface MyNextAppointmentsWidgetProps {
  appointments: Appointment[];
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PRACTICAL_LESSON: "Fahrstunde",
    THEORY_LESSON: "Theorie",
    EXAM: "Prüfung",
    HIGHWAY: "Autobahn",
    NIGHT_DRIVE: "Nachtfahrt",
    COUNTRY_ROAD: "Überland",
  };
  return labels[type] || type;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    PRACTICAL_LESSON: "bg-emerald-500",
    THEORY_LESSON: "bg-sky-500",
    EXAM: "bg-rose-500",
    HIGHWAY: "bg-violet-500",
    NIGHT_DRIVE: "bg-indigo-500",
    COUNTRY_ROAD: "bg-purple-500",
  };
  return colors[type] || "bg-slate-500";
}

export default function MyNextAppointmentsWidget({
  appointments,
}: MyNextAppointmentsWidgetProps) {
  if (appointments.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-sky-50 rounded-lg">
            <CalendarClock className="h-5 w-5 text-sky-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Meine nächsten Termine</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <CalendarClock className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">Keine anstehenden Termine</p>
          <p className="text-slate-400 text-xs mt-1">Du hast gerade frei</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-50 rounded-lg">
            <CalendarClock className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Meine nächsten Termine</h2>
            <p className="text-xs text-slate-500">{appointments.length} anstehend</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[280px] overflow-y-auto">
        {appointments.map((apt) => {
          const startDate = new Date(apt.startTime);
          const endDate = new Date(apt.endTime);
          const isAppointmentToday = isToday(startDate);
          const isAppointmentTomorrow = isTomorrow(startDate);

          return (
            <div
              key={apt.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200",
                isAppointmentToday
                  ? "bg-amber-50 border-amber-200"
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100"
              )}
            >
              {/* Type and Date Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", getTypeColor(apt.type))} />
                  <span className="text-sm font-semibold text-slate-700">
                    {getTypeLabel(apt.type)}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-md",
                    isAppointmentToday
                      ? "bg-amber-100 text-amber-700"
                      : isAppointmentTomorrow
                      ? "bg-sky-100 text-sky-700"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {isAppointmentToday
                    ? "Heute"
                    : isAppointmentTomorrow
                    ? "Morgen"
                    : format(startDate, "EEE, d. MMM", { locale: de })}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-2">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                </span>
              </div>

              {/* Details */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {apt.studentName && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {apt.studentName}
                  </span>
                )}
                {apt.vehicle && (
                  <span className="flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5" />
                    {apt.vehicle.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ClipboardCheck, Clock, User, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exam {
  id: string;
  startTime: string;
  endTime: string;
  studentName?: string;
  instructor: {
    firstName: string;
    lastName: string;
  };
  vehicle?: {
    name: string;
    licensePlate: string;
  };
}

interface UpcomingExamsWidgetProps {
  exams: Exam[];
  showInstructor?: boolean;
}

export default function UpcomingExamsWidget({
  exams,
  showInstructor = true,
}: UpcomingExamsWidgetProps) {
  if (exams.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-rose-50 rounded-lg">
            <ClipboardCheck className="h-5 w-5 text-rose-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Anstehende Prüfungen</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <ClipboardCheck className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">Keine anstehenden Prüfungen</p>
          <p className="text-slate-400 text-xs mt-1">In den nächsten 30 Tagen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-lg">
            <ClipboardCheck className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Anstehende Prüfungen</h2>
            <p className="text-xs text-slate-500">{exams.length} in den nächsten Tagen</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[280px] overflow-y-auto">
        {exams.map((exam) => {
          const startDate = new Date(exam.startTime);
          const endDate = new Date(exam.endTime);
          const isToday =
            format(startDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          const isTomorrow =
            format(startDate, "yyyy-MM-dd") ===
            format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

          return (
            <div
              key={exam.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200",
                isToday
                  ? "bg-rose-50 border-rose-200"
                  : isTomorrow
                  ? "bg-amber-50 border-amber-200"
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100"
              )}
            >
              {/* Date and Time Row */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-sm font-semibold px-2 py-0.5 rounded-md",
                    isToday
                      ? "bg-rose-100 text-rose-700"
                      : isTomorrow
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {isToday
                    ? "Heute"
                    : isTomorrow
                    ? "Morgen"
                    : format(startDate, "EEE, d. MMM", { locale: de })}
                </span>
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                  </span>
                </div>
              </div>

              {/* Student */}
              {exam.studentName && (
                <div className="flex items-center gap-2 text-sm text-slate-700 mb-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">{exam.studentName}</span>
                </div>
              )}

              {/* Details Row */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {showInstructor && (
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                      {exam.instructor.firstName[0]}
                    </div>
                    {exam.instructor.firstName} {exam.instructor.lastName}
                  </span>
                )}
                {exam.vehicle && (
                  <span className="flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5" />
                    {exam.vehicle.name}
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

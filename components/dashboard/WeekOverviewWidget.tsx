"use client";

import { addDays, format, startOfWeek, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekOverviewWidgetProps {
  weekOverview: Record<number, number>;
  totalAppointments: number;
}

export default function WeekOverviewWidget({
  weekOverview,
  totalAppointments,
}: WeekOverviewWidgetProps) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const days = [
    { key: 0, label: "Mo" },
    { key: 1, label: "Di" },
    { key: 2, label: "Mi" },
    { key: 3, label: "Do" },
    { key: 4, label: "Fr" },
    { key: 5, label: "Sa" },
    { key: 6, label: "So" },
  ];

  const maxAppointments = Math.max(...Object.values(weekOverview), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <CalendarDays className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Wochenübersicht</h2>
            <p className="text-sm text-slate-500">{format(weekStart, "d. MMM", { locale: de })} - {format(addDays(weekStart, 6), "d. MMM yyyy", { locale: de })}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">{totalAppointments}</p>
          <p className="text-xs text-slate-500">Termine gesamt</p>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-slate-100 w-full" />
          ))}
        </div>

        {/* Bars */}
        <div className="relative flex justify-between gap-3 pt-2">
          {days.map((day) => {
            const dayDate = addDays(weekStart, day.key);
            const isToday = isSameDay(dayDate, today);
            const count = weekOverview[day.key] || 0;
            const heightPercent = maxAppointments > 0 ? (count / maxAppointments) * 100 : 0;

            return (
              <div key={day.key} className="flex-1 flex flex-col items-center">
                <div className="relative w-full h-32 flex items-end justify-center mb-3">
                  <div
                    className={cn(
                      "w-full max-w-[48px] rounded-t-lg transition-all duration-500 ease-out relative overflow-hidden",
                      isToday
                        ? "bg-gradient-to-t from-amber-500 to-amber-400 shadow-lg shadow-amber-200"
                        : "bg-gradient-to-t from-slate-200 to-slate-100"
                    )}
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  >
                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>

                  {/* Count Badge */}
                  {count > 0 && (
                    <span
                      className={cn(
                        "absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-semibold px-2 py-0.5 rounded-full",
                        isToday
                          ? "bg-amber-500 text-white"
                          : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </div>

                {/* Day Label */}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isToday ? "text-amber-600" : "text-slate-600"
                  )}
                >
                  {day.label}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    isToday ? "text-amber-500 font-medium" : "text-slate-400"
                  )}
                >
                  {format(dayDate, "d.")}
                </span>

                {/* Today Indicator */}
                {isToday && (
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

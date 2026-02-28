"use client";

import { format, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { AlertTriangle, User, Calendar, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CachedPayment {
  id: string;
  appointmentId: string;
  cachedDate: string;
  studentName?: string;
  type: string;
  startTime: string;
  instructorFirstName: string;
  instructorLastName: string;
}

interface PreviousDayOpenPaymentsWidgetProps {
  payments: CachedPayment[];
  totalCount: number;
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PRACTICAL_LESSON: "Fahrstunde",
    EXAM: "Prüfung",
    HIGHWAY: "Autobahn",
    NIGHT_DRIVE: "Nachtfahrt",
    COUNTRY_ROAD: "Überland",
  };
  return labels[type] || type;
}

export default function PreviousDayOpenPaymentsWidget({
  payments,
  totalCount,
}: PreviousDayOpenPaymentsWidgetProps) {
  const router = useRouter();
  const yesterday = subDays(new Date(), 1);
  const yesterdayFormatted = format(yesterday, "EEEE, d. MMMM", { locale: de });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Offene Zahlungen (Vortag)</h2>
            <p className="text-xs text-slate-500">{yesterdayFormatted}</p>
          </div>
        </div>
        {totalCount > 0 && (
          <span className="bg-amber-100 text-amber-700 text-sm font-semibold px-2.5 py-1 rounded-lg">
            {totalCount}
          </span>
        )}
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">Keine offenen Zahlungen vom Vortag</p>
          <p className="text-slate-400 text-xs mt-1">Alle gestrigen Zahlungen sind beglichen</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {payments.map((payment) => (
              <div
                key={payment.id}
                onClick={() => {
                  if (payment.studentName) {
                    router.push(`/finanzen?query=${encodeURIComponent(payment.studentName)}`);
                  }
                }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {payment.studentName || "Kein Name"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 ml-8 text-xs text-slate-500">
                    <span className="font-medium text-slate-600">{getTypeLabel(payment.type)}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(payment.startTime), "HH:mm", { locale: de })} Uhr
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[10px] font-medium text-amber-700">
                    {payment.instructorFirstName[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalCount > payments.length && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4 text-slate-600 hover:text-amber-600 hover:bg-amber-50"
              onClick={() => router.push("/finanzen")}
            >
              Alle {totalCount} anzeigen
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

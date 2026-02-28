"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import TodoWidget from "@/components/dashboard/ToDoWidget";
import NotesWidget from "@/components/dashboard/NotesWidget";
import UpcomingExamsWidget from "@/components/dashboard/UpcomingExamsWidget";
import OpenPaymentsWidget from "@/components/dashboard/OpenPaymentsWidget";
import PreviousDayOpenPaymentsWidget from "@/components/dashboard/PreviousDayOpenPaymentsWidget";
import WeekOverviewWidget from "@/components/dashboard/WeekOverviewWidget";
import MyNextAppointmentsWidget from "@/components/dashboard/MyNextAppointmentsWidget";
import { CalendarDays, ClipboardCheck, TrendingUp } from "lucide-react";

interface DashboardData {
  upcomingExams: any[];
  openPayments: any[];
  openPaymentsCount: number;
  myNextAppointments: any[];
  weekOverview: Record<number, number>;
  totalAppointmentsThisWeek: number;
  isAdmin: boolean;
  previousDayOpenPayments: any[];
  previousDayOpenPaymentsCount: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard", { credentials: "include" });
      if (res.ok) {
        setDashboardData(await res.json());
      }
    } catch (error) {
      console.error("Fehler beim Laden der Dashboard-Daten:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "ADMIN" || user.role === "OWNER";
  const totalWeekAppointments = dashboardData?.totalAppointmentsThisWeek || 0;
  const upcomingExamsCount = dashboardData?.upcomingExams?.length || 0;
  const openPaymentsCount = dashboardData?.openPaymentsCount || 0;

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Dashboard</h1>
            <p className="text-xl font-medium text-foreground">
              {getGreeting()}, {user.firstName}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin
                ? "Deine Übersicht auf einen Blick"
                : "Deine anstehenden Aufgaben und Termine"}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-3 px-4 py-3 bg-card border rounded-xl shadow-sm">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CalendarDays className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalWeekAppointments}</p>
                <p className="text-xs text-muted-foreground">Diese Woche</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-card border rounded-xl shadow-sm">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <ClipboardCheck className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{upcomingExamsCount}</p>
                <p className="text-xs text-muted-foreground">Prüfungen</p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-3 px-4 py-3 bg-card border rounded-xl shadow-sm">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{openPaymentsCount}</p>
                  <p className="text-xs text-muted-foreground">Offen</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-6">
          <WeekOverviewWidget
            weekOverview={dashboardData?.weekOverview || {}}
            totalAppointments={dashboardData?.totalAppointmentsThisWeek || 0}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodoWidget />
            <NotesWidget />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingExamsWidget
              exams={dashboardData?.upcomingExams || []}
              showInstructor={isAdmin}
            />
            {isAdmin ? (
              <OpenPaymentsWidget
                payments={dashboardData?.openPayments || []}
                totalCount={dashboardData?.openPaymentsCount || 0}
              />
            ) : (
              <MyNextAppointmentsWidget
                appointments={dashboardData?.myNextAppointments || []}
              />
            )}
          </div>

          {isAdmin && (
            <PreviousDayOpenPaymentsWidget
              payments={dashboardData?.previousDayOpenPayments || []}
              totalCount={dashboardData?.previousDayOpenPaymentsCount || 0}
            />
          )}
        </div>
      )}
    </div>
  );
}

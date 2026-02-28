"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock, Car, Route, BookOpen, GraduationCap } from "lucide-react";

interface StatisticsSummaryCardsProps {
  totals: {
    uebungsfahrten: number;
    sonderfahrten: number;
    theorie: number;
    pruefungen: number;
    total: number;
  };
  className?: string;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
  isMain?: boolean;
}

function StatCard({ label, value, icon, accent, isMain }: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "border-border/40 hover:border-border/80",
        "hover:shadow-sm",
        isMain && "bg-primary/[0.02] border-primary/20"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight tabular-nums",
                isMain && "text-primary"
              )}
            >
              {value.toFixed(1)}
              <span className="text-base font-normal text-muted-foreground ml-0.5">
                h
              </span>
            </p>
          </div>
          <div
            className={cn(
              "p-2.5 rounded-lg",
              accent || "bg-muted/50"
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatisticsSummaryCards({
  totals,
  className,
}: StatisticsSummaryCardsProps) {
  const cards: StatCardProps[] = [
    {
      label: "Gesamt",
      value: totals.total,
      icon: <Clock className="h-5 w-5 text-primary" />,
      accent: "bg-primary/10",
      isMain: true,
    },
    {
      label: "Übungsfahrten",
      value: totals.uebungsfahrten,
      icon: <Car className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      accent: "bg-emerald-500/10",
    },
    {
      label: "Sonderfahrten",
      value: totals.sonderfahrten,
      icon: <Route className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      accent: "bg-blue-500/10",
    },
    {
      label: "Theorie",
      value: totals.theorie,
      icon: <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      accent: "bg-purple-500/10",
    },
    {
      label: "Prüfungen",
      value: totals.pruefungen,
      icon: <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      accent: "bg-amber-500/10",
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
        className
      )}
    >
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Printer, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface InstructorHours {
  instructorId: string;
  instructorName: string;
  uebungsfahrten: number;
  sonderfahrten: number;
  theorie: number;
  pruefungen: number;
  total: number;
}

interface ExportButtonsProps {
  instructors: InstructorHours[];
  totals: {
    uebungsfahrten: number;
    sonderfahrten: number;
    theorie: number;
    pruefungen: number;
    total: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

export function ExportButtons({
  instructors,
  totals,
  period,
}: ExportButtonsProps) {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd-MM-yyyy", { locale: de });
  };

  const handleExportCSV = () => {
    // CSV headers
    const headers = [
      "Fahrlehrer",
      "Übungsfahrten (h)",
      "Sonderfahrten (h)",
      "Theorie (h)",
      "Prüfungen (h)",
      "Gesamt (h)",
    ];

    // CSV rows
    const rows = instructors.map((i) => [
      i.instructorName,
      i.uebungsfahrten.toFixed(1),
      i.sonderfahrten.toFixed(1),
      i.theorie.toFixed(1),
      i.pruefungen.toFixed(1),
      i.total.toFixed(1),
    ]);

    // Add totals row
    rows.push([
      "SUMME",
      totals.uebungsfahrten.toFixed(1),
      totals.sonderfahrten.toFixed(1),
      totals.theorie.toFixed(1),
      totals.pruefungen.toFixed(1),
      totals.total.toFixed(1),
    ]);

    // Build CSV string with semicolon separator for German Excel
    const csvContent = [
      `Stundenabrechnung vom ${format(new Date(period.startDate), "dd.MM.yyyy", { locale: de })} bis ${format(new Date(period.endDate), "dd.MM.yyyy", { locale: de })}`,
      "",
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n");

    // Add BOM for UTF-8 encoding
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Stundenabrechnung_${formatDate(period.startDate)}_${formatDate(period.endDate)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border/60 hover:border-border"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={handleExportCSV}
          className="gap-3 cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <div className="flex flex-col">
            <span className="font-medium">CSV Export</span>
            <span className="text-xs text-muted-foreground">
              Für Excel & Co.
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportPDF}
          className="gap-3 cursor-pointer"
        >
          <Printer className="h-4 w-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">PDF / Drucken</span>
            <span className="text-xs text-muted-foreground">
              Als PDF speichern
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

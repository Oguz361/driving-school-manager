"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { de } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

const PRESETS = [
  {
    label: "Diese Woche",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "Dieser Monat",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Dieses Quartal",
    getValue: () => ({
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date()),
    }),
  },
  {
    label: "Dieses Jahr",
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
];

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePresetClick = (preset: (typeof PRESETS)[number]) => {
    onDateRangeChange(preset.getValue());
    setIsOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Date Range Trigger */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-11 px-4",
              "border-border/60 hover:border-border hover:bg-accent/50",
              "transition-all duration-200",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-3 h-4 w-4 opacity-60" />
            {dateRange?.from ? (
              dateRange.to ? (
                <span className="flex items-center gap-2">
                  <span className="font-medium">
                    {format(dateRange.from, "dd. MMM yyyy", { locale: de })}
                  </span>
                  <span className="text-muted-foreground">bis</span>
                  <span className="font-medium">
                    {format(dateRange.to, "dd. MMM yyyy", { locale: de })}
                  </span>
                </span>
              ) : (
                format(dateRange.from, "dd. MMMM yyyy", { locale: de })
              )
            ) : (
              <span>Zeitraum auswählen</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            locale={de}
            weekStartsOn={1}
          />
        </PopoverContent>
      </Popover>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const presetValue = preset.getValue();
          const isActive =
            dateRange?.from?.getTime() === presetValue.from.getTime() &&
            dateRange?.to?.getTime() === presetValue.to.getTime();

          return (
            <Button
              key={preset.label}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(preset)}
              className={cn(
                "text-xs font-medium transition-all duration-200",
                !isActive && "border-border/60 hover:border-border hover:bg-accent/50"
              )}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

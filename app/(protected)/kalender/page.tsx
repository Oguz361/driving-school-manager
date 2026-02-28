'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View, ToolbarProps, EventPropGetter, Components } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  getDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  eachDayOfInterval,
  addDays,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Download, FileSpreadsheet, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { IconCalendar } from "@tabler/icons-react";
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import EntryModal from '@/components/entries/EntryModal';
import { cn } from '@/lib/utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'de': de };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: de }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'appointment' | 'unavailability';
  appointmentType?: string;
  unavailabilityType?: string;
  resource?: any;
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  transmission: string;
}

type MobileView = 'month' | 'day';

function getAppointmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PRACTICAL_LESSON: 'Fahrstunde',
    THEORY_LESSON: 'Theorie',
    EXAM: 'Prüfung',
    HIGHWAY: 'Autobahn',
    NIGHT_DRIVE: 'Nachtfahrt',
    COUNTRY_ROAD: 'Überland',
  };
  return labels[type] || type;
}

function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: 'Offen',
    PAID: 'Bezahlt',
  };
  return labels[status] || status;
}

function getUnavailabilityTypeLabel(type: string): string {
  return 'Abwesend';
}

function getEventColor(event: CalendarEvent): { bg: string; border: string } {
  if (event.type === 'appointment') {
    switch (event.appointmentType) {
      case 'PRACTICAL_LESSON': 
        // Sonderfahrten (mit routeType) = lila, normale Übungsfahrten = grün
        if (event.resource?.routeType) {
          return { bg: '#8b5cf6', border: '#7c3aed' }; // Lila für Sonderfahrten
        }
        return { bg: '#10b981', border: '#059669' }; // Grün für normale Fahrstunden
      case 'THEORY_LESSON': return { bg: '#3b82f6', border: '#2563eb' };
      case 'EXAM': return { bg: '#ef4444', border: '#dc2626' };
      default: return { bg: '#3174ad', border: '#265985' };
    }
  }
  return { bg: '#6b7280', border: '#4b5563' };
}

const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<CalendarEvent>) => {
  return (
    <div className="flex items-center justify-between mb-4 px-4 pt-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => onNavigate('TODAY')}>Heute</Button>
      </div>

      <div className="flex items-center gap-2.5">
        <Button variant="outline" size="icon" onClick={() => onNavigate('PREV')} aria-label="Zurück">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
          {label}
        </div>

        <Button variant="outline" size="icon" onClick={() => onNavigate('NEXT')} aria-label="Weiter">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        <Button variant={view === 'week' ? 'default' : 'outline'} size="sm" onClick={() => onView('week')}>Woche</Button>
        <Button variant={view === 'day' ? 'default' : 'outline'} size="sm" onClick={() => onView('day')}>Tag</Button>
      </div>
    </div>
  );
};

const EventComponent = ({ event, title }: { event: CalendarEvent; title: string }) => {
  const note = event.type === 'appointment' ? event.resource?.notes : event.resource?.reason;
  const hasNote = note && note.trim().length > 0;
  const paymentStatus = event.type === 'appointment' ? event.resource?.paymentStatus : null;

return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full h-full flex items-center justify-center overflow-hidden cursor-pointer">
            <span className="truncate font-medium text-xs sm:text-sm px-1">{title}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs p-3 shadow-lg bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 border border-neutral-200 dark:border-neutral-800" 
          side="top"
        >
          <div className="space-y-1">
            <p className="font-semibold text-sm">{title}</p>
            {event.type === 'appointment' &&
             event.resource?.student &&
             event.appointmentType !== 'THEORY_LESSON' && (
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                👤 {event.resource.student.firstName} {event.resource.student.lastName}
              </p>
            )}
            
            {event.type === 'appointment' &&
             paymentStatus &&
             event.appointmentType !== 'THEORY_LESSON' &&
             event.appointmentType !== 'EXAM' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Status: <span className={cn(
                  "font-medium",
                  paymentStatus === 'PAID' ? "text-green-600 dark:text-green-400" :
                  "text-orange-600 dark:text-orange-400"
                )}>
                  {getPaymentStatusLabel(paymentStatus)}
                </span>
              </p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')} Uhr
            </p>
            
            {hasNote && (
              <div className="pt-1 mt-1 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs italic text-gray-600 dark:text-gray-300">"{note}"</p>
              </div>
            )}
            {event.type === 'appointment' &&
             event.appointmentType !== 'THEORY_LESSON' &&
             event.resource?.vehicle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                🚗 {event.resource.vehicle.name}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

function MobileMonthGrid({
  month,
  events,
  onDayClick,
}: {
  month: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
}) {
  const today = new Date();
  
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfWeek(monthStart, { locale: de });
    const endDate = addDays(startOfWeek(monthEnd, { locale: de }), 41);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [month]);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day));
  };

  const weekDays = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];

  const weeksNeeded = Math.ceil(calendarDays.filter(day => isSameMonth(day, month) || calendarDays.indexOf(day) < 7).length / 7);
  const displayDays = calendarDays.slice(0, weeksNeeded * 7);

  return (
    <div className="flex-shrink-0 w-full">
      <div className="sticky top-0 bg-neutral-100 dark:bg-neutral-800 z-10 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {format(month, 'MMMM', { locale: de })}
        </h2>
      </div>

      <div className="grid grid-cols-7 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        {weekDays.map((day, idx) => (
          <div 
            key={idx} 
            className={cn(
              "py-2 text-center text-xs font-semibold",
              idx >= 5 ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-500 dark:text-neutral-400"
            )}
          >
            {day}
          </div>
        ))}
      </div>

<div className="grid grid-cols-7">
        {displayDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const isWeekend = getDay(day) === 0 || getDay(day) === 6;
          
          return (
            <button
              key={idx}
              onClick={() => onDayClick(day)}
              className={cn(
                "aspect-[1/1.2] p-1 flex flex-col items-center border-b border-r border-neutral-200 dark:border-neutral-700 group",
                !isCurrentMonth && "bg-neutral-50/50 dark:bg-neutral-900/50"
              )}
            >
              <span
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-full text-base font-medium transition-colors",
                  !isToday && "group-active:bg-neutral-200 dark:group-active:bg-neutral-700 group-active:text-neutral-900 dark:group-active:text-neutral-100",
                  isToday && "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900",
                  !isCurrentMonth && "text-neutral-300 dark:text-neutral-600",
                  isCurrentMonth && !isToday && (isWeekend ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-900 dark:text-neutral-100")
                )}
              >
                {format(day, 'd')}
              </span>
              
              {dayEvents.length > 0 && isCurrentMonth && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {dayEvents.slice(0, 3).map((event, eventIdx) => {
                    const colors = getEventColor(event);
                    return (
                      <div
                        key={eventIdx}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: colors.bg }}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileScrollMonthView({
  events,
  onDayClick,
  onNewEntry,
  instructors,
  selectedInstructorId,
  onInstructorChange,
  isAdmin,
}: {
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onNewEntry: () => void;
  instructors: Instructor[];
  selectedInstructorId: string;
  onInstructorChange: (id: string) => void;
  isAdmin: boolean;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleMonths, setVisibleMonths] = useState<Date[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const loadingRef = useRef(false);

  useEffect(() => {
    const now = new Date();
    const months: Date[] = [];
    
    for (let i = -3; i <= 12; i++) {
      months.push(addMonths(startOfMonth(now), i));
    }
    
    setVisibleMonths(months);
  }, []);

  useEffect(() => {
    if (visibleMonths.length > 0 && scrollContainerRef.current) {
      const currentMonthIndex = visibleMonths.findIndex(m => 
        isSameMonth(m, new Date())
      );
      
      if (currentMonthIndex > 0) {
        const monthElements = scrollContainerRef.current.children;
        if (monthElements[currentMonthIndex]) {
          setTimeout(() => {
            monthElements[currentMonthIndex].scrollIntoView({ behavior: 'auto', block: 'start' });
          }, 100);
        }
      }
    }
  }, [visibleMonths.length]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || loadingRef.current) return;
    
    const container = scrollContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    if (scrollTop < 500 && visibleMonths.length > 0) {
      loadingRef.current = true;
      const firstMonth = visibleMonths[0];
      const newMonths: Date[] = [];
      
      for (let i = 3; i >= 1; i--) {
        newMonths.push(subMonths(firstMonth, i));
      }
      
      setVisibleMonths(prev => [...newMonths, ...prev]);
      
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const newScrollTop = scrollTop + (container.scrollHeight - scrollHeight);
          scrollContainerRef.current.scrollTop = newScrollTop;
        }
        loadingRef.current = false;
      }, 0);
    }
    
    if (scrollTop + clientHeight > scrollHeight - 500 && visibleMonths.length > 0) {
      loadingRef.current = true;
      const lastMonth = visibleMonths[visibleMonths.length - 1];
      const newMonths: Date[] = [];
      
      for (let i = 1; i <= 3; i++) {
        newMonths.push(addMonths(lastMonth, i));
      }
      
      setVisibleMonths(prev => [...prev, ...newMonths]);
      loadingRef.current = false;
    }

    const monthElements = container.children;
    for (let i = 0; i < monthElements.length; i++) {
      const rect = monthElements[i].getBoundingClientRect();
      if (rect.top >= 0 && rect.top < clientHeight / 2) {
        const year = visibleMonths[i]?.getFullYear();
        if (year && year !== currentYear) {
          setCurrentYear(year);
        }
        break;
      }
    }
  }, [visibleMonths, currentYear]);

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-800">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
        <button
          onClick={() => {
            const yearStart = visibleMonths.findIndex(m => m.getFullYear() === currentYear && m.getMonth() === 0);
            if (yearStart >= 0 && scrollContainerRef.current) {
              const monthElements = scrollContainerRef.current.children;
              monthElements[yearStart]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="text-neutral-700 dark:text-neutral-300 font-semibold text-lg flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          {currentYear}
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Select value={selectedInstructorId} onValueChange={onInstructorChange}>
              <SelectTrigger className="w-[130px] h-9 text-sm">
                <SelectValue placeholder="Fahrlehrer" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {instructors.map((i) => (
                  <SelectItem key={i.id} value={i.id}>{i.firstName} {i.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button size="icon" variant="ghost" onClick={onNewEntry}>
            <Plus className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {visibleMonths.map((month) => (
          <MobileMonthGrid
            key={`${month.getFullYear()}-${month.getMonth()}`}
            month={month}
            events={events}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}

function MobileDayView({
  selectedDate,
  events,
  onBack,
  onEventClick,
  onDateChange,
  onNewEntry,
  instructors,
  selectedInstructorId,
  onInstructorChange,
  isAdmin,
}: {
  selectedDate: Date;
  events: CalendarEvent[];
  onBack: () => void;
  onEventClick: (event: CalendarEvent) => void;
  onDateChange: (date: Date) => void;
  onNewEntry: () => void;
  instructors: Instructor[];
  selectedInstructorId: string;
  onInstructorChange: (id: string) => void;
  isAdmin: boolean;
}) {
  const dayEvents = useMemo(() => {
    return events
      .filter(event => isSameDay(event.start, selectedDate))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, selectedDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 7; hour <= 23; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(event => event.start.getHours() === hour);
  };

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { locale: de });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [selectedDate]);

  const today = new Date();

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-800">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 -ml-2"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="ml-1">{format(selectedDate, 'MMMM', { locale: de })}</span>
        </Button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Select value={selectedInstructorId} onValueChange={onInstructorChange}>
              <SelectTrigger className="w-[130px] h-9 text-sm">
                <SelectValue placeholder="Fahrlehrer" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {instructors.map((i) => (
                  <SelectItem key={i.id} value={i.id}>{i.firstName} {i.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button size="icon" variant="ghost" onClick={onNewEntry}>
            <Plus className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
          </Button>
        </div>
      </div>

<div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-700">
        {weekDays.map((day, idx) => {
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const dayLetter = format(day, 'EEEEE', { locale: de });
          
          return (
            <button
              key={idx}
              onClick={() => onDateChange(day)}
              className="flex flex-col items-center py-2 group" 
            >
              <span className={cn(
                "text-xs font-medium mb-1",
                isSelected ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"
              )}>
                {dayLetter.toUpperCase()}
              </span>
              <span className={cn(
                "w-9 h-9 flex items-center justify-center rounded-full text-base transition-colors", 
                !isSelected && "group-active:bg-neutral-200 dark:group-active:bg-neutral-700",
                
                isToday && isSelected && "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 font-bold",
                isToday && !isSelected && "text-neutral-900 dark:text-neutral-100 font-bold",
                isSelected && !isToday && "bg-neutral-300 dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100",
                !isSelected && !isToday && "text-neutral-700 dark:text-neutral-300"
              )}>
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {format(selectedDate, 'EEEE – d. MMM. yyyy', { locale: de })}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-neutral-900">
        {timeSlots.map((hour) => {
          const hourEvents = getEventsForHour(hour);

          return (
            <div key={hour} className="flex w-full border-b border-neutral-200 dark:border-neutral-700 min-h-[60px]">
              <div className="w-16 flex-shrink-0 py-2 px-2 text-right">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
              
              <div className="flex-1 min-w-0 border-l border-neutral-200 dark:border-neutral-700 py-1 px-3">
                {hourEvents.map((event) => {
                  const colors = getEventColor(event);
                  const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
                  
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="w-full text-left mb-1 rounded-md p-2 active:opacity-70"
                      style={{ 
                        backgroundColor: colors.bg,
                        minHeight: Math.max(40, duration * 0.8)
                      }}
                    >
                      <p className="text-white text-sm font-medium truncate">
                        {event.title}
                      </p>
                      <p className="text-white/80 text-xs">
                        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                      </p>
                      {event.type === 'appointment' && event.resource?.student && (
                        <p className="text-white/70 text-xs truncate">
                          {event.resource.student.firstName} {event.resource.student.lastName}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function KalenderPage() {
  const { data: session } = useSession();
  const user = session?.user;
  
  const [view, setView] = useState<View>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [daysWithEvents, setDaysWithEvents] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mobileView, setMobileView] = useState<MobileView>('month');

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [selectedEntryType, setSelectedEntryType] = useState<'appointment' | 'unavailability' | undefined>(undefined);

  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditStartDate, setAuditStartDate] = useState<Date | undefined>();
  const [auditEndDate, setAuditEndDate] = useState<Date | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';
        const [vehiclesRes, instructorsRes] = await Promise.all([
          fetch('/api/vehicles', { credentials: 'include' }),
          isAdminOrOwner ? fetch('/api/users?role=INSTRUCTOR', { credentials: 'include' }) : Promise.resolve(null)
        ]);

        if (vehiclesRes.ok) {
          setVehicles(await vehiclesRes.json());
        }
        if (instructorsRes && instructorsRes.ok) {
          const instructorsList = await instructorsRes.json();
          setInstructors(instructorsList);
          // Ersten Instructor als Default auswählen für Admin/Owner-User
          if (isAdminOrOwner && instructorsList.length > 0 && !selectedInstructorId) {
            setSelectedInstructorId(instructorsList[0].id);
          }
        } else if (user?.role === 'INSTRUCTOR') {
          // Für Instructor-User, eigene ID verwenden
          setSelectedInstructorId(user.id);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Basisdaten:', error);
      }
    };

    fetchBaseData();
  }, [user]);

  useEffect(() => {
    if (selectedInstructorId) {
      loadEvents();
    }
  }, [selectedInstructorId]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const start = subMonths(startOfMonth(now), 6);
      const end = addMonths(endOfMonth(now), 12);

      const [appointmentsRes, unavailabilitiesRes] = await Promise.all([
        fetch(
          `/api/appointments?start=${start.toISOString()}&end=${end.toISOString()}&instructorId=${selectedInstructorId}`,
          { credentials: 'include' }
        ),
        fetch(
          `/api/unavailabilities?start=${start.toISOString()}&end=${end.toISOString()}&instructorId=${selectedInstructorId}`,
          { credentials: 'include' }
        ),
      ]);

      if (!appointmentsRes.ok || !unavailabilitiesRes.ok) {
        throw new Error('Fehler beim Laden der Daten');
      }

      const appointments = await appointmentsRes.json();
      const unavailabilities = await unavailabilitiesRes.json();

      const appointmentEvents: CalendarEvent[] = appointments.map((apt: any) => {
        // Bestimme Titel basierend auf type und routeType
        let title: string;
        if (apt.type === 'PRACTICAL_LESSON' && apt.routeType && ['COUNTRY', 'HIGHWAY', 'NIGHT'].includes(apt.routeType)) {
          title = 'Sonderfahrt';
        } else {
          title = getAppointmentTypeLabel(apt.type);
        }

        return {
          id: apt.id,
          title: title,
          start: new Date(apt.startTime),
          end: new Date(apt.endTime),
          type: 'appointment',
          appointmentType: apt.type,
          resource: apt,
        };
      });

      const unavailabilityEvents: CalendarEvent[] = unavailabilities.map((unav: any) => ({
        id: unav.id,
        title: `${getUnavailabilityTypeLabel(unav.type)}`, 
        start: new Date(unav.startTime),
        end: new Date(unav.endTime),
        type: 'unavailability',
        unavailabilityType: unav.type,
        resource: unav,
      }));

      const allEvents = [...appointmentEvents, ...unavailabilityEvents];
      setEvents(allEvents);

      const eventDates = allEvents.map(e => {
        const date = new Date(e.start);
        date.setHours(0, 0, 0, 0);
        return date;
      });
      setDaysWithEvents(eventDates);
    } catch (error) {
      console.error('Fehler beim Laden der Events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEntry(event.resource);
    setSelectedEntryType(event.type);
    setIsEntryModalOpen(true);
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setSelectedEntryType(undefined);
    setIsEntryModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEntryModalOpen(false);
    setSelectedEntry(null);
    setSelectedEntryType(undefined);
  };

  const handleSuccess = () => {
    loadEvents();
  };

  const handleCsvExport = () => {
    const headers = ['Datum', 'Uhrzeit', 'Typ', 'Fahrschüler', 'Fahrzeug', 'Bezahlstatus', 'Notizen'];
    const bom = '\uFEFF'; // UTF-8 BOM for Excel
    let csvContent = bom + headers.join(';') + '\n';

    eventsForPrint.forEach((event) => {
      const escapeCSV = (value: string | null | undefined): string => {
        if (!value) return '';
        const str = String(value);
        if (str.includes(';') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const typeLabel = event.title;

      const studentName = event.type === 'appointment' && event.resource?.student
        ? `${event.resource.student.firstName} ${event.resource.student.lastName}`
        : '';

      const vehicleName = event.type === 'appointment' && event.resource?.vehicle
        ? event.resource.vehicle.name
        : '';

      const paymentStatus = event.type === 'appointment' && event.resource?.paymentStatus
        ? getPaymentStatusLabel(event.resource.paymentStatus)
        : '';

      const notes = event.type === 'appointment'
        ? event.resource?.notes || ''
        : event.resource?.reason || '';

      const row = [
        escapeCSV(format(event.start, 'dd.MM.yyyy', { locale: de })),
        escapeCSV(`${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`),
        escapeCSV(typeLabel),
        escapeCSV(studentName),
        escapeCSV(vehicleName),
        escapeCSV(paymentStatus),
        escapeCSV(notes),
      ];
      csvContent += row.join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = view === 'day'
      ? format(selectedDate, 'yyyy-MM-dd')
      : `KW${format(selectedDate, 'w')}-${format(selectedDate, 'yyyy')}`;
    link.download = `kalender-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAuditExport = async () => {
    if (!auditStartDate || !auditEndDate) return;

    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        type: 'full',
        startDate: auditStartDate.toISOString(),
        endDate: auditEndDate.toISOString(),
      });

      const response = await fetch(`/api/finances/export-audit?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Export fehlgeschlagen');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `audit-${format(auditStartDate, 'yyyy-MM-dd')}-${format(auditEndDate, 'yyyy-MM-dd')}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setAuditDialogOpen(false);
      setAuditStartDate(undefined);
      setAuditEndDate(undefined);
    } catch (error) {
      console.error('Audit export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleMobileNavigateToDay = (date: Date) => {
    setSelectedDate(date);
    setMobileView('day');
  };

  const handleMobileBackToMonth = () => {
    setMobileView('month');
  };

  const eventStyleGetter: EventPropGetter<CalendarEvent> = (event) => {
    const colors = getEventColor(event);

    const style: React.CSSProperties = {
      backgroundColor: colors.bg,
      borderColor: colors.border,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '6px',
      color: 'white',
      fontSize: '0.85rem',
      padding: '0 4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    };

    return { style };
  };

  const components: Components<CalendarEvent> = {
    toolbar: CustomToolbar,
    event: EventComponent,
  };

  const selectedInstructor = instructors.find(i => i.id === selectedInstructorId);
  const instructorName = selectedInstructor
    ? `${selectedInstructor.firstName} ${selectedInstructor.lastName}`
    : 'Lade...';

  const allInstructors = useMemo(() => {
    if (!user) return instructors;
    // Nur INSTRUCTOR-User können in der Liste sein, keine ADMIN/OWNER-User
    if (user.role === 'ADMIN' || user.role === 'OWNER') return instructors;

    const userAsInstructor = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: '',
    };
    const exists = instructors.some(i => i.id === user.id);
    return exists ? instructors : [userAsInstructor, ...instructors];
  }, [user, instructors]);

  const formatDateForPrint = (date: Date) => {
    return format(date, 'dd.MM.yyyy', { locale: de });
  };

  const formatTimeForPrint = (start: Date, end: Date) => {
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  const eventsForPrint = useMemo(() => {
    let start: Date;
    let end: Date;

    if (view === 'day') {
      start = startOfDay(selectedDate);
      end = endOfDay(selectedDate);
    } else {
      start = startOfWeek(selectedDate, { locale: de });
      end = endOfWeek(selectedDate, { locale: de });
    }

    return events
      .filter(event => event.start >= start && event.start <= end)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, view, selectedDate]);

  const currentPrintDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 15mm;
          }

          body * {
            visibility: hidden;
          }

          #print-area,
          #print-area * {
            visibility: visible;
          }

          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
          }

          .screen-only {
            display: none !important;
          }

          #print-area {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 10pt;
            color: #000;
            line-height: 1.4;
          }

          .print-header {
            border-bottom: 2px solid #000;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }

          .print-title {
            font-size: 20pt;
            font-weight: 600;
            letter-spacing: -0.5px;
            margin: 0 0 6px 0;
          }

          .print-subtitle {
            font-size: 10pt;
            color: #555;
            margin: 0;
          }

          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #ccc;
            padding: 8px 12px;
            text-align: left;
          }

          .print-table thead tr {
            background: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-table th {
            font-weight: 600;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #333;
          }

          .print-table tbody tr:nth-child(even) {
            background: #fafafa !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-type-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 9pt;
            font-weight: 500;
          }

          .print-type-fahrstunde { background: #d1fae5 !important; color: #065f46 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-type-theorie { background: #dbeafe !important; color: #1e40af !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-type-pruefung { background: #fee2e2 !important; color: #991b1b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-type-sonderfahrt { background: #ede9fe !important; color: #5b21b6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-type-abwesenheit { background: #e5e7eb !important; color: #374151 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          .print-footer {
            margin-top: 32px;
            padding-top: 14px;
            border-top: 1px solid #ddd;
            font-size: 9pt;
            color: #777;
            display: flex;
            justify-content: space-between;
          }
        }
      `}</style>

      <div id="print-area" className="hidden print:block">
        <div className="print-header">
          <h1 className="print-title">Kalender - Terminübersicht</h1>
          <p className="print-subtitle">
            Fahrlehrer: {selectedInstructor ? `${selectedInstructor.firstName} ${selectedInstructor.lastName}` : 'Alle'} |{' '}
            {view === 'day'
              ? format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })
              : `KW ${format(selectedDate, 'w', { locale: de })} (${format(startOfWeek(selectedDate, { locale: de }), 'dd.MM.')} - ${format(endOfWeek(selectedDate, { locale: de }), 'dd.MM.yyyy')})`
            }
          </p>
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Uhrzeit</th>
              <th>Typ</th>
              <th>Fahrschüler</th>
              <th>Fahrzeug</th>
              <th>Notizen</th>
            </tr>
          </thead>
          <tbody>
            {eventsForPrint.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  Keine Termine vorhanden
                </td>
              </tr>
            ) : (
              eventsForPrint.map((event) => {
                const getTypeBadgeClass = () => {
                  if (event.type === 'unavailability') return 'print-type-abwesenheit';
                  if (event.resource?.routeType) return 'print-type-sonderfahrt';
                  switch (event.appointmentType) {
                    case 'PRACTICAL_LESSON': return 'print-type-fahrstunde';
                    case 'THEORY_LESSON': return 'print-type-theorie';
                    case 'EXAM': return 'print-type-pruefung';
                    default: return '';
                  }
                };

                return (
                  <tr key={event.id}>
                    <td>{formatDateForPrint(event.start)}</td>
                    <td>{formatTimeForPrint(event.start, event.end)}</td>
                    <td>
                      <span className={`print-type-badge ${getTypeBadgeClass()}`}>
                        {event.title}
                      </span>
                    </td>
                    <td>
                      {event.type === 'appointment' && event.resource?.student
                        ? `${event.resource.student.firstName} ${event.resource.student.lastName}`
                        : '-'}
                    </td>
                    <td>
                      {event.type === 'appointment' && event.resource?.vehicle
                        ? event.resource.vehicle.name
                        : '-'}
                    </td>
                    <td>
                      {event.type === 'appointment'
                        ? event.resource?.notes || '-'
                        : event.resource?.reason || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="print-footer">
          <span>Erstellt am: {currentPrintDate}</span>
          <span>Fahrschul-Management-System</span>
        </div>
      </div>

      <div className="h-full flex flex-col screen-only">
      <div className="md:hidden flex flex-col h-[calc(100dvh-57px)] fixed inset-x-0 bottom-0 top-[57px] z-40 bg-neutral-100 dark:bg-neutral-800">
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner className="h-8 w-8" />
            </div>
          ) : mobileView === 'month' ? (
            <MobileScrollMonthView
              events={events}
              onDayClick={handleMobileNavigateToDay}
              onNewEntry={handleNewEntry}
              instructors={instructors}
              selectedInstructorId={selectedInstructorId}
              onInstructorChange={setSelectedInstructorId}
              isAdmin={user?.role === 'ADMIN' || user?.role === 'OWNER'}
            />
          ) : (
            <MobileDayView
              selectedDate={selectedDate}
              events={events}
              onBack={handleMobileBackToMonth}
              onEventClick={handleSelectEvent}
              onDateChange={setSelectedDate}
              onNewEntry={handleNewEntry}
              instructors={instructors}
              selectedInstructorId={selectedInstructorId}
              onInstructorChange={setSelectedInstructorId}
              isAdmin={user?.role === 'ADMIN' || user?.role === 'OWNER'}
            />
          )}
        </div>
      </div>

      <div className="hidden md:flex md:flex-col h-full">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Kalender
            </h1>
            <p className="text-sm text-muted-foreground">
              {(user?.role === 'ADMIN' || user?.role === 'OWNER') ? `Termine von: ${instructorName}` : 'Deine Termine und Abwesenheiten'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
              <Select value={selectedInstructorId} onValueChange={setSelectedInstructorId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Fahrlehrer wählen" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.firstName} {i.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.print()}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF exportieren
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCsvExport}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV exportieren
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setAuditDialogOpen(true)}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Steuerexport
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleNewEntry}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Eintrag
            </Button>
          </div>
        </div>

        <div className="flex-1 flex gap-6">
          <div className="w-80 flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={de}
                modifiers={{ hasEvents: daysWithEvents }}
                modifiersStyles={{ hasEvents: { fontWeight: 'bold', textDecoration: 'underline' } }}
                className="rounded-md border"
              />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Legende</h3>
               <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div><span>Praktische Fahrstunde</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded"></div><span>Theorieunterricht</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded"></div><span>Prüfung</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-500 rounded"></div><span>Sonderfahrt</span></div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-500 rounded"></div><span>Abwesenheit</span></div>
              </div>
            </div>
          </div>

          <div className={cn("flex-1 bg-white rounded-lg shadow", `calendar-view-${view}`)} style={{ minHeight: '700px' }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Spinner />
                </div>
              </div>
            ) : (
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                view={view}
                onView={setView}
                date={selectedDate}
                onNavigate={setSelectedDate}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleNewEntry}
                selectable
                eventPropGetter={eventStyleGetter}
                messages={{
                  allDay: 'Ganztägig', previous: 'Zurück', next: 'Weiter', today: 'Heute', month: 'Monat', week: 'Woche', day: 'Tag', agenda: 'Agenda', date: 'Datum', time: 'Zeit', event: 'Termin', noEventsInRange: 'Keine Termine in diesem Zeitraum', showMore: (total) => `+${total} weitere`,
                }}
                culture="de"
                defaultView="week"
                views={['week', 'day']}
                step={30}
                timeslots={2}
                min={new Date(2024, 0, 1, 7, 0)}
                max={new Date(2024, 0, 1, 23, 30)}
                showMultiDayTimes
                components={components}
              />
            )}
          </div>
        </div>
      </div>

      <EntryModal
        open={isEntryModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        entry={selectedEntry}
        entryType={selectedEntryType}
        defaultDate={selectedDate}
        defaultInstructorId={selectedInstructorId}
        instructors={allInstructors}
        vehicles={vehicles}
      />

      <Dialog open={auditDialogOpen} onOpenChange={(open) => {
        setAuditDialogOpen(open);
        if (!open) {
          setAuditStartDate(undefined);
          setAuditEndDate(undefined);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Steuerrechtlicher Export</DialogTitle>
            <DialogDescription>
              Exportiert alle Termine inkl. gelöschter Einträge mit Schülerdaten und Bezahlstatus für Betriebsprüfungen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Startdatum</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !auditStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {auditStartDate ? format(auditStartDate, 'dd.MM.yyyy', { locale: de }) : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={auditStartDate}
                    onSelect={(date) => {
                      setAuditStartDate(date);
                      setStartDateOpen(false);
                    }}
                    locale={de}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">Enddatum</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !auditEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {auditEndDate ? format(auditEndDate, 'dd.MM.yyyy', { locale: de }) : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={auditEndDate}
                    onSelect={(date) => {
                      setAuditEndDate(date);
                      setEndDateOpen(false);
                    }}
                    locale={de}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAuditDialogOpen(false);
              setAuditStartDate(undefined);
              setAuditEndDate(undefined);
            }}>
              Abbrechen
            </Button>
            <Button
              onClick={handleAuditExport}
              disabled={!auditStartDate || !auditEndDate || isExporting}
            >
              {isExporting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Exportiere...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportieren
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
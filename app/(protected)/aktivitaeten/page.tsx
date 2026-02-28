"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  ShieldAlert,
  User,
  Calendar,
  Monitor,
  FileJson,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ActionType = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "LOGIN_FAILED";

interface LogUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "INSTRUCTOR";
}

interface ActivityLog {
  id: string;
  action: ActionType;
  entityType: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  userAgent: string | null;
  timestamp: string;
  userId: string;
  user: LogUser;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Stats {
  period: { days: number; startDate: string; endDate: string };
  totals: { all: number; inPeriod: number };
  byAction: { action: ActionType; count: number }[];
  byEntityType: { entityType: string; count: number }[];
  topUsers: { user: LogUser | null; count: number }[];
  security: { failedLogins: number };
}

const ACTION_CONFIG: Record<ActionType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  CREATE: {
    label: "Erstellt",
    icon: Plus,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20"
  },
  UPDATE: {
    label: "Aktualisiert",
    icon: Pencil,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20"
  },
  DELETE: {
    label: "Gelöscht",
    icon: Trash2,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/20"
  },
  LOGIN: {
    label: "Anmeldung",
    icon: LogIn,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20"
  },
  LOGOUT: {
    label: "Abmeldung",
    icon: LogOut,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20"
  },
  LOGIN_FAILED: {
    label: "Fehlgeschlagen",
    icon: ShieldAlert,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20"
  },
};

const ENTITY_LABELS: Record<string, string> = {
  User: "Benutzer",
  Student: "Schüler",
  Appointment: "Termin",
  Vehicle: "Fahrzeug",
  Auth: "Authentifizierung",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="p-4 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 flex-1 max-w-[120px]" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 flex-1 max-w-[80px]" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variants = {
    default: {
      bg: "bg-slate-500/10",
      icon: "text-slate-600 dark:text-slate-400",
      border: "border-slate-500/20",
    },
    success: {
      bg: "bg-emerald-500/10",
      icon: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
    },
    warning: {
      bg: "bg-amber-500/10",
      icon: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
    },
    danger: {
      bg: "bg-red-500/10",
      icon: "text-red-600 dark:text-red-400",
      border: "border-red-500/20",
    },
  };

  const v = variants[variant];

  return (
    <div className={cn(
      "rounded-xl border p-5 transition-all duration-200 hover:shadow-md",
      v.border,
      "bg-card"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            {value.toLocaleString("de-DE")}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", v.bg)}>
          <Icon className={cn("h-5 w-5", v.icon)} />
        </div>
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: ActionType }) {
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
      config.bg,
      config.color
    )}>
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
}

function DetailDialog({
  log,
  open,
  onClose,
}: {
  log: ActivityLog | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!log) return null;

  const config = ACTION_CONFIG[log.action];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bg)}>
              <config.icon className={cn("h-4 w-4", config.color)} />
            </div>
            Aktivitätsdetails
          </DialogTitle>
          <DialogDescription>
            {format(new Date(log.timestamp), "EEEE, d. MMMM yyyy 'um' HH:mm:ss", { locale: de })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aktion</p>
              <ActionBadge action={log.action} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity-Typ</p>
              <p className="text-sm font-medium">{ENTITY_LABELS[log.entityType] || log.entityType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Benutzer</p>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm font-medium">
                  {log.user.firstName} {log.user.lastName}
                </span>
                <Badge variant="outline" className="text-xs">
                  {log.user.role === "ADMIN" ? "Admin" : "Fahrlehrer"}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity-ID</p>
              <p className="text-sm font-mono text-muted-foreground">
                {log.entityId || "–"}
              </p>
            </div>
          </div>

          {log.userAgent && (
            <div className="rounded-lg border border-border/60 p-4 space-y-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5" />
                Technische Details
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <Monitor className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground shrink-0">User-Agent:</span>
                  <span className="font-mono text-xs break-all">{log.userAgent}</span>
                </div>
              </div>
            </div>
          )}

          {log.changes && Object.keys(log.changes).length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileJson className="h-3.5 w-3.5" />
                Änderungen
              </p>
              <div className="rounded-lg border border-border/60 bg-slate-950 dark:bg-slate-900 p-4 overflow-x-auto">
                <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                  {JSON.stringify(log.changes, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AktivitaetenPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "25");
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (entityFilter !== "all") params.set("entityType", entityFilter);

      const res = await fetch(`/api/activity-logs?${params.toString()}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Logs:", error);
    }
  }, [page, actionFilter, entityFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/activity-logs/stats?days=7", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Statistiken:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchLogs(), fetchStats()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchLogs, fetchStats]);

  const handleResetFilters = () => {
    setActionFilter("all");
    setEntityFilter("all");
    setPage(1);
  };

  const handleOpenDetail = (log: ActivityLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const entityTypes = stats?.byEntityType.map(e => e.entityType) || [];

  const createCount = stats?.byAction.find(a => a.action === "CREATE")?.count || 0;
  const updateCount = stats?.byAction.find(a => a.action === "UPDATE")?.count || 0;
  const deleteCount = stats?.byAction.find(a => a.action === "DELETE")?.count || 0;
  const failedLogins = stats?.security.failedLogins || 0;

  const hasActiveFilters = actionFilter !== "all" || entityFilter !== "all";

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Aktivitätsprotokoll
          </h1>
          <p className="text-sm text-muted-foreground">
            Übersicht aller System-Aktivitäten der letzten 7 Tage
          </p>
        </div>

        {isLoading && !logs.length ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Gesamt (7 Tage)"
                value={stats?.totals.inPeriod || 0}
                icon={Activity}
                description={`${stats?.totals.all.toLocaleString("de-DE") || 0} insgesamt`}
              />
              <StatCard
                title="Erstellt"
                value={createCount}
                icon={Plus}
                variant="success"
              />
              <StatCard
                title="Aktualisiert"
                value={updateCount}
                icon={Pencil}
                variant="default"
              />
              {failedLogins > 0 ? (
                <StatCard
                  title="Fehlgeschlagene Logins"
                  value={failedLogins}
                  icon={AlertTriangle}
                  variant="warning"
                  description="Sicherheitshinweis"
                />
              ) : (
                <StatCard
                  title="Gelöscht"
                  value={deleteCount}
                  icon={Trash2}
                  variant="danger"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter:</span>
                </div>

                <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Aktion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Aktionen</SelectItem>
                    <SelectItem value="CREATE">Erstellt</SelectItem>
                    <SelectItem value="UPDATE">Aktualisiert</SelectItem>
                    <SelectItem value="DELETE">Gelöscht</SelectItem>
                    <SelectItem value="LOGIN">Anmeldung</SelectItem>
                    <SelectItem value="LOGOUT">Abmeldung</SelectItem>
                    <SelectItem value="LOGIN_FAILED">Fehlgeschlagen</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Entity-Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    {entityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {ENTITY_LABELS[type] || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                    <X className="h-3.5 w-3.5 mr-1" />
                    Zurücksetzen
                  </Button>
                )}
              </div>

              {pagination && (
                <p className="text-sm text-muted-foreground">
                  {pagination.total.toLocaleString("de-DE")} Einträge
                </p>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="text-center py-16 bg-card">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-4 rounded-full bg-muted/50 mb-4">
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Keine Aktivitäten gefunden
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Passen Sie die Filter an oder versuchen Sie es später erneut
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold w-[180px]">Zeitpunkt</TableHead>
                      <TableHead className="font-semibold">Benutzer</TableHead>
                      <TableHead className="font-semibold">Aktion</TableHead>
                      <TableHead className="font-semibold">Typ</TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">Entity-ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log, index) => (
                      <TableRow
                        key={log.id}
                        onClick={() => handleOpenDetail(log)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          index % 2 === 0 && "bg-muted/5",
                          "hover:bg-muted/20"
                        )}
                      >
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {format(new Date(log.timestamp), "dd.MM.yy HH:mm", { locale: de })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {log.user.firstName[0]}{log.user.lastName[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {log.user.firstName} {log.user.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                @{log.user.username}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ActionBadge action={log.action} />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {ENTITY_LABELS[log.entityType] || log.entityType}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="font-mono text-xs text-muted-foreground">
                            {log.entityId ? `${log.entityId.slice(0, 8)}...` : "–"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                      Seite {pagination.page} von {pagination.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={!pagination.hasNext}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Klicken Sie auf einen Eintrag, um Details anzuzeigen. Alle Aktivitäten werden automatisch protokolliert.
            </p>
          </>
        )}

        <DetailDialog
          log={selectedLog}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      </div>
    </div>
  );
}

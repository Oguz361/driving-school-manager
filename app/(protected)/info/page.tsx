"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Clock,
  Shield,
  Activity,
  Info,
  Scale,
  Database,
  UserCheck,
  Lock,
  FileCheck,
  Send,
  Trash2,
  Edit,
  Eye,
  Download,
} from "lucide-react";

export default function InfoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Info</h1>
        <p className="text-muted-foreground">
          Transparenz über automatische Prozesse und Datenschutz
        </p>
      </div>

      <Tabs defaultValue="prozesse" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="prozesse" className="gap-2">
            <Clock className="h-4 w-4" />
            <span>Prozesse</span>
          </TabsTrigger>
          <TabsTrigger value="datenschutz" className="gap-2">
            <Shield className="h-4 w-4" />
            <span>Datenschutz</span>
          </TabsTrigger>
          <TabsTrigger value="aktivitaet" className="gap-2">
            <Activity className="h-4 w-4" />
            <span>Aktivität</span>
          </TabsTrigger>
          <TabsTrigger value="ueber" className="gap-2">
            <Info className="h-4 w-4" />
            <span>Über</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prozesse" className="mt-6">
          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Automatische Prozesse
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">Zahlungs-Cache</h3>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                    Täglich 22:00 Uhr
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cached offene Zahlungen des Tages für das "Vortag"-Widget im
                  Dashboard. Cache wird nach 7 Tagen automatisch bereinigt.
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">Datenbereinigung</h3>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                    Täglich 03:00 Uhr
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bereinigt alte Aktivitätsprotokolle, deaktiviert/archiviert
                  inaktive Schüler, DSGVO-konforme Löschung.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="datenschutz" className="mt-6">
          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Datenschutz & DSGVO
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-medium text-foreground">
                    Rechtsgrundlagen der Datenverarbeitung
                  </h3>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                      Art. 6 Abs. 1 lit. b DSGVO
                    </p>
                    <p className="text-sm font-medium text-foreground">Vertragserfüllung</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Erfüllung des Fahrschulvertrags
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                      Art. 6 Abs. 1 lit. c DSGVO
                    </p>
                    <p className="text-sm font-medium text-foreground">Rechtliche Verpflichtung</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Gesetzliche Aufbewahrungspflichten
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                      Art. 6 Abs. 1 lit. f DSGVO
                    </p>
                    <p className="text-sm font-medium text-foreground">Berechtigtes Interesse</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ordnungsgemäße Betriebsführung
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-medium text-foreground">
                    Kategorien gespeicherter Daten
                  </h3>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <div>
                      <span className="font-medium text-foreground">Stammdaten:</span>
                      <span className="text-muted-foreground"> Name, Geburtsdatum</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <div>
                      <span className="font-medium text-foreground">Ausbildungsdaten:</span>
                      <span className="text-muted-foreground"> Fahrstunden, Prüfungen, Prüfungsstelle</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <div>
                      <span className="font-medium text-foreground">Zahlungsstatus:</span>
                      <span className="text-muted-foreground"> Offene/bezahlte Termine</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <div>
                      <span className="font-medium text-foreground">Aktivitätsdaten:</span>
                      <span className="text-muted-foreground"> Letzte Aktivität, Registrierungsdatum</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-medium text-foreground">
                    Ihre Rechte nach DSGVO
                  </h3>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Auskunft</span>
                      <span className="text-muted-foreground text-xs ml-1">(Art. 15)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                    <Edit className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Berichtigung</span>
                      <span className="text-muted-foreground text-xs ml-1">(Art. 16)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Löschung</span>
                      <span className="text-muted-foreground text-xs ml-1">(Art. 17)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                    <FileCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Einschränkung</span>
                      <span className="text-muted-foreground text-xs ml-1">(Art. 18)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                    <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Datenübertragbarkeit</span>
                      <span className="text-muted-foreground text-xs ml-1">(Art. 20)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                    <Send className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Widerspruch</span>
                      <span className="text-muted-foreground text-xs ml-1">(Art. 21)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-medium text-foreground">
                    Technische Sicherheitsmaßnahmen
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50">
                    <div className="p-1.5 bg-emerald-500/10 rounded">
                      <Lock className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Verschlüsselte Übertragung</p>
                      <p className="text-xs text-muted-foreground">HTTPS/TLS für alle Verbindungen</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50">
                    <div className="p-1.5 bg-emerald-500/10 rounded">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Zugriffskontrolle</p>
                      <p className="text-xs text-muted-foreground">Rollenbasierte Berechtigungen</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50">
                    <div className="p-1.5 bg-emerald-500/10 rounded">
                      <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Passwort-Hashing</p>
                      <p className="text-xs text-muted-foreground">Sichere Speicherung mit bcrypt</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Aufbewahrungsfristen
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-yellow-500 shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        6 Monate inaktiv
                      </span>
                      <span className="text-sm text-muted-foreground mx-2">→</span>
                      <span className="text-sm text-muted-foreground">
                        Automatische Deaktivierung
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        Prüfung bestanden
                      </span>
                      <span className="text-sm text-muted-foreground mx-2">→</span>
                      <span className="text-sm text-muted-foreground">
                        Nach 6 Monaten: Archivierung
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        1 Jahr inaktiv
                      </span>
                      <span className="text-sm text-muted-foreground mx-2">→</span>
                      <span className="text-sm text-muted-foreground">
                        Archivierung (Soft-Delete)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        10 Jahre archiviert
                      </span>
                      <span className="text-sm text-muted-foreground mx-2">→</span>
                      <span className="text-sm text-muted-foreground">
                        Endgültige Löschung (DSGVO)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        Aktivitätsprotokolle
                      </span>
                      <span className="text-sm text-muted-foreground mx-2">→</span>
                      <span className="text-sm text-muted-foreground">
                        Nach 90 Tagen automatisch gelöscht
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="aktivitaet" className="mt-6">
          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-sky-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Aktivitätsprotokoll
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Was wird protokolliert?
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-sky-500 mt-0.5">•</span>
                    Erstellen, Bearbeiten, Löschen von Datensätzen
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-sky-500 mt-0.5">•</span>
                    Login und Logout
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-sky-500 mt-0.5">•</span>
                    Fehlgeschlagene Login-Versuche (Sicherheitsmonitoring)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-sky-500 mt-0.5">•</span>
                    Änderungshistorie mit Vorher/Nachher-Werten
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-900">
                <p className="text-sm text-sky-700 dark:text-sky-300">
                  <strong>Hinweis:</strong> Nur ADMIN/OWNER haben Zugriff auf{" "}
                  <code className="px-1 py-0.5 bg-sky-100 dark:bg-sky-900 rounded text-xs">
                    /aktivitaeten
                  </code>
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ueber" className="mt-6">
          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <Info className="h-5 w-5 text-violet-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Über die App
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Name
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Fahrschul-Management-System
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Zweck
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Verwaltung von Fahrschülern, Terminen und Finanzen
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Entwickelt für
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Fahrschulbetreiber und Fahrlehrer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { prisma } from "@/lib/prisma";

export interface ConflictCheck {
  startTime: Date;
  endTime: Date;
  instructorId: string;
  vehicleId?: string | null;
  excludeAppointmentId?: string;
}

export interface Conflict {
  type: "INSTRUCTOR_BUSY" | "VEHICLE_BUSY" | "INSTRUCTOR_UNAVAILABLE";
  message: string;
  conflictingAppointment?: any;
  unavailability?: any;
}

export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: Conflict[];
}

// Hilfsfunktion für deutsche Bezeichnungen
function getAppointmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PRACTICAL_LESSON: 'praktische Fahrstunde',
    THEORY_LESSON: 'Theoriestunde',
    EXAM: 'Prüfung',
    HIGHWAY: 'Autobahnfahrt',
    NIGHT_DRIVE: 'Nachtfahrt',
    COUNTRY_ROAD: 'Überlandfahrt',
  };
  return labels[type] || 'Termin';
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("de-DE", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  });
}

export const conflictDetectionService = {
  async checkConflicts(data: ConflictCheck): Promise<ConflictResult> {
    const conflicts: Conflict[] = [];

    // 1. Fahrlehrer Doppelbuchung prüfen
    const instructorConflicts = await this.checkInstructorBusy(
      data.startTime,
      data.endTime,
      data.instructorId,
      data.excludeAppointmentId
    );
    conflicts.push(...instructorConflicts);

    // 2. Fahrzeug Doppelbuchung prüfen (nur wenn vehicleId vorhanden)
    if (data.vehicleId) {
      const vehicleConflicts = await this.checkVehicleBusy(
        data.startTime,
        data.endTime,
        data.vehicleId,
        data.excludeAppointmentId
      );
      conflicts.push(...vehicleConflicts);
    }

    // 3. Fahrlehrer Verfügbarkeit prüfen (Urlaub, Krankheit, etc.)
    const unavailabilityConflicts = await this.checkInstructorUnavailable(
      data.startTime,
      data.endTime,
      data.instructorId
    );
    conflicts.push(...unavailabilityConflicts);

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  },

  async checkInstructorBusy(
    startTime: Date,
    endTime: Date,
    instructorId: string,
    excludeAppointmentId?: string
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    const overlappingAppointments = await prisma.appointment.findMany({
      where: {
        instructorId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        deletedAt: null, // Exclude soft-deleted appointments
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
      include: {
        instructor: {
          select: { firstName: true, lastName: true },
        },
        vehicle: {
          select: { name: true, licensePlate: true },
        },
        // NEU: Schülerdaten mitladen, falls wir sie anzeigen wollen
        student: {
            select: { firstName: true, lastName: true }
        }
      },
    });

    for (const appointment of overlappingAppointments) {
      const typeLabel = getAppointmentTypeLabel(appointment.type);
      const startStr = formatTime(appointment.startTime);
      const endStr = formatTime(appointment.endTime);

      conflicts.push({
        type: "INSTRUCTOR_BUSY",
        message: `Fahrlehrer hat bereits eine ${typeLabel} von ${startStr} Uhr - ${endStr} Uhr`,
        conflictingAppointment: appointment,
      });
    }

    return conflicts;
  },

  async checkVehicleBusy(
    startTime: Date,
    endTime: Date,
    vehicleId: string,
    excludeAppointmentId?: string
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    const overlappingAppointments = await prisma.appointment.findMany({
      where: {
        vehicleId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        deletedAt: null, // Exclude soft-deleted appointments
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
      include: {
        instructor: {
          select: { firstName: true, lastName: true },
        },
        vehicle: {
          select: { name: true, licensePlate: true },
        },
        // NEU: Auch hier Schüler mitladen
        student: {
            select: { firstName: true, lastName: true }
        }
      },
    });

    for (const appointment of overlappingAppointments) {
      const startStr = formatTime(appointment.startTime);
      const endStr = formatTime(appointment.endTime);

      conflicts.push({
        type: "VEHICLE_BUSY",
        message: `Fahrzeug ${appointment.vehicle?.name} (${
          appointment.vehicle?.licensePlate
        }) ist bereits belegt von ${startStr} Uhr - ${endStr} Uhr`,
        conflictingAppointment: appointment,
      });
    }

    return conflicts;
  },

  async checkInstructorUnavailable(
    startTime: Date,
    endTime: Date,
    instructorId: string
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    const unavailabilities = await prisma.unavailability.findMany({
      where: {
        instructorId,
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });

    for (const unavailability of unavailabilities) {
      const startStr = formatDateTime(unavailability.startTime);
      const endStr = formatDateTime(unavailability.endTime);

      const reasonText = "nicht verfügbar";
      const additionalInfo = unavailability.reason ? ` (${unavailability.reason})` : "";

      conflicts.push({
        type: "INSTRUCTOR_UNAVAILABLE",
        message: `Der Fahrlehrer ist vom ${startStr} - ${endStr} ${reasonText}${additionalInfo}`,
        unavailability,
      });
    }

    return conflicts;
  },
};
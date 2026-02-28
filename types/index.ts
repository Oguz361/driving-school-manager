import { UserRole, AppointmentType, RouteType, PaymentStatus, TransmissionType, ActivityAction } from '@prisma/client';

// User Types
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  mustChangePassword: boolean;
}

// API Response Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Export Prisma Enums for convenience
export { UserRole, AppointmentType, RouteType, PaymentStatus, TransmissionType, ActivityAction };

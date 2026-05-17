import { Request } from 'express';

// Roles del sistema
export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
}

// Turnos del comedor
export enum MealShift {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
}

// Payload del JWT
export interface JwtPayload {
  userId: string;
  role: Role;
}

// Request autenticado
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Respuesta estándar de la API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Paginación
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

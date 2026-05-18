// Roles
export type Role = 'ADMIN' | 'STUDENT';

// Turnos
export type MealShift = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export const SHIFT_LABELS: Record<MealShift, string> = {
  BREAKFAST: 'Desayuno',
  LUNCH: 'Almuerzo',
  DINNER: 'Cena',
};

// Usuario
export interface User {
  id: string;
  universityId: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

// Menú
export interface Menu {
  id: string;
  date: string;
  shift: MealShift;
  startTime: string;
  endTime: string;
  description?: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  iron?: number;
  dishes: Dish[];
  images: MenuImage[];
  isActive: boolean;
  createdAt: string;
}

// Plato
export interface Dish {
  id: string;
  name: string;
  category?: string;
}

// Imagen del menú
export interface MenuImage {
  id: string;
  shift: MealShift;
  url: string;
  publicId: string;
}

// Valoración
export interface Rating {
  id: string;
  menuId: string;
  taste: number;
  quantity: number;
  variety: number;
  hygiene: number;
  service: number;
  comment?: string;
  createdAt: string;
}

// Respuesta de la API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Paginación
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Tickets
export type TicketStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'FOOD_QUALITY' | 'HYGIENE' | 'SERVICE' | 'INFRASTRUCTURE' | 'SCHEDULE' | 'OTHER';

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_REVIEW: 'En Revisión',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  FOOD_QUALITY: 'Calidad de Comida',
  HYGIENE: 'Higiene',
  SERVICE: 'Atención',
  INFRASTRUCTURE: 'Infraestructura',
  SCHEDULE: 'Horarios',
  OTHER: 'Otro',
};

export interface Ticket {
  id: string;
  userId: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  status: TicketStatus;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string; universityId: string };
  responses?: TicketResponse[];
  _count?: { responses: number };
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  createdAt: string;
  user?: { name: string; role: Role };
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  averageResolutionHours: number | null;
}

// Auth
export interface LoginCredentials {
  universityId: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

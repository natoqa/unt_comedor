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

// Auth
export interface LoginCredentials {
  universityId: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

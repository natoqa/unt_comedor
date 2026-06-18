import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface User {
  id: string;
  universityId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  universityId: string;
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface DashboardStats {
  activeStudents: number;
  totalMenus: number;
  ratingsToday: number;
  ratingsByShift: {
    BREAKFAST: number;
    LUNCH: number;
    DINNER: number;
  };
  positiveRatingsPercentage: number;
  complaints: number;
}

export const userService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const { data } = await api.get<ApiResponse<User[]>>(
      `/users?${searchParams.toString()}`
    );
    return data;
  },

  async create(userData: CreateUserData) {
    const { data } = await api.post<ApiResponse<User>>('/users', userData);
    return data.data!;
  },

  async update(id: string, userData: UpdateUserData) {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
    return data.data!;
  },

  async delete(id: string) {
    await api.delete(`/users/${id}`);
  },

  async getDashboardStats() {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/users/stats');
    return data.data!;
  },

  async exportExcel(filters?: { search?: string; role?: string }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await api.get(`/users/export?${params.toString()}`, { responseType: 'blob' });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

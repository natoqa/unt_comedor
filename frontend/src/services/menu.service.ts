import { api } from '@/lib/api';
import type { ApiResponse, MealShift, Menu, PaginatedResponse } from '@/types';

interface MenuFilters {
  page?: number;
  limit?: number;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  shift?: string;
  search?: string;
}

interface CreateMenuData {
  date: string;
  shift: string;
  startTime: string;
  endTime: string;
  description?: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  iron?: number;
  dishes: { name: string; category?: string }[];
}

export const menuService = {
  async getAll(filters: MenuFilters = {}): Promise<PaginatedResponse<Menu>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const { data } = await api.get<PaginatedResponse<Menu> & { success: boolean }>(
      `/menus?${params.toString()}`
    );
    return data;
  },

  async getById(id: string): Promise<Menu> {
    const { data } = await api.get<ApiResponse<Menu>>(`/menus/${id}`);
    return data.data!;
  },

  async getToday(): Promise<Menu[]> {
    const { data } = await api.get<ApiResponse<Menu[]>>('/menus/today');
    return data.data!;
  },

  async create(menuData: CreateMenuData): Promise<Menu> {
    const { data } = await api.post<ApiResponse<Menu>>('/menus', menuData);
    return data.data!;
  },

  async update(id: string, menuData: Partial<CreateMenuData>): Promise<Menu> {
    const { data } = await api.put<ApiResponse<Menu>>(`/menus/${id}`, menuData);
    return data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/menus/${id}`);
  },

  async uploadImages(
    menuId: string,
    images: Partial<Record<MealShift, File>>
  ): Promise<void> {
    const formData = new FormData();
    (['BREAKFAST', 'LUNCH', 'DINNER'] as MealShift[]).forEach((shift) => {
      if (images[shift]) formData.append(shift, images[shift]!);
    });
    await api.post(`/menus/${menuId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deleteImage(menuId: string, imageId: string): Promise<void> {
    await api.delete(`/menus/${menuId}/images/${imageId}`);
  },
};

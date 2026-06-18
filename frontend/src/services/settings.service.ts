import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface Settings {
  id: string;
  institutionName: string;
  systemName: string;
  breakfastStart: string;
  breakfastEnd: string;
  lunchStart: string;
  lunchEnd: string;
  dinnerStart: string;
  dinnerEnd: string;
  diningCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsData {
  institutionName?: string;
  systemName?: string;
  breakfastStart?: string;
  breakfastEnd?: string;
  lunchStart?: string;
  lunchEnd?: string;
  dinnerStart?: string;
  dinnerEnd?: string;
  diningCapacity?: number;
}

export const settingsService = {
  async get() {
    const { data } = await api.get<ApiResponse<Settings>>('/settings');
    return data.data!;
  },

  async update(settingsData: UpdateSettingsData) {
    const { data } = await api.put<ApiResponse<Settings>>('/settings', settingsData);
    return data.data!;
  },
};

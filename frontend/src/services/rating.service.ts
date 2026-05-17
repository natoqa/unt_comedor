import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

interface CreateRatingData {
  menuId: string;
  taste: number;
  quantity: number;
  variety: number;
  hygiene: number;
  service: number;
  comment?: string;
}

export interface RatingDimensions {
  taste: number | null;
  quantity: number | null;
  variety: number | null;
  hygiene: number | null;
  service: number | null;
}

export interface GlobalStats {
  totalRatings: number;
  overallAverage: number | null;
  dimensions: RatingDimensions;
  distribution: { stars: number; count: number }[];
  recentComments: {
    comment: string;
    taste: number;
    quantity: number;
    variety: number;
    hygiene: number;
    service: number;
    createdAt: string;
    menu: { date: string; shift: string };
  }[];
}

export interface ShiftStats {
  shift: string;
  totalRatings: number;
  overallAverage: number | null;
  dimensions: RatingDimensions;
}

export interface TrendPoint {
  date: string;
  taste: number | null;
  quantity: number | null;
  variety: number | null;
  hygiene: number | null;
  service: number | null;
  count: number;
}

export interface CheckRatingResult {
  hasRated: boolean;
  rating: {
    id: string;
    taste: number;
    quantity: number;
    variety: number;
    hygiene: number;
    service: number;
    comment?: string;
  } | null;
}

export const ratingService = {
  async create(data: CreateRatingData) {
    const { data: res } = await api.post<ApiResponse>('/ratings', data);
    return res.data;
  },

  async checkUserRating(menuId: string): Promise<CheckRatingResult> {
    const { data } = await api.get<ApiResponse<CheckRatingResult>>(
      `/ratings/check/${menuId}`
    );
    return data.data!;
  },

  async getGlobalStats(filters?: {
    dateFrom?: string;
    dateTo?: string;
    shift?: string;
  }): Promise<GlobalStats> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const { data } = await api.get<ApiResponse<GlobalStats>>(
      `/ratings/stats?${params.toString()}`
    );
    return data.data!;
  },

  async getStatsByShift(filters?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ShiftStats[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const { data } = await api.get<ApiResponse<ShiftStats[]>>(
      `/ratings/stats/shifts?${params.toString()}`
    );
    return data.data!;
  },

  async getTrends(period: 'week' | 'month' | 'quarter' = 'week'): Promise<TrendPoint[]> {
    const { data } = await api.get<ApiResponse<TrendPoint[]>>(
      `/ratings/stats/trends?period=${period}`
    );
    return data.data!;
  },

  async getMenuStats(menuId: string) {
    const { data } = await api.get<ApiResponse>(
      `/ratings/stats/menu/${menuId}`
    );
    return data.data;
  },

  async getMenuExtremes(days: number = 7) {
    const { data } = await api.get<ApiResponse>(
      `/ratings/stats/extremes?days=${days}`
    );
    return data.data;
  },

  async getShiftExtremes(days: number = 7) {
    const { data } = await api.get<ApiResponse>(
      `/ratings/stats/shifts/extremes?days=${days}`
    );
    return data.data;
  },

  async exportExcel(filters?: { dateFrom?: string; dateTo?: string; shift?: string }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await api.get(`/ratings/export?${params.toString()}`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `valoraciones_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

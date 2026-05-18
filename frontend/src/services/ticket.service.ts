import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Ticket, TicketResponse, TicketStats } from '@/types';

export const ticketService = {
  async create(data: { category: string; priority?: string; subject: string; description: string }) {
    const { data: res } = await api.post<ApiResponse<Ticket>>('/tickets', data);
    return res.data!;
  },

  async getMyTickets(filters?: { status?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') params.append(key, value.toString());
      });
    }
    const { data } = await api.get<PaginatedResponse<Ticket>>(`/tickets/my?${params.toString()}`);
    return data;
  },

  async getAll(filters?: { status?: string; priority?: string; category?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') params.append(key, value.toString());
      });
    }
    const { data } = await api.get<PaginatedResponse<Ticket>>(`/tickets?${params.toString()}`);
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return data.data!;
  },

  async updateStatus(id: string, status: string) {
    const { data } = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/status`, { status });
    return data.data!;
  },

  async addResponse(id: string, message: string) {
    const { data } = await api.post<ApiResponse<TicketResponse>>(`/tickets/${id}/responses`, { message });
    return data.data!;
  },

  async getStats() {
    const { data } = await api.get<ApiResponse<TicketStats>>('/tickets/stats');
    return data.data!;
  },

  async exportExcel(filters?: { status?: string; priority?: string; category?: string }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await api.get(`/tickets/export?${params.toString()}`, { responseType: 'blob' });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reclamos_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

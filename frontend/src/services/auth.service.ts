import { api } from '@/lib/api';
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  User,
} from '@/types';

interface RegisterData {
  universityId: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return data.data!;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      userData
    );
    return data.data!;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/profile');
    return data.data!;
  },
};

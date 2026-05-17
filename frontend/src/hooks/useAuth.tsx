'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '@/services';
import type { User, LoginCredentials } from '@/types';

// ── State ──

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false };
    default:
      return state;
  }
}

// ── Context ──

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: {
    universityId: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token al montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService
        .getProfile()
        .then((user) => {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user, token } = await authService.login(credentials);
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
  }, []);

  const register = useCallback(
    async (data: {
      universityId: string;
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      const { user, token } = await authService.register(data);
      localStorage.setItem('token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

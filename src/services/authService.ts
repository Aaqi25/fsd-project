import { User } from '../types';
import { defaultUser, mockUsers } from '../data/users';
import { api, ApiError } from './api';

const TOKEN_KEY = 'smarthome_token';
const USER_KEY = 'smarthome_user';

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  username: string;
  email: string;
  password?: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const hasBackend = !!import.meta.env.VITE_API_URL;

    if (hasBackend) {
      // Direct integration with real backend endpoint
      const res = await api.post<AuthResult>('/auth/login', credentials);
      if (res.data?.token) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        return res.data;
      }
      throw new Error(res.message || 'Authentication failed: No token received.');
    }

    // Client mock fallback when no backend is configured
    await new Promise((resolve) => setTimeout(resolve, 400)); // realistic latency

    const trimmedEmail = credentials.email.trim().toLowerCase();
    const matchedUser = mockUsers.find((u) => u.email.toLowerCase() === trimmedEmail) || {
      ...defaultUser,
      email: trimmedEmail,
      name: trimmedEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    };

    const mockToken = 'mock_jwt_' + Math.random().toString(36).substring(2);
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(matchedUser));

    return {
      user: matchedUser,
      token: mockToken,
    };
  },

  async register(credentials: RegisterCredentials): Promise<AuthResult> {
    const hasBackend = !!import.meta.env.VITE_API_URL;

    if (hasBackend) {
      // Direct integration with real backend registration endpoint
      const res = await api.post<AuthResult>('/auth/register', credentials);
      if (res.data?.token) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        return res.data;
      }
      throw new Error(res.message || 'Registration failed: No token received.');
    }

    // Client mock registration fallback when no backend is configured
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser: User = {
      _id: 'usr_' + Date.now().toString(36),
      name: credentials.name.trim(),
      username: credentials.username.trim(),
      email: credentials.email.trim().toLowerCase(),
      role: 'resident',
      createdAt: new Date().toISOString(),
    };

    const mockToken = 'mock_jwt_' + Math.random().toString(36).substring(2);
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    return {
      user: newUser,
      token: mockToken,
    };
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (stored && token) {
        return JSON.parse(stored);
      }
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  },
};

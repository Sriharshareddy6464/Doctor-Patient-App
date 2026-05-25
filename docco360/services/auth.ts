import { apiRequest, tokenStorage } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResult {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  requiresApproval?: boolean;
}

export const authService = {
  async register(
    name: string,
    email: string,
    password: string,
    role: 'PATIENT' | 'DOCTOR',
  ): Promise<AuthResult> {
    const data = await apiRequest<AuthResult>('/auth/register', {
      method: 'POST',
      body: { name, email, password, role },
      auth: false,
    });
    // Only store tokens when they are issued (i.e. patients).
    // Doctors get requiresApproval:true and no tokens.
    if (data.accessToken && data.refreshToken) {
      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
    }
    return data;
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const data = await apiRequest<AuthResult>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    // Login always returns tokens (pending/rejected doctors are blocked with 403
    // before this point), but we guard here to satisfy TypeScript.
    if (data.accessToken && data.refreshToken) {
      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors on logout
    }
    await tokenStorage.clearTokens();
  },

  async getMe(): Promise<User> {
    return apiRequest<User>('/auth/me');
  },
};

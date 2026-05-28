import { apiRequest, tokenStorage } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
  // Doctor-specific fields returned from /auth/me
  doctorProfile?: {
    approvalStatus:
      | 'PHASE1_PENDING'
      | 'PHASE1_APPROVED'
      | 'REJECTED'
      | 'PHASE2_PENDING'
      | 'PHASE2_APPROVED'
      | 'PHASE2_REJECTED';
    canTakeAppointments: boolean;
    phase2RejectionReason: string | null;
    rejectionReason?: string | null;
    specializations?: string[];
    experience?: number;
    consultationFee?: number;
    licenseNumber?: string;
    phone?: string;
  } | null;
  // Patient-specific fields returned from /auth/me
  patientProfile?: {
    id: string;
    phone: string | null;
  } | null;
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
    phone?: string,
    specialization?: string,
  ): Promise<AuthResult> {
    const data = await apiRequest<AuthResult>('/auth/register', {
      method: 'POST',
      body: { name, email, password, role, phone, specialization },
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

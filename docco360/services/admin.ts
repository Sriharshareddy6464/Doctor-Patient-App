import { apiRequest } from './api';
import type { Appointment } from './doctor';

export type DoctorApprovalStatus =
  | 'PHASE1_PENDING'
  | 'PHASE1_APPROVED'
  | 'REJECTED'
  | 'PHASE2_PENDING'
  | 'PHASE2_APPROVED'
  | 'PHASE2_REJECTED';

export interface AdminStats {
  totalDoctors: number;
  activeDoctors: number;
  pendingApprovals: number;
  phase1Pending: number;
  phase2Pending: number;
  totalPatients: number;
  totalAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
}

export interface AdminDoctor {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  doctorProfile: {
    approvalStatus: DoctorApprovalStatus;
    rejectionReason: string | null;
    phase2RejectionReason: string | null;
    specializations: string[];
    experience: number;
    consultationFee: number;
    qualifications: string[];
    licenseNumber: string | null;
    canTakeAppointments: boolean;
    phone: string | null;
  } | null;
  _count: {
    doctorAppointments: number;
  };
}

export interface AdminPatient {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  patientProfile: {
    phone: string | null;
    dateOfBirth: string | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    bloodGroup: string | null;
  } | null;
  _count: {
    patientAppointments: number;
  };
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return apiRequest<AdminStats>('/admin/stats');
  },

  async getDoctors(): Promise<AdminDoctor[]> {
    return apiRequest<AdminDoctor[]>('/admin/doctors');
  },

  // ── Phase 1 ──
  async approvePhase1(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/doctors/${id}/approve-phase1`, {
      method: 'PATCH',
    });
  },

  async rejectPhase1(id: string, reason?: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/doctors/${id}/reject-phase1`, {
      method: 'PATCH',
      body: { reason },
    });
  },

  // ── Phase 2 ──
  async approvePhase2(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/doctors/${id}/approve-phase2`, {
      method: 'PATCH',
    });
  },

  async rejectPhase2(id: string, reason?: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/doctors/${id}/reject-phase2`, {
      method: 'PATCH',
      body: { reason },
    });
  },

  // ── Phase 3 ──
  async toggleAppointments(id: string, canTake: boolean): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/doctors/${id}/toggle-appointments`, {
      method: 'PATCH',
      body: { canTake },
    });
  },

  // ── Account management ──
  async activateDoctor(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/doctors/${id}/activate`, {
      method: 'PATCH',
    });
  },

  async deactivateDoctor(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/doctors/${id}/deactivate`, {
      method: 'PATCH',
    });
  },

  async getPatients(): Promise<AdminPatient[]> {
    return apiRequest<AdminPatient[]>('/admin/patients');
  },

  async getAppointments(): Promise<Appointment[]> {
    return apiRequest<Appointment[]>('/admin/appointments');
  },

  async cancelAppointment(id: string): Promise<any> {
    return apiRequest(`/admin/appointments/${id}/cancel`, {
      method: 'PATCH',
    });
  },
};

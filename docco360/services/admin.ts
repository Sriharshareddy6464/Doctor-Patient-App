import { apiRequest } from './api';
import type { Appointment } from './doctor';

export type DoctorApprovalStatus =
  | 'NEEDS_DETAILS'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface AdminStats {
  totalDoctors: number;
  activeDoctors: number;
  pendingApprovals: number;
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

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '12m';

export interface RevenuePoint {
  date: string;
  amount: number;
}

export interface RegistrationPoint {
  date: string;
  doctors: number;
  patients: number;
}

export interface AppointmentPoint {
  date: string;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface TopDoctor {
  id: string;
  name: string;
  revenue: number;
  appointments: number;
  specializations: string[];
}

export interface SpecializationCount {
  specialization: string;
  count: number;
}

export interface AnalyticsData {
  revenueByDay: RevenuePoint[];
  registrationsByDay: RegistrationPoint[];
  appointmentsByDay: AppointmentPoint[];
  topDoctors: TopDoctor[];
  specializationDistribution: SpecializationCount[];
  completionRate: number;
  avgRevenuePerAppointment: number;
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

  // Doctor Verification Actions
  async approveDoctor(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/doctors/${id}/approve`, {
      method: 'PATCH',
    });
  },

  async rejectDoctor(id: string, reason?: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/doctors/${id}/reject`, {
      method: 'PATCH',
      body: { reason },
    });
  },

  async getAnalytics(period: AnalyticsPeriod = '30d'): Promise<AnalyticsData> {
    return apiRequest<AnalyticsData>('/admin/analytics', {
      params: { period },
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

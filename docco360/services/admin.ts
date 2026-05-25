import { apiRequest } from './api';
import type { Appointment } from './doctor';

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
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason: string | null;
    specializations: string[];
    experience: number;
    consultationFee: number;
    qualifications: string[];
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

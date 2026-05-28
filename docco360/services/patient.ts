import { apiRequest } from './api';
import type { Appointment, CallToken, TimeSlot } from './doctor';

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  bloodGroup: string | null;
  phone: string | null;
  address: string | null;
  emergencyContact: string | null;
  allergies: string[];
  medicalHistory: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientWithProfile {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  profile: PatientProfile | null;
}

export interface DoctorListing {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  profile: {
    specializations: string[];
    experience: number;
    qualifications: string[];
    bio: string | null;
    consultationFee: number;
    availableFrom: string | null;
    availableTo: string | null;
    approvalStatus: string;
  };
}

export interface DoctorSlots {
  doctor: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    doctorProfile: any;
  };
  slots: TimeSlot[];
}

export interface BookingResult {
  appointment: Appointment;
  payment: {
    status: string;
    transactionId: string;
    amount: number;
    currency: string;
    message: string;
  };
}

export const patientService = {
  async getProfile(): Promise<PatientWithProfile> {
    return apiRequest<PatientWithProfile>('/patient/profile');
  },

  async updateProfile(data: {
    dateOfBirth?: string | null;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    bloodGroup?: string | null;
    phone?: string | null;
    address?: string | null;
    emergencyContact?: string | null;
    allergies?: string[];
    medicalHistory?: string | null;
  }): Promise<PatientWithProfile> {
    return apiRequest<PatientWithProfile>('/patient/profile', {
      method: 'PUT',
      body: data,
    });
  },

  async getAllDoctors(): Promise<DoctorListing[]> {
    return apiRequest<DoctorListing[]>('/patient/all-doctors');
  },

  async getDoctorById(id: string): Promise<DoctorListing> {
    return apiRequest<DoctorListing>(`/patient/doctors/${id}`);
  },

  async getDoctorSlots(doctorId: string, date: string): Promise<DoctorSlots> {
    return apiRequest<DoctorSlots>(`/patient/doctors/${doctorId}/slots`, {
      params: { date },
    });
  },

  async bookAppointment(timeSlotId: string, notes?: string): Promise<BookingResult> {
    return apiRequest<BookingResult>('/patient/appointments', {
      method: 'POST',
      body: { timeSlotId, notes },
    });
  },

  async getAppointments(): Promise<Appointment[]> {
    return apiRequest<Appointment[]>('/patient/appointments');
  },

  async joinCall(appointmentId: string): Promise<CallToken> {
    return apiRequest<CallToken>(`/patient/appointments/${appointmentId}/join`);
  },

  async endCall(appointmentId: string): Promise<Appointment> {
    return apiRequest<Appointment>(`/patient/appointments/${appointmentId}/end`, {
      method: 'PATCH',
    });
  },
};

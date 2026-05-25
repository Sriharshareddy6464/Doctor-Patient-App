import { apiRequest } from './api';

export interface DoctorProfile {
  id: string;
  userId: string;
  specializations: string[];
  experience: number;
  qualifications: string[];
  bio: string | null;
  consultationFee: number | null;
  availableFrom: string | null;
  availableTo: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorWithProfile {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  profile: DoctorProfile | null;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  timeSlotId: string;
  patientId: string;
  doctorId: string;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  paymentId: string | null;
  amount: number;
  channelName: string;
  callStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  timeSlot: TimeSlot;
  patient: {
    id: string;
    name: string;
    email: string;
    patientProfile?: any;
  };
  doctor?: {
    id: string;
    name: string;
    email: string;
    doctorProfile?: any;
  };
}

export interface CallToken {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  role: string;
  expiresIn: number;
  appointment: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    patient?: { id: string; name: string };
    doctor?: { id: string; name: string };
  };
}

export const doctorService = {
  async getProfile(): Promise<DoctorWithProfile> {
    return apiRequest<DoctorWithProfile>('/doctor/profile');
  },

  async updateProfile(data: {
    specializations?: string[];
    experience?: number;
    qualifications?: string[];
    bio?: string | null;
    consultationFee?: number | null;
    availableFrom?: string | null;
    availableTo?: string | null;
  }): Promise<DoctorWithProfile> {
    return apiRequest<DoctorWithProfile>('/doctor/profile', {
      method: 'PUT',
      body: data,
    });
  },

  async createTimeSlots(date: string, startTime: string, endTime: string): Promise<TimeSlot[]> {
    return apiRequest<TimeSlot[]>('/doctor/time-slots', {
      method: 'POST',
      body: { date, startTime, endTime },
    });
  },

  async getAppointments(): Promise<Appointment[]> {
    return apiRequest<Appointment[]>('/doctor/appointments');
  },

  async joinCall(appointmentId: string): Promise<CallToken> {
    return apiRequest<CallToken>(`/doctor/appointments/${appointmentId}/join`);
  },

  async endCall(appointmentId: string): Promise<Appointment> {
    return apiRequest<Appointment>(`/doctor/appointments/${appointmentId}/end`, {
      method: 'PATCH',
    });
  },
};

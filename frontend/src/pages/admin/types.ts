// ─── Admin Dashboard Types ────────────────────────────────────────────────────

export type DoctorApprovalStatus =
  | 'NEEDS_DETAILS'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface Stats {
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

export interface DoctorRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  doctorProfile: {
    approvalStatus: DoctorApprovalStatus;
    rejectionReason?: string | null;
    specializations: string[];
    experience: number;
    consultationFee?: number | null;
    qualifications: string[];
    licenseNumber?: string | null;
    canTakeAppointments: boolean;
    phone?: string | null;
  } | null;
  _count: { doctorAppointments: number };
}

export interface PatientRow {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  patientProfile: {
    phone?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
    bloodGroup?: string | null;
  } | null;
  _count: { patientAppointments: number };
}

export interface AppointmentRow {
  id: string;
  status: string;
  callStatus: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
  timeSlot: { date: string; startTime: string; endTime: string };
  doctor: { name: string };
  patient: { name: string };
}

export type Tab = 'overview' | 'verification' | 'doctors' | 'patients' | 'appointments' | 'analytics';

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: PaginationMeta;
}

// ─── Search & Filter ──────────────────────────────────────────────────────────

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DoctorListParams extends ListParams {
  status?: DoctorApprovalStatus | '';
}

export interface AppointmentListParams extends ListParams {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

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

// ─── Status Config ────────────────────────────────────────────────────────────

export const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  NEEDS_DETAILS:   { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Needs Details' },
  PENDING:         { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: 'Pending Verification' },
  APPROVED:        { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Verified' },
  REJECTED:        { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Rejected' },
  CONFIRMED:       { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Confirmed' },
  COMPLETED:       { bg: 'bg-zinc-100 border-zinc-200', text: 'text-zinc-600', label: 'Completed' },
  CANCELLED:       { bg: 'bg-red-50 border-red-200', text: 'text-red-600', label: 'Cancelled' },
  IN_PROGRESS:     { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'In Progress' },
  NOT_STARTED:     { bg: 'bg-zinc-50 border-zinc-200', text: 'text-zinc-500', label: 'Not Started' },
  PAID:            { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600', label: 'Paid' },
};

export const getStatus = (doc: DoctorRow): DoctorApprovalStatus =>
  doc.doctorProfile?.approvalStatus ?? 'NEEDS_DETAILS';

export const doctorStatusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'NEEDS_DETAILS', label: 'Needs Details' },
  { value: 'PENDING', label: 'Pending Verification' },
  { value: 'APPROVED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const appointmentStatusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

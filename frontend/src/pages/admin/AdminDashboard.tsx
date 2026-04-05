import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import {
  Users, UserCheck, Clock, Activity, IndianRupee,
  CalendarDays, CheckCircle, XCircle, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, Ban, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
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

interface DoctorRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  doctorProfile: {
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string | null;
    specializations: string[];
    experience: number;
    consultationFee?: number | null;
    qualifications: string[];
  } | null;
  _count: { doctorAppointments: number };
}

interface PatientRow {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  patientProfile: { phone?: string | null; gender?: string | null } | null;
  _count: { patientAppointments: number };
}

interface AppointmentRow {
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

type Tab = 'overview' | 'approvals' | 'doctors' | 'patients' | 'appointments';

/** Doctors without a profile record are still PENDING */
const getApprovalStatus = (doc: DoctorRow): 'PENDING' | 'APPROVED' | 'REJECTED' =>
  doc.doctorProfile?.approvalStatus ?? 'PENDING';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusBadge: Record<string, string> = {
  PENDING:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED:  'bg-green-50 text-green-700 border-green-200',
  REJECTED:  'bg-red-50 text-red-700 border-red-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
  IN_PROGRESS: 'bg-orange-50 text-orange-700 border-orange-200',
};

const Badge = ({ label }: { label: string }) => (
  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBadge[label] ?? 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}>
    {label}
  </span>
);

// ─── Component ───────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ doctorId: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) setStats(res.data.data);
    } catch { /* handled via toast */ }
  }, []);

  const fetchDoctors = useCallback(async () => {
    const res = await api.get('/admin/doctors');
    if (res.data.success) setDoctors(res.data.data);
  }, []);

  const fetchPatients = useCallback(async () => {
    const res = await api.get('/admin/patients');
    if (res.data.success) setPatients(res.data.data);
  }, []);

  const fetchAppointments = useCallback(async () => {
    const res = await api.get('/admin/appointments');
    if (res.data.success) setAppointments(res.data.data);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    setIsLoading(true);
    const load = async () => {
      try {
        if (activeTab === 'overview') await fetchStats();
        if (activeTab === 'approvals' || activeTab === 'doctors') await fetchDoctors();
        if (activeTab === 'patients') await fetchPatients();
        if (activeTab === 'appointments') await fetchAppointments();
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        showToast('error', msg ?? 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeTab, fetchStats, fetchDoctors, fetchPatients, fetchAppointments]);

  const action = async (key: string, fn: () => Promise<void>) => {
    setActionLoading(key);
    try {
      await fn();
      showToast('success', 'Action completed successfully');
      // Refresh current tab data
      if (activeTab === 'approvals' || activeTab === 'doctors') await fetchDoctors();
      if (activeTab === 'patients') await fetchPatients();
      if (activeTab === 'appointments') await fetchAppointments();
      await fetchStats();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast('error', msg ?? 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (id: string) =>
    action(`approve-${id}`, async () => { await api.patch(`/admin/doctors/${id}/approve`); });

  const handleReject = async () => {
    if (!rejectModal) return;
    await action(`reject-${rejectModal.doctorId}`, async () => {
      await api.patch(`/admin/doctors/${rejectModal.doctorId}/reject`, { reason: rejectReason });
      setRejectModal(null);
      setRejectReason('');
    });
  };

  const handleToggleDoctor = (id: string, isActive: boolean) =>
    action(`toggle-doc-${id}`, async () => {
      await api.patch(`/admin/doctors/${id}/${isActive ? 'deactivate' : 'activate'}`);
    });



  const handleCancelAppointment = (id: string) =>
    action(`cancel-appt-${id}`, async () => { await api.patch(`/admin/appointments/${id}/cancel`); });

  const pendingDoctors = doctors.filter(d => getApprovalStatus(d) === 'PENDING');

  // ── Tabs ──────────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'approvals', label: 'Pending Approvals', badge: stats?.pendingApprovals },
    { id: 'doctors', label: 'Doctors' },
    { id: 'patients', label: 'Patients' },
    { id: 'appointments', label: 'Appointments' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans px-4 py-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-xl font-extrabold text-zinc-900">Reject Dr. {rejectModal.name}?</h3>
            <p className="text-zinc-500 text-sm">Provide a reason (optional). The doctor will see this message.</p>
            <textarea
              rows={3}
              className="w-full p-3 border border-zinc-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="e.g. Invalid credentials, incomplete documents..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setRejectModal(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                onClick={handleReject}
                disabled={actionLoading !== null}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Admin Portal</h1>
          <p className="text-zinc-500 mt-1 font-medium">Docco360 — Platform Control Center</p>
        </div>
        <div className="relative z-10 flex items-center gap-3 bg-primary/10 px-5 py-2.5 rounded-full border border-primary/20">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-bold text-primary">Superadmin</span>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Doctors', value: stats.activeDoctors, icon: <UserCheck size={20} />, color: 'text-green-600 bg-green-50' },
            { label: 'Pending Approvals', value: stats.pendingApprovals, icon: <Clock size={20} />, color: 'text-yellow-600 bg-yellow-50', alert: stats.pendingApprovals > 0 },
            { label: 'Total Patients', value: stats.totalPatients, icon: <Users size={20} />, color: 'text-blue-600 bg-blue-50' },
            { label: 'Revenue (INR)', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: <IndianRupee size={20} />, color: 'text-primary bg-orange-50' },
            { label: 'Confirmed Appts', value: stats.confirmedAppointments, icon: <CalendarDays size={20} />, color: 'text-blue-600 bg-blue-50' },
            { label: 'Completed Appts', value: stats.completedAppointments, icon: <CheckCircle size={20} />, color: 'text-green-600 bg-green-50' },
            { label: 'Cancelled Appts', value: stats.cancelledAppointments, icon: <XCircle size={20} />, color: 'text-red-600 bg-red-50' },
            { label: 'Total Appts', value: stats.totalAppointments, icon: <Activity size={20} />, color: 'text-zinc-600 bg-zinc-100' },
          ].map(card => (
            <div key={card.label} className={`bg-white rounded-2xl border p-5 shadow-sm flex items-center gap-4 ${card.alert ? 'border-yellow-300' : 'border-zinc-200'}`}>
              <div className={`p-3 rounded-xl ${card.color}`}>{card.icon}</div>
              <div>
                <p className="text-2xl font-extrabold text-zinc-900">{card.value}</p>
                <p className="text-xs font-semibold text-zinc-500 mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-x-auto">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-orange-50/50'
                  : 'text-zinc-500 hover:text-zinc-800 border-b-2 border-transparent hover:bg-zinc-50'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-yellow-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full min-w-5 text-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ── Overview ── */}
          {activeTab === 'overview' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-zinc-900 text-lg">Doctor Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-zinc-500">Total Registered</span><span>{stats.totalDoctors}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-zinc-500">Active &amp; Approved</span><span className="text-green-600">{stats.activeDoctors}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-zinc-500">Awaiting Approval</span>
                    <span className={stats.pendingApprovals > 0 ? 'text-yellow-600' : 'text-zinc-400'}>
                      {stats.pendingApprovals}
                    </span>
                  </div>
                </div>
                {stats.pendingApprovals > 0 && (
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl"
                    onClick={() => setActiveTab('approvals')}
                  >
                    Review Pending Approvals
                  </Button>
                )}
              </div>
              <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-zinc-900 text-lg">Appointment Overview</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Confirmed', value: stats.confirmedAppointments, color: 'text-blue-600' },
                    { label: 'Completed', value: stats.completedAppointments, color: 'text-green-600' },
                    { label: 'Cancelled', value: stats.cancelledAppointments, color: 'text-red-600' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm font-semibold">
                      <span className="text-zinc-500">{r.label}</span>
                      <span className={r.color}>{r.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-100 pt-3 flex justify-between text-sm font-extrabold">
                    <span className="text-zinc-700">Total Revenue</span>
                    <span className="text-primary">₹{stats.totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Pending Approvals ── */}
          {activeTab === 'approvals' && (
            <div className="space-y-3">
              {pendingDoctors.length === 0 ? (
                <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="font-bold text-zinc-600">No pending approvals</p>
                  <p className="text-zinc-400 text-sm mt-1">All doctor applications have been reviewed.</p>
                </div>
              ) : pendingDoctors.map(doc => (
                <div key={doc.id} className="bg-white rounded-3xl border border-yellow-200 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-extrabold text-zinc-900 text-lg">Dr. {doc.name}</p>
                        <Badge label="PENDING" />
                      </div>
                      <p className="text-zinc-500 text-sm">{doc.email}</p>
                      {doc.doctorProfile?.specializations?.length ? (
                        <p className="text-zinc-400 text-xs mt-1">{doc.doctorProfile.specializations.join(', ')}</p>
                      ) : (
                        <p className="text-zinc-300 text-xs mt-1 italic">Profile not yet completed</p>
                      )}
                      <p className="text-zinc-400 text-xs mt-1">
                        Registered: {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                        disabled={actionLoading === `approve-${doc.id}`}
                        onClick={() => handleApprove(doc.id)}
                      >
                        {actionLoading === `approve-${doc.id}` ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        &nbsp;Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 font-bold rounded-xl"
                        onClick={() => setRejectModal({ doctorId: doc.id, name: doc.name })}
                      >
                        <XCircle size={14} />&nbsp;Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── All Doctors ── */}
          {activeTab === 'doctors' && (
            <div className="space-y-3">
              {doctors.length === 0 ? (
                <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center">
                  <p className="text-zinc-500 font-semibold">No doctors registered yet.</p>
                </div>
              ) : doctors.map(doc => (
                <div key={doc.id} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-extrabold text-zinc-900">Dr. {doc.name}</p>
                        <Badge label={getApprovalStatus(doc)} />
                        {!doc.isActive && <Badge label="DEACTIVATED" />}
                      </div>
                      <p className="text-zinc-500 text-sm">{doc.email}</p>
                      <div className="flex flex-wrap gap-4 mt-1 text-xs text-zinc-400 font-semibold">
                        <span>{doc._count.doctorAppointments} appointments</span>
                        {doc.doctorProfile?.experience !== undefined && (
                          <span>{doc.doctorProfile.experience} yrs exp</span>
                        )}
                        {doc.doctorProfile?.consultationFee != null && (
                          <span>₹{doc.doctorProfile.consultationFee}/consultation</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getApprovalStatus(doc) === 'PENDING' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
                            disabled={!!actionLoading} onClick={() => handleApprove(doc.id)}>
                            <CheckCircle size={14} />&nbsp;Approve
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold"
                            onClick={() => setRejectModal({ doctorId: doc.id, name: doc.name })}>
                            <XCircle size={14} />&nbsp;Reject
                          </Button>
                        </>
                      )}
                      {getApprovalStatus(doc) === 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className={doc.isActive
                            ? 'border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold'
                            : 'border-green-300 text-green-600 hover:bg-green-50 rounded-xl font-bold'}
                          disabled={actionLoading === `toggle-doc-${doc.id}`}
                          onClick={() => handleToggleDoctor(doc.id, doc.isActive)}
                        >
                          {actionLoading === `toggle-doc-${doc.id}`
                            ? <RefreshCw size={14} className="animate-spin" />
                            : doc.isActive ? <><Ban size={14} />&nbsp;Deactivate</> : <><Play size={14} />&nbsp;Activate</>
                          }
                        </Button>
                      )}
                      <button onClick={() => setExpandedRow(expandedRow === doc.id ? null : doc.id)}
                        className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400">
                        {expandedRow === doc.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {expandedRow === doc.id && doc.doctorProfile && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-zinc-400 font-semibold">Specializations: </span>{doc.doctorProfile.specializations.join(', ') || '—'}</div>
                      <div><span className="text-zinc-400 font-semibold">Qualifications: </span>{doc.doctorProfile.qualifications.join(', ') || '—'}</div>
                      {doc.doctorProfile.rejectionReason && (
                        <div className="sm:col-span-2 text-red-600">
                          <span className="font-semibold">Rejection reason: </span>{doc.doctorProfile.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Patients ── */}
          {activeTab === 'patients' && (
            <div className="space-y-3">
              {patients.length === 0 ? (
                <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center">
                  <p className="text-zinc-500 font-semibold">No patients registered yet.</p>
                </div>
              ) : patients.map(pat => (
                <div key={pat.id} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-extrabold text-zinc-900">{pat.name}</p>
                    </div>
                    <p className="text-zinc-500 text-sm">{pat.email}</p>
                    <div className="flex gap-4 mt-1 text-xs text-zinc-400 font-semibold">
                      <span>{pat._count.patientAppointments} appointments</span>
                      {pat.patientProfile?.gender && <span>{pat.patientProfile.gender}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Appointments ── */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center">
                  <p className="text-zinc-500 font-semibold">No appointments yet.</p>
                </div>
              ) : appointments.map(appt => (
                <div key={appt.id} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-extrabold text-zinc-900">
                        Dr. {appt.doctor.name} → {appt.patient.name}
                      </p>
                      <Badge label={appt.status} />
                      <Badge label={appt.callStatus} />
                    </div>
                    <p className="text-zinc-500 text-sm font-semibold">
                      {appt.timeSlot.date} · {appt.timeSlot.startTime}–{appt.timeSlot.endTime}
                    </p>
                    <p className="text-zinc-400 text-xs mt-0.5">₹{appt.amount} · {appt.paymentStatus}</p>
                  </div>
                  {appt.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold shrink-0"
                      disabled={actionLoading === `cancel-appt-${appt.id}`}
                      onClick={() => handleCancelAppointment(appt.id)}
                    >
                      {actionLoading === `cancel-appt-${appt.id}`
                        ? <RefreshCw size={14} className="animate-spin" />
                        : <><AlertCircle size={14} />&nbsp;Cancel</>
                      }
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

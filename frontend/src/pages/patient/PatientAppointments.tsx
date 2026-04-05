import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { type Appointment } from '../../types/appointment';
import { CalendarDays, Clock, Video, ChevronLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const callStatusColors: Record<string, string> = {
  SCHEDULED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  IN_PROGRESS: 'bg-orange-50 text-orange-700 border-orange-200',
  COMPLETED: 'bg-zinc-50 text-zinc-500 border-zinc-200',
};

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/patient/appointments');
        if (res.data.success) {
          setAppointments(res.data.data || []);
        }
      } catch (err: unknown) {
        setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans px-4 py-8">
      <Link
        to="/patient-dashboard"
        className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-primary transition-colors bg-white hover:bg-orange-50 px-4 py-2 rounded-full border border-zinc-200"
      >
        <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
        <div className="flex items-center gap-4 mb-1">
          <div className="h-12 w-12 bg-orange-50 text-primary rounded-xl flex items-center justify-center">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">My Appointments</h1>
            <p className="text-zinc-500 font-medium">Track your consultations and join video calls</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 font-semibold border border-red-100">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center">
          <div className="h-16 w-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="text-zinc-600 font-bold text-lg">No appointments yet</p>
          <p className="text-zinc-400 text-sm mt-1 mb-6">Browse doctors to book your first consultation.</p>
          <Button
            asChild
            className="bg-primary hover:bg-orange-600 font-bold rounded-xl"
          >
            <Link to="/patient-dashboard/doctors">Find a Doctor</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(appt => (
            <div
              key={appt.id}
              className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary shrink-0">
                    <User size={22} />
                  </div>
                  <div>
                    <p className="font-extrabold text-zinc-900 text-lg">
                      Dr. {appt.doctor?.name}
                    </p>
                    {appt.doctor?.doctorProfile?.specializations?.length ? (
                      <p className="text-zinc-500 text-sm font-medium">
                        {appt.doctor.doctorProfile.specializations.join(', ')}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-zinc-500 font-semibold">
                        <CalendarDays size={12} /> {appt.timeSlot?.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500 font-semibold">
                        <Clock size={12} /> {appt.timeSlot?.startTime} – {appt.timeSlot?.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColors[appt.status]}`}>
                      {appt.status}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${callStatusColors[appt.callStatus]}`}>
                      {appt.callStatus}
                    </span>
                  </div>

                  {appt.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-orange-600 font-bold rounded-xl flex items-center gap-2"
                      onClick={() => navigate(`/patient-dashboard/call/${appt.id}`)}
                    >
                      <Video size={14} /> {appt.callStatus === 'IN_PROGRESS' ? 'Rejoin Call' : 'Join Call'}
                    </Button>
                  )}
                </div>
              </div>

              {appt.notes && (
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-zinc-600 text-sm">{appt.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;

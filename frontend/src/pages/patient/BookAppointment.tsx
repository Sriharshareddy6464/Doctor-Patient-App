import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { type TimeSlot, type Appointment } from '../../types/appointment';
import { ChevronLeft, Calendar, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DoctorBasic {
  id: string;
  name: string;
  email: string;
  doctorProfile?: {
    specializations: string[];
    consultationFee?: number | null;
  } | null;
}

type Step = 'select-slot' | 'confirm' | 'booked';

const BookAppointment = () => {
  const { id: doctorId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [doctor, setDoctor] = useState<DoctorBasic | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<Step>('select-slot');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<{ appointment: Appointment; payment: { amount: number; status: string; transactionId: string } } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setError('');
      setSelectedSlot(null);
      try {
        const res = await api.get(`/patient/doctors/${doctorId}/slots?date=${selectedDate}`);
        if (res.data.success && res.data.data) {
          setDoctor(res.data.data.doctor);
          setSlots(res.data.data.slots || []);
        }
      } catch (err: unknown) {
        setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load slots');
      } finally {
        setIsLoadingSlots(false);
      }
    };

    if (doctorId && selectedDate) {
      fetchSlots();
    }
  }, [doctorId, selectedDate]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    setError('');
    try {
      const res = await api.post('/patient/appointments', {
        timeSlotId: selectedSlot.id,
        notes: notes.trim() || undefined,
      });
      if (res.data.success) {
        setBookedAppointment(res.data.data);
        setStep('booked');
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Booking failed. Please try again.');
      setStep('select-slot');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans px-4 py-8">
      <Link
        to={`/patient-dashboard/doctor/${doctorId}`}
        className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-primary transition-colors bg-white hover:bg-orange-50 px-4 py-2 rounded-full border border-zinc-200"
      >
        <ChevronLeft size={16} className="mr-1" /> Back to Doctor
      </Link>

      {step === 'booked' ? (
        /* ── Confirmation Screen ── */
        <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 p-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-zinc-900">Appointment Confirmed!</h2>
            <p className="text-zinc-500 mt-2 font-medium">Your session has been booked successfully.</p>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 text-left space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-zinc-500">Doctor</span>
              <span className="text-zinc-800">Dr. {bookedAppointment?.appointment?.doctor?.name}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-zinc-500">Date</span>
              <span className="text-zinc-800">{bookedAppointment?.appointment?.timeSlot?.date}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-zinc-500">Time</span>
              <span className="text-zinc-800">
                {bookedAppointment?.appointment?.timeSlot?.startTime} – {bookedAppointment?.appointment?.timeSlot?.endTime}
              </span>
            </div>
            <div className="border-t border-zinc-200 pt-3 flex justify-between text-sm font-semibold">
              <span className="text-zinc-500">Payment</span>
              <span className="text-green-600">
                ₹{bookedAppointment?.payment?.amount} — {bookedAppointment?.payment?.status}
              </span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Transaction ID</span>
              <span>{bookedAppointment?.payment?.transactionId}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1 bg-primary hover:bg-orange-600 font-bold rounded-xl"
              onClick={() => navigate('/patient-dashboard/appointments')}
            >
              View My Appointments
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-zinc-200"
              onClick={() => navigate('/patient-dashboard/doctors')}
            >
              Browse More Doctors
            </Button>
          </div>
        </div>
      ) : step === 'confirm' && selectedSlot ? (
        /* ── Confirmation Step ── */
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 p-8">
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-1">Confirm Appointment</h2>
            <p className="text-zinc-500 font-medium mb-6">Review the details before confirming.</p>

            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-zinc-500">Doctor</span>
                  <span className="text-zinc-800">Dr. {doctor?.name}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-zinc-500">Date</span>
                  <span className="text-zinc-800">{selectedDate}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-zinc-500">Time</span>
                  <span className="text-zinc-800">{selectedSlot.startTime} – {selectedSlot.endTime}</span>
                </div>
                {doctor?.doctorProfile?.consultationFee != null && (
                  <div className="flex justify-between text-sm font-semibold border-t border-zinc-200 pt-3">
                    <span className="text-zinc-500">Consultation Fee</span>
                    <span className="text-zinc-800 font-bold">₹{doctor.doctorProfile.consultationFee}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-700 font-bold">Notes for Doctor (optional)</Label>
                <textarea
                  rows={3}
                  maxLength={500}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                  placeholder="Describe your symptoms or reason for visit..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <CreditCard size={14} />
                <span>Mock payment — no real charge will be made.</span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-zinc-200 font-bold"
              onClick={() => setStep('select-slot')}
              disabled={isBooking}
            >
              Change Slot
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-orange-600 font-bold rounded-xl"
              onClick={handleBook}
              disabled={isBooking}
            >
              {isBooking ? 'Processing...' : 'Confirm & Pay ₹' + (doctor?.doctorProfile?.consultationFee ?? 0)}
            </Button>
          </div>
        </div>
      ) : (
        /* ── Slot Selection Step ── */
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 p-8">
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-1">
              Book with {doctor ? `Dr. ${doctor.name}` : 'Doctor'}
            </h2>
            <p className="text-zinc-500 font-medium mb-6">Choose a date and available time slot.</p>

            <div className="space-y-2 mb-6">
              <Label className="text-zinc-700 font-bold flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Select Date
              </Label>
              <Input
                type="date"
                min={today}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="h-12 bg-zinc-50 border-zinc-200 focus-visible:ring-primary rounded-xl max-w-xs"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100 mb-4">
                {error}
              </div>
            )}

            <div>
              <Label className="text-zinc-700 font-bold flex items-center gap-2 mb-3">
                <Clock size={16} className="text-primary" /> Available Slots
              </Label>

              {isLoadingSlots ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                </div>
              ) : slots.length === 0 ? (
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-8 text-center">
                  <p className="text-zinc-500 font-semibold">No available slots for this date.</p>
                  <p className="text-zinc-400 text-sm mt-1">Try a different date or check back later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {slots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl text-sm font-bold border transition-all ${
                        selectedSlot?.id === slot.id
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-orange-600 font-bold rounded-xl h-12"
            disabled={!selectedSlot}
            onClick={() => setStep('confirm')}
          >
            {selectedSlot
              ? `Continue with ${selectedSlot.startTime} – ${selectedSlot.endTime}`
              : 'Select a Time Slot'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;

import { useState } from 'react';
import { api } from '../../services/api';
import { type TimeSlot } from '../../types/appointment';
import { CalendarClock, Clock, CheckCircle } from 'lucide-react';

const inputCls = 'h-10 bg-white border border-[#e1e1e1] rounded-sm px-3 text-sm text-black focus:outline-none focus:border-black transition-colors';
const labelCls = 'text-[11px] font-semibold text-[#555555] uppercase tracking-wider block mb-1.5';

const ManageSlots = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [isRange, setIsRange] = useState(false);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [generatedSlots, setGeneratedSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setGeneratedSlots([]);

    try {
      const payload: any = { date, startTime, endTime };
      if (isRange) {
        payload.endDate = endDate;
      }
      const res = await api.post('/doctor/time-slots', payload);
      if (res.data.success) {
        const slots: TimeSlot[] = Array.isArray(res.data.data) ? res.data.data : [];
        setGeneratedSlots(slots);
        const msgText = isRange
          ? `${slots.length} slots created across the date range (${date} to ${endDate}).`
          : `${slots.length} slot${slots.length !== 1 ? 's' : ''} created for ${date}.`;
        setMessage({
          type: 'success',
          text: msgText,
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create slots. Check your time range.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">


      {/* Page header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-6 h-6 flex items-center justify-center text-black">
            <CalendarClock size={18} />
          </div>
          <h2 className="text-2xl text-black font-semibold leading-tight tracking-tight">Manage Availability</h2>
        </div>
        <p className="text-sm text-[#555555] mt-1">
          Set a date and time range to auto-generate 30-minute appointment slots.
        </p>
      </div>

      {message && (
        <div className={`p-4 border rounded-sm text-sm font-medium flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-white border-[#e1e1e1] text-black'
            : 'bg-white border-black text-black'
        }`}>
          {message.type === 'success' && <CheckCircle size={14} />}
          {message.text}
        </div>
      )}

      {/* Form panel */}
      <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e1e1e1] bg-[#fafafa]">
          <h3 className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Generate Slots</h3>
        </div>
        <div className="p-4">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="isRange"
                checked={isRange}
                onChange={e => {
                  setIsRange(e.target.checked);
                  if (e.target.checked && endDate < date) {
                    setEndDate(date);
                  }
                }}
                className="h-4 w-4 border-[#e1e1e1] rounded-sm text-black focus:ring-black"
              />
              <label htmlFor="isRange" className="text-xs font-semibold text-[#555555] uppercase tracking-wider cursor-pointer">
                Generate for a Date Range
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div>
                <label className={labelCls}>{isRange ? 'Start Date' : 'Date'}</label>
                <input
                  type="date"
                  min={today}
                  required
                  value={date}
                  onChange={e => {
                    setDate(e.target.value);
                    if (isRange && endDate < e.target.value) {
                      setEndDate(e.target.value);
                    }
                  }}
                  className={`${inputCls} max-w-xs`}
                />
              </div>

              {isRange && (
                <div>
                  <label className={labelCls}>End Date</label>
                  <input
                    type="date"
                    min={date}
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className={`${inputCls} max-w-xs`}
                  />
                </div>
              )}
            </div>

            <div>
              <label className={`${labelCls} flex items-center gap-1`}>
                <Clock size={10} /> Time Range
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className={`${inputCls} max-w-[150px]`}
                />
                <span className="text-[#777777] font-mono text-sm">to</span>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className={`${inputCls} max-w-[150px]`}
                />
              </div>
              <p className="text-[11px] text-[#777777] font-mono mt-1.5">
                30-minute slots will be generated within this window.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-sm hover:bg-[#222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Slots'}
            </button>
          </form>
        </div>
      </div>

      {/* Generated slots */}
      {generatedSlots.length > 0 && (
        <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e1e1e1] bg-[#fafafa] flex justify-between items-center">
            <h3 className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">
              Generated Slots — {date}
            </h3>
            <span className="font-mono text-[11px] text-[#555555]">{generatedSlots.length} slots</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {generatedSlots.map(slot => (
                <div
                  key={slot.id}
                  className="p-2 border border-[#e1e1e1] rounded-sm text-[12px] font-mono text-black bg-[#fafafa] text-center hover:bg-[#efefef] transition-colors"
                >
                  {slot.startTime}
                  <span className="block text-[10px] text-[#777777]">–{slot.endTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSlots;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { type TimeSlot } from '../../types/appointment';
import { ChevronLeft, CalendarClock, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ManageSlots = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
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
      const res = await api.post('/doctor/time-slots', { date, startTime, endTime });
      if (res.data.success) {
        const slots: TimeSlot[] = Array.isArray(res.data.data) ? res.data.data : [];
        setGeneratedSlots(slots);
        setMessage({
          type: 'success',
          text: `${slots.length} slot${slots.length !== 1 ? 's' : ''} created for ${date}.`,
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
    <div className="max-w-3xl mx-auto space-y-6 font-sans px-4 py-8">
      <Link
        to="/doctor-dashboard"
        className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-primary transition-colors bg-white hover:bg-orange-50 px-4 py-2 rounded-full border border-zinc-200"
      >
        <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 flex items-center gap-4">
        <div className="p-4 bg-orange-50 text-primary rounded-2xl">
          <CalendarClock className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Manage Availability</h1>
          <p className="text-zinc-500 font-medium mt-1">
            Set a date and time range to auto-generate 30-minute slots.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <Card className="rounded-3xl border-zinc-200 shadow-sm">
        <CardContent className="p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-700 font-bold">Date</Label>
              <Input
                type="date"
                min={today}
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="h-12 bg-zinc-50 border-zinc-200 focus-visible:ring-primary rounded-xl max-w-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-700 font-bold flex items-center gap-2">
                <Clock size={16} className="text-primary" /> Time Range
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="h-12 bg-zinc-50 border-zinc-200 focus-visible:ring-primary rounded-xl flex-1 max-w-[160px]"
                />
                <span className="text-zinc-400 font-bold text-sm">TO</span>
                <Input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="h-12 bg-zinc-50 border-zinc-200 focus-visible:ring-primary rounded-xl flex-1 max-w-[160px]"
                />
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                30-minute slots will be generated within this window.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 h-12 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20"
            >
              {isLoading ? 'Generating...' : 'Generate Slots'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedSlots.length > 0 && (
        <Card className="rounded-3xl border-zinc-200 shadow-sm">
          <CardContent className="p-8">
            <h2 className="text-lg font-extrabold text-zinc-900 mb-4">
              Generated Slots — {date}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {generatedSlots.map(slot => (
                <div
                  key={slot.id}
                  className="p-3 rounded-xl text-sm font-bold border bg-orange-50 text-primary border-orange-100 text-center"
                >
                  {slot.startTime}
                  <span className="block text-xs text-zinc-400 font-medium">–{slot.endTime}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageSlots;

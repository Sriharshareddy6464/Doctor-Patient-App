import { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface DoctorProfileData {
  specializations: string[];
  experience: number;
  qualifications: string[];
  bio: string | null;
  consultationFee: number | null;
  availableFrom: string | null;
  availableTo: string | null;
}

const DoctorProfile = () => {
  const [formData, setFormData] = useState<DoctorProfileData>({
    specializations: [],
    experience: 0,
    qualifications: [],
    bio: '',
    consultationFee: 0,
    availableFrom: '',
    availableTo: ''
  });
  
  const [specializationsInput, setSpecializationsInput] = useState('');
  const [qualificationsInput, setQualificationsInput] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/doctor/profile');
      if (res.data.success && res.data.data.profile) {
        const profile = res.data.data.profile;
        setFormData({
          specializations: profile.specializations || [],
          experience: profile.experience || 0,
          qualifications: profile.qualifications || [],
          bio: profile.bio || '',
          consultationFee: profile.consultationFee || 0,
          availableFrom: profile.availableFrom || '',
          availableTo: profile.availableTo || ''
        });
        setSpecializationsInput((profile.specializations || []).join(', '));
        setQualificationsInput((profile.qualifications || []).join(', '));
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      specializations: specializationsInput.split(',').map(s => s.trim()).filter(Boolean),
      qualifications: qualificationsInput.split(',').map(s => s.trim()).filter(Boolean),
      experience: Number(formData.experience),
      consultationFee: formData.consultationFee ? Number(formData.consultationFee) : null,
      availableFrom: formData.availableFrom || null,
      availableTo: formData.availableTo || null,
      bio: formData.bio || null,
    };

    try {
      await api.put('/doctor/profile', payload);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update form data state with cleaned formats
      setSpecializationsInput(payload.specializations.join(', '));
      setQualificationsInput(payload.qualifications.join(', '));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile. Please verify your details.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Profile</h1>
        <p className="text-gray-600 mt-1">Manage your professional details, specialties and availability</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg shadow-sm border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Specializations (comma separated)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Cardiologist, General Physician"
              value={specializationsInput}
              onChange={e => setSpecializationsInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Qualifications (comma separated)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. MBBS, MD"
              value={qualificationsInput}
              onChange={e => setQualificationsInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Years of Experience</label>
            <input 
              type="number" 
              min="0"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.experience}
              onChange={e => setFormData({ ...formData, experience: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Consultation Fee ($)</label>
            <input 
              type="number" 
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.consultationFee || ''}
              onChange={e => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Availability From (HH:MM)</label>
            <input 
              type="time" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.availableFrom || ''}
              onChange={e => setFormData({ ...formData, availableFrom: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Availability To (HH:MM)</label>
            <input 
              type="time" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.availableTo || ''}
              onChange={e => setFormData({ ...formData, availableTo: e.target.value })}
            />
          </div>
          
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-sm font-semibold text-gray-700">Professional Bio</label>
          <textarea 
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Tell your patients about your practice..."
            value={formData.bio || ''}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-md shadow-blue-500/30"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;

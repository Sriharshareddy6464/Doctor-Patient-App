import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { User, Briefcase, Award, Clock, DollarSign, ChevronLeft } from 'lucide-react';

interface FullDoctorProfile {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  profile: {
    id: string;
    specializations: string[];
    experience: number;
    qualifications: string[];
    bio: string | null;
    consultationFee: number | null;
    availableFrom: string | null;
    availableTo: string | null;
  } | null;
}

const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<FullDoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const res = await api.get(`/patient/doctors/${id}`);
        if (res.data.success && res.data.data) {
          setData(res.data.data);
        } else {
          setError('Doctor profile not found');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch doctor details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchDoctorDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto text-center p-12 bg-white rounded-xl shadow-sm border border-red-100">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Profile Not Found</h2>
        <p className="text-gray-600 mb-6">{error || "We couldn't locate this doctor's profile."}</p>
        <Link to="/patient-dashboard/doctors" className="text-blue-600 font-medium hover:underline inline-flex items-center">
          <ChevronLeft size={16} className="mr-1" /> Back to Directory
        </Link>
      </div>
    );
  }

  const { user, profile } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/patient-dashboard/doctors" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-2">
        <ChevronLeft size={16} className="mr-1" /> Back to Doctors
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md">
               <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                 <User size={48} />
               </div>
            </div>
            {profile?.consultationFee != null && (
              <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-semibold flex items-center shadow-sm">
                <DollarSign size={16} className="mr-1" />
                {profile.consultationFee} / session
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900">Dr. {user.name}</h1>
          <p className="text-gray-500 mt-1">{user.email}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2 mb-3">
                  <Briefcase size={20} className="mr-2 text-blue-500" /> Professional Summary
                </h3>
                <p className="text-gray-700 leading-relaxed font-medium">
                  {profile?.experience || 0} Years of Clinical Experience
                </p>
                <p className="text-gray-600 mt-3 leading-relaxed">
                  {profile?.bio || 'This doctor has not provided a biographical summary yet.'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2 mb-3">
                  <Clock size={20} className="mr-2 text-blue-500" /> Availability
                </h3>
                {(profile?.availableFrom && profile?.availableTo) ? (
                  <div className="flex items-center text-gray-700 font-medium">
                     <span className="bg-gray-100 px-3 py-1 rounded border border-gray-200">{profile.availableFrom}</span>
                     <span className="mx-3 text-gray-400">to</span>
                     <span className="bg-gray-100 px-3 py-1 rounded border border-gray-200">{profile.availableTo}</span>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Schedule not configured</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2 mb-3">
                  <Award size={20} className="mr-2 text-blue-500" /> Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.specializations && profile.specializations.length > 0 ? (
                    profile.specializations.map((spec, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 font-medium px-3 py-1.5 rounded-lg border border-blue-100">
                        {spec}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">None listed</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2 mb-3">
                  <Award size={20} className="mr-2 text-blue-500" /> Qualifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.qualifications && profile.qualifications.length > 0 ? (
                    profile.qualifications.map((qual, idx) => (
                      <span key={idx} className="bg-gray-50 text-gray-800 font-medium px-3 py-1.5 rounded-lg border border-gray-200">
                        {qual}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">None listed</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;

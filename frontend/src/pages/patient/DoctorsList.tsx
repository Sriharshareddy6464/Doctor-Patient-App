import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { User, Briefcase, Award } from 'lucide-react';

interface DoctorItem {
  user: {
    id: string;
    name: string;
    email: string;
  };
  profile: {
    experience: number;
    specializations: string[];
  } | null;
}

const DoctorsList = () => {
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/patient/all-doctors');
        if (res.data.success) {
          setDoctors(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch doctors', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Doctors</h1>
          <p className="text-gray-600 mt-1">Find the right specialist for your healthcare needs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-medium">No doctors are currently available on the platform.</p>
          </div>
        ) : (
          doctors.map((doc) => (
            <div key={doc.user.id} className="glass-panel p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-white relative overflow-hidden">
              <div className="flex items-start space-x-4 mb-4">
                <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">Dr. {doc.user.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Briefcase size={14} className="mr-1" />
                    {doc.profile?.experience || 0} Years Experience
                  </div>
                </div>
              </div>
              
              <div className="mb-6 flex-1">
                <div className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Award size={16} className="mr-1 text-blue-500" />
                  Specializations:
                </div>
                <div className="flex flex-wrap gap-2">
                  {doc.profile?.specializations && doc.profile.specializations.length > 0 ? (
                    doc.profile.specializations.map((spec, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md border border-gray-200">
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">No specializations listed</span>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                <Link
                  to={`/patient-dashboard/doctor/${doc.user.id}`}
                  className="w-full flex justify-center items-center py-2.5 px-4 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors border border-blue-100 hover:border-blue-600"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorsList;

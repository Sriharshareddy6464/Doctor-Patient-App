import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <div className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-200">
          Patient Status: Active
        </div>
      </div>
      
      <div className="dashboard-grid">
        <Link to="/patient-dashboard/doctors" className="glass-panel p-6 rounded-xl min-h-[150px] shadow-sm flex flex-col justify-center text-center hover:bg-white/80 transition-colors cursor-pointer border-blue-200">
            <h3 className="font-semibold text-lg text-blue-700">Find a Doctor</h3>
            <p className="text-gray-500 mt-2">Browse the directory and view doctor profiles.</p>
        </Link>
        <div className="glass-panel p-6 rounded-xl min-h-[150px] shadow-sm flex flex-col justify-center text-center">
            <h3 className="font-semibold text-lg text-gray-900">Upcoming Appointments</h3>
            <p className="text-gray-500 mt-2">No appointments scheduled.</p>
        </div>
        <div className="glass-panel p-6 rounded-xl min-h-[150px] shadow-sm flex flex-col justify-center text-center">
            <h3 className="font-semibold text-lg text-gray-900">Medical Records</h3>
            <p className="text-gray-500 mt-2">View securely linked records.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

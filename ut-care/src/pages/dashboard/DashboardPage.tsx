import { useAuthStore } from '@/store/auth.store';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import PsychologistDashboard from './PsychologistDashboard';
import NurseDashboard from './NurseDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'psychologist':
      return <PsychologistDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    default:
      // For any other roles (including 'patient' if somehow set), deny access
      return (
        <div className="p-8 text-center text-red-600">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p>You do not have permission to view this page. Please contact your administrator.</p>
        </div>
      );
  }
}

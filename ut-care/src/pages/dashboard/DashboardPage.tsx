import { useAuthStore } from '@/store/auth.store';
import { Navigate } from 'react-router-dom';
import { ROLES } from '@/constants/roles';
import AdminDashboard from './AdminDashboard';
import PsychologistDashboard from './PsychologistDashboard';
import NurseDashboard from './NurseDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case ROLES.ADMIN:
      return <AdminDashboard />;
    case ROLES.COORDINADOR_PSICOLOGIA:
    case ROLES.PSICOLOGO:
      return <PsychologistDashboard />;
    case ROLES.COORDINADOR_ENFERMERIA:
    case ROLES.ENFERMERO:
      return <NurseDashboard />;
    default:
      return (
        <div className="p-8 text-center text-red-600">
          <h1 className="text-3xl font-bold mb-4">Acceso denegado</h1>
          <p>No tiene permiso para ver esta página. Contacte al administrador.</p>
        </div>
      );
  }
}

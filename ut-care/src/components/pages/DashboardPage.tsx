import { useAuthStore } from '../../store/authStore';
import { Button } from '../atoms/Button';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Sistema EHR - Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {user?.firstName} {user?.lastName}
              </span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Dashboard Principal
          </h2>
          <p className="text-gray-600">
            Esta es una página de dashboard de ejemplo. El login ha sido exitoso.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                Pacientes
              </h3>
              <p className="text-3xl font-bold text-primary-600">0</p>
            </div>
            <div className="bg-success-50 border border-success-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-success-900 mb-2">
                Citas Hoy
              </h3>
              <p className="text-3xl font-bold text-success-600">0</p>
            </div>
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-warning-900 mb-2">
                Pendientes
              </h3>
              <p className="text-3xl font-bold text-warning-600">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import {
  UserGroupIcon,
  CalendarIcon,
  UserIcon,
  BeakerIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { MetricCard } from '../../organisms/MetricCard';
import { Button } from '../../atoms/Button';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard - Administrador</h1>
        <p className="text-gray-500 mt-1">Bienvenido al Sistema de Registro de Salud Electrónico</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          icon={<UserGroupIcon className="h-6 w-6" />}
          label="Pacientes Registrados"
          value="1,234"
          change="+12 este mes"
          changeType="positive"
          iconBgColor="bg-primary-100"
          iconColor="text-primary-500"
        />
        
        <MetricCard
          icon={<CalendarIcon className="h-6 w-6" />}
          label="Citas Hoy"
          value="45"
          change="3 pendientes"
          changeType="neutral"
          iconBgColor="bg-success-100"
          iconColor="text-success-500"
        />
        
        <MetricCard
          icon={<UserIcon className="h-6 w-6" />}
          label="Usuarios del Sistema"
          value="28"
          change="3 en línea"
          changeType="positive"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-500"
        />
        
        <MetricCard
          icon={<BeakerIcon className="h-6 w-6" />}
          label="Medicamentos"
          value="156"
          change="23 por caducar"
          changeType="negative"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-500"
        />
        
        <MetricCard
          icon={<ArrowPathIcon className="h-6 w-6" />}
          label="Interconsultas"
          value="8"
          change="2 urgentes"
          changeType="negative"
          iconBgColor="bg-orange-100"
          iconColor="text-orange-500"
        />
        
        <MetricCard
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          label="Alertas"
          value="3"
          change="Requieren acción"
          changeType="negative"
          iconBgColor="bg-error-100"
          iconColor="text-error-500"
        />
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Estadísticas del Sistema</h2>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Últimos 7 días</option>
              <option>Últimos 30 días</option>
              <option>Últimos 3 meses</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-around gap-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => {
              const heights = [60, 80, 70, 90, 75, 55, 40];
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600"
                    style={{ height: `${heights[index]}%` }}
                  />
                  <span className="text-xs text-gray-500 font-medium">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <Button variant="primary" className="w-full justify-start">
              <PlusIcon className="h-5 w-5" />
              Crear Usuario
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <ChartBarIcon className="h-5 w-5" />
              Ver Reportes
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <CogIcon className="h-5 w-5" />
              Configuración
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <ShieldCheckIcon className="h-5 w-5" />
              Logs de Auditoría
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          {[
            { action: 'Usuario creado', detail: 'Dr. Juan Pérez - Psicólogo', time: 'Hace 15 min', type: 'success' },
            { action: 'Cita agendada', detail: 'Paciente: María López - 14:00', time: 'Hace 30 min', type: 'info' },
            { action: 'Paciente nuevo', detail: 'Carlos García - Matrícula: 2024001', time: 'Hace 1 hora', type: 'success' },
            { action: 'Backup realizado', detail: 'Base de datos respaldada exitosamente', time: 'Hace 2 horas', type: 'success' },
            { action: 'Alerta generada', detail: 'Medicamento próximo a caducar', time: 'Hace 3 horas', type: 'warning' },
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.type === 'success' ? 'bg-success-500' :
                activity.type === 'warning' ? 'bg-warning-500' :
                'bg-primary-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500 truncate">{activity.detail}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

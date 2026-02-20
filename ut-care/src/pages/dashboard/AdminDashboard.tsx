import { useQuery } from '@tanstack/react-query';
import { getTotalPatients } from '@/services/patient.service';
import { getAppointmentsTodayCount } from '@/services/appointment.service';
import { getPendingInterconsultationsCount } from '@/services/interconsultation.service';

const MetricCard = ({ title, value, isLoading, error }: { title: string; value: number | string; isLoading: boolean; error: boolean }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    {isLoading ? (
      <p className="text-3xl font-bold text-gray-500">Loading...</p>
    ) : error ? (
      <p className="text-red-500">Error</p>
    ) : (
      <p className="text-3xl font-bold">{value}</p>
    )}
  </div>
);

export default function AdminDashboard() {
  const { data: totalPatients, isLoading: loadingPatients, error: errorPatients } = useQuery({
    queryKey: ['totalPatients'],
    queryFn: getTotalPatients,
  });

  const { data: appointmentsToday, isLoading: loadingAppointments, error: errorAppointments } = useQuery({
    queryKey: ['appointmentsTodayCount'],
    queryFn: getAppointmentsTodayCount,
  });

  const { data: pendingInterconsultations, isLoading: loadingInterconsultations, error: errorInterconsultations } = useQuery({
    queryKey: ['pendingInterconsultationsCount'],
    queryFn: getPendingInterconsultationsCount,
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p>Welcome to the administrator dashboard. Here you can see a general overview of the system.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <MetricCard 
          title="Total Patients" 
          value={totalPatients?.total ?? 0} 
          isLoading={loadingPatients} 
          error={!!errorPatients} 
        />
        <MetricCard 
          title="Appointments Today" 
          value={appointmentsToday?.count ?? 0} 
          isLoading={loadingAppointments} 
          error={!!errorAppointments} 
        />
        <MetricCard 
          title="Pending Interconsultations" 
          value={pendingInterconsultations?.count ?? 0} 
          isLoading={loadingInterconsultations} 
          error={!!errorInterconsultations} 
        />
      </div>
      {/* TODO: Add more widgets and quick links based on admin needs */}
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { getNewPatientsTodayCount } from '@/services/patient.service';
import { getAppointmentsTodayCount, getPendingAppointmentConfirmationsCount } from '@/services/appointment.service';
import { getWaitingListCount } from '@/services/waiting-list.service';

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

export default function ReceptionistDashboard() {
  const { data: newPatientsToday, isLoading: loadingNewPatients, error: errorNewPatients } = useQuery({
    queryKey: ['newPatientsTodayCount'],
    queryFn: getNewPatientsTodayCount,
  });

  const { data: appointmentsToday, isLoading: loadingAppointments, error: errorAppointments } = useQuery({
    queryKey: ['appointmentsTodayCount'],
    queryFn: getAppointmentsTodayCount,
  });

  const { data: pendingConfirmations, isLoading: loadingConfirmations, error: errorConfirmations } = useQuery({
    queryKey: ['pendingAppointmentConfirmationsCount'],
    queryFn: getPendingAppointmentConfirmationsCount,
  });

  const { data: waitingListCount, isLoading: loadingWaitingList, error: errorWaitingList } = useQuery({
    queryKey: ['waitingListCount'],
    queryFn: getWaitingListCount,
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Receptionist Dashboard</h1>
      <p>Welcome to the receptionist dashboard. Here you can find an overview of daily patient and appointment management tasks.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <MetricCard 
          title="New Patients Today" 
          value={newPatientsToday?.count ?? 0} 
          isLoading={loadingNewPatients} 
          error={!!errorNewPatients} 
        />
        <MetricCard 
          title="Appointments Today" 
          value={appointmentsToday?.count ?? 0} 
          isLoading={loadingAppointments} 
          error={!!errorAppointments} 
        />
        <MetricCard 
          title="Pending Confirmations" 
          value={pendingConfirmations?.count ?? 0} 
          isLoading={loadingConfirmations} 
          error={!!errorConfirmations} 
        />
        <MetricCard 
          title="Waiting List" 
          value={waitingListCount?.count ?? 0} 
          isLoading={loadingWaitingList} 
          error={!!errorWaitingList} 
        />
      </div>
      {/* TODO: Add quick links to patient registration, appointment scheduling, etc. */}
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { getProfessionalAppointmentsToday } from '@/services/appointment.service';
import { getNursePendingMedicationAdministrationsCount } from '@/services/medication.service';
import { getNursePendingProceduresCount } from '@/services/nursing-procedure.service';
import { getPendingInterconsultationsForProfessionalCount } from '@/services/interconsultation.service';

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

export default function NurseDashboard() {
  const { user } = useAuthStore();
  const nurseId = user?.id;

  const { data: appointmentsToday, isLoading: loadingAppointments, error: errorAppointments } = useQuery({
    queryKey: ['nurseAppointmentsToday', nurseId],
    queryFn: () => getProfessionalAppointmentsToday(nurseId!),
    enabled: !!nurseId,
  });

  const { data: pendingMedicationAdministrations, isLoading: loadingMedications, error: errorMedications } = useQuery({
    queryKey: ['nursePendingMedicationAdministrations', nurseId],
    queryFn: () => getNursePendingMedicationAdministrationsCount(nurseId!),
    enabled: !!nurseId,
  });

  const { data: pendingProcedures, isLoading: loadingProcedures, error: errorProcedures } = useQuery({
    queryKey: ['nursePendingProcedures', nurseId],
    queryFn: () => getNursePendingProceduresCount(nurseId!),
    enabled: !!nurseId,
  });

  const { data: pendingInterconsultations, isLoading: loadingInterconsultations, error: errorInterconsultations } = useQuery({
    queryKey: ['pendingInterconsultationsForProfessionalCount', nurseId],
    queryFn: () => getPendingInterconsultationsForProfessionalCount(nurseId!),
    enabled: !!nurseId,
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Nurse Dashboard</h1>
      <p>Welcome to your personal nurse dashboard. Here you can find an overview of your daily tasks and responsibilities.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <MetricCard 
          title="Appointments Today" 
          value={appointmentsToday?.length ?? 0} 
          isLoading={loadingAppointments} 
          error={!!errorAppointments} 
        />
        <MetricCard 
          title="Pending Medication Administrations" 
          value={pendingMedicationAdministrations?.count ?? 0} 
          isLoading={loadingMedications} 
          error={!!errorMedications} 
        />
        <MetricCard 
          title="Pending Procedures" 
          value={pendingProcedures?.count ?? 0} 
          isLoading={loadingProcedures} 
          error={!!errorProcedures} 
        />
        <MetricCard 
          title="Pending Interconsultations" 
          value={pendingInterconsultations?.count ?? 0} 
          isLoading={loadingInterconsultations} 
          error={!!errorInterconsultations} 
        />
      </div>
      {/* TODO: Add quick links to patient records, procedure forms, etc. */}
    </div>
  );
}

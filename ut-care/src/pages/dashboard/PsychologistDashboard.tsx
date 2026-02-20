import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { getProfessionalAppointmentsToday } from '@/services/appointment.service';
import { getPsychologistPatientsCount } from '@/services/patient.service';
import { getTherapistPendingSessionsCount } from '@/services/therapy-session.service';
import { getAdministeredEvaluationsCount } from '@/services/psychometric-evaluation.service';
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

export default function PsychologistDashboard() {
  const { user } = useAuthStore();
  const psychologistId = user?.id;

  const { data: appointmentsToday, isLoading: loadingAppointments, error: errorAppointments } = useQuery({
    queryKey: ['psychologistAppointmentsToday', psychologistId],
    queryFn: () => getProfessionalAppointmentsToday(psychologistId!),
    enabled: !!psychologistId,
  });

  const { data: myPatientsCount, isLoading: loadingPatients, error: errorPatients } = useQuery({
    queryKey: ['psychologistPatientsCount', psychologistId],
    queryFn: () => getPsychologistPatientsCount(psychologistId!),
    enabled: !!psychologistId,
  });

  const { data: pendingSessionsCount, isLoading: loadingSessions, error: errorSessions } = useQuery({
    queryKey: ['therapistPendingSessionsCount', psychologistId],
    queryFn: () => getTherapistPendingSessionsCount(psychologistId!),
    enabled: !!psychologistId,
  });

  const { data: administeredEvaluationsCount, isLoading: loadingEvaluations, error: errorEvaluations } = useQuery({
    queryKey: ['administeredEvaluationsCount', psychologistId],
    queryFn: () => getAdministeredEvaluationsCount(psychologistId!),
    enabled: !!psychologistId,
  });

  const { data: pendingInterconsultations, isLoading: loadingInterconsultations, error: errorInterconsultations } = useQuery({
    queryKey: ['pendingInterconsultationsForProfessionalCount', psychologistId],
    queryFn: () => getPendingInterconsultationsForProfessionalCount(psychologistId!),
    enabled: !!psychologistId,
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Psychologist Dashboard</h1>
      <p>Welcome to your personal psychologist dashboard. Here you can find an overview of your daily tasks and patient load.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <MetricCard 
          title="Appointments Today" 
          value={appointmentsToday?.length ?? 0} 
          isLoading={loadingAppointments} 
          error={!!errorAppointments} 
        />
        <MetricCard 
          title="My Patients" 
          value={myPatientsCount?.count ?? 0} 
          isLoading={loadingPatients} 
          error={!!errorPatients} 
        />
        <MetricCard 
          title="Pending Sessions" 
          value={pendingSessionsCount?.count ?? 0} 
          isLoading={loadingSessions} 
          error={!!errorSessions} 
        />
        <MetricCard 
          title="Evaluations Administered" 
          value={administeredEvaluationsCount?.count ?? 0} 
          isLoading={loadingEvaluations} 
          error={!!errorEvaluations} 
        />
        <MetricCard 
          title="Pending Interconsultations" 
          value={pendingInterconsultations?.count ?? 0} 
          isLoading={loadingInterconsultations} 
          error={!!errorInterconsultations} 
        />
      </div>
      {/* TODO: Add quick links to patient records, session forms, etc. */}
    </div>
  );
}

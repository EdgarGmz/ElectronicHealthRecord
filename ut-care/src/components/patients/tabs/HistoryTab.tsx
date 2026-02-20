import { useQueries } from '@tanstack/react-query';
import { Patient } from '@/types/patient';
import { HistoryEvent } from '@/types/history';
import { getAppointmentsByPatientId } from '@/services/appointment.service';
import { getTherapySessionsByRecordId } from '@/services/therapy-session.service';
import { getPrescriptionsByPatientId } from '@/services/medication.service';
import { getPsychometricEvaluationsByRecordId } from '@/services/psychometric-evaluation.service';
import { getPsychologyRecordByMedicalRecordId } from '@/services/diagnosis.service';
import { Appointment } from '@/types/appointment';
import { TherapySession } from '@/types/therapy-session';
import { Prescription } from '@/types/medication';
import { PsychometricEvaluation } from '@/types/psychometric-evaluation';
import { PsychologyRecordDetails } from '@/types/diagnosis';

export default function HistoryTab({ patient }: { patient: Patient }) {
  const psychologyRecordId = patient.medicalRecord?.psychologyRecord?.id;
  const medicalRecordId = patient.medicalRecord?.id;

  const queries = useQueries({
    queries: [
      {
        queryKey: ['appointments', patient.id],
        queryFn: () => getAppointmentsByPatientId(patient.id),
      },
      {
        queryKey: ['therapySessions', psychologyRecordId],
        queryFn: () => getTherapySessionsByRecordId(psychologyRecordId!),
        enabled: !!psychologyRecordId,
      },
      {
        queryKey: ['prescriptions', patient.id],
        queryFn: () => getPrescriptionsByPatientId(patient.id),
      },
      {
        queryKey: ['psychometricEvaluations', psychologyRecordId],
        queryFn: () => getPsychometricEvaluationsByRecordId(psychologyRecordId!),
        enabled: !!psychologyRecordId,
      },
      {
        queryKey: ['psychologyRecord', medicalRecordId],
        queryFn: () => getPsychologyRecordByMedicalRecordId(medicalRecordId!),
        enabled: !!medicalRecordId,
      },
    ],
  });

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);

  if (isLoading) return <p>Loading history...</p>;
  if (isError) return <p className="text-red-500">Error loading history.</p>;

  const [appointments, therapySessions, prescriptions, psychometricEvaluations, psychologyRecord] = queries.map((query) => query.data);

  const historyEvents: HistoryEvent[] = [];

  // Transform Appointments
  (appointments as Appointment[])?.forEach((apt) => {
    historyEvents.push({
      id: apt.id,
      date: apt.scheduledDate,
      type: 'Appointment',
      title: `${apt.appointmentType} with Dr. ${apt.professional.firstName} ${apt.professional.lastName}`,
      description: `Status: ${apt.status}. Department: ${apt.department}`,
      details: apt,
    });
  });

  // Transform Therapy Sessions
  (therapySessions as TherapySession[])?.forEach((session) => {
    historyEvents.push({
      id: session.id,
      date: session.sessionDate,
      type: 'Therapy Session',
      title: `Therapy Session #${session.sessionNumber}`,
      description: session.evolutionNotes,
      details: session,
    });
  });

  // Transform Prescriptions
  (prescriptions as Prescription[])?.forEach((prescription) => {
    historyEvents.push({
      id: prescription.id,
      date: prescription.startDate,
      type: 'Medication Prescription',
      title: `Prescription for ${prescription.medication.name}`,
      description: `Dosage: ${prescription.dosage}, Frequency: ${prescription.frequency}`,
      details: prescription,
    });
  });

  // Transform Psychometric Evaluations
  (psychometricEvaluations as PsychometricEvaluation[])?.forEach((evaluation) => {
    historyEvents.push({
      id: evaluation.id,
      date: evaluation.applicationDate,
      type: 'Psychometric Evaluation',
      title: `Psychometric Evaluation: ${evaluation.evaluationType}`,
      description: evaluation.interpretation,
      details: evaluation,
    });
  });

  // Transform Diagnosis Update (from psychology record if available)
  if (psychologyRecord && (psychologyRecord.currentDiagnosisDsm5 || psychologyRecord.currentDiagnosisCie10)) {
    historyEvents.push({
      id: psychologyRecord.id + '-diagnosis', // Unique ID for diagnosis event
      date: psychologyRecord.updatedAt, // Assuming updatedAt reflects latest diagnosis update
      type: 'Diagnosis Update',
      title: 'Diagnosis Updated',
      description: `DSM-5: ${psychologyRecord.currentDiagnosisDsm5 || 'N/A'}, CIE-10/11: ${psychologyRecord.currentDiagnosisCie10 || 'N/A'}`,
      details: psychologyRecord,
    });
  }


  // Sort all events chronologically
  historyEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Full Chronological History</h3>
      {historyEvents.length === 0 && <p className="text-gray-500">No history events found for this patient.</p>}

      <div className="relative border-l-2 border-gray-200 ml-2">
        {historyEvents.map((event, index) => (
          <div key={event.id} className="mb-8 flex items-start">
            <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary -ml-2 mt-1"></div>
            <div className="ml-8">
              <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()} - {new Date(event.date).toLocaleTimeString()}</p>
              <h4 className="font-bold text-gray-800">{event.title} <span className="text-xs text-gray-600">({event.type})</span></h4>
              {event.description && <p className="text-sm text-gray-700 mt-1">{event.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { getAppointmentsByPatientId } from '@/services/appointment.service';
import type { Patient } from '@/types/patient';
import type { Appointment } from '@/types/appointment';
import { Plus, Calendar, User, Clock } from 'lucide-react';
import { useState } from 'react';
import AppointmentDetailModal from '@/components/patients/details/AppointmentDetailModal';
import Modal from '@/components/organisms/Modal'; // Assuming Modal is available for other uses

const AppointmentItem = ({ appointment, onClick }: { appointment: Appointment, onClick: (a: Appointment) => void }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="p-4 bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={() => onClick(appointment)}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-gray-800">{appointment.appointmentType}</h4>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-600 space-y-1">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date(appointment.scheduledDate).toLocaleString()}</span>
        </div>
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2" />
          <span>Dr. {appointment.professional.firstName} {appointment.professional.lastName} ({appointment.department})</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span>{appointment.durationMinutes} minutes</span>
        </div>
      </div>
      {appointment.notes && <p className="mt-2 text-xs italic text-gray-500">Notes: {appointment.notes}</p>}
    </div>
  );
};

export default function AppointmentsTab({ patient }: { patient: Patient }) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments', patient.id],
    queryFn: () => getAppointmentsByPatientId(patient.id),
  });

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Appointments</h3>
        <button className="flex items-center px-3 py-1 text-sm text-white rounded-md bg-primary hover:bg-primary-dark">
          <Plus className="w-4 h-4 mr-1" />
          New Appointment
        </button>
      </div>

      {isLoading && <p>Loading appointments...</p>}
      {error && <p className="text-red-500">Could not load appointments.</p>}

      {appointments && appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map(appointment => (
            <AppointmentItem key={appointment.id} appointment={appointment} onClick={handleAppointmentClick} />
          ))}
        </div>
      ) : (
        appointments && <p className="text-gray-500">No appointments found for this patient.</p>
      )}

      {selectedAppointment && (
        <AppointmentDetailModal 
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
}

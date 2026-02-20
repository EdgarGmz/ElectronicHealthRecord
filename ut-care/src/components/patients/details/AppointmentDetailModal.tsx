import { Appointment } from "@/types/appointment";
import Modal from "@/components/organisms/Modal";
import { Calendar, User, Clock, Info, XCircle } from "lucide-react";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
}

export default function AppointmentDetailModal({ isOpen, onClose, appointment }: AppointmentDetailModalProps) {
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'No Show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Appointment Details">
      <div className="space-y-4 p-2">
        <div className="flex justify-between items-center pb-2 border-b">
          <h3 className="text-xl font-bold">{appointment.appointmentType}</h3>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColorClass(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={Calendar} label="Scheduled For" value={new Date(appointment.scheduledDate).toLocaleString()} />
          <DetailItem icon={Clock} label="Duration" value={`${appointment.durationMinutes} minutes`} />
          <DetailItem icon={User} label="Professional" value={`Dr. ${appointment.professional.firstName} ${appointment.professional.lastName} (${appointment.department})`} />
          <DetailItem icon={Info} label="Patient" value={`${appointment.patient.user.firstName} ${appointment.patient.user.lastName} (ID: ${appointment.patient.userId})`} />
        </div>

        {appointment.notes && (
          <div>
            <p className="font-semibold text-gray-700 mt-4">Notes:</p>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{appointment.notes}</p>
          </div>
        )}

        {appointment.status === 'Cancelled' && appointment.cancellationReason && (
          <div className="flex items-center text-red-700 bg-red-50 p-3 rounded-md">
            <XCircle className="w-5 h-5 mr-2" />
            <p><strong>Cancellation Reason:</strong> {appointment.cancellationReason}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string; value: string }) => (
  <div className="flex items-start">
    <Icon className="w-5 h-5 mr-3 text-gray-500" />
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-gray-800">{value}</p>
    </div>
  </div>
);

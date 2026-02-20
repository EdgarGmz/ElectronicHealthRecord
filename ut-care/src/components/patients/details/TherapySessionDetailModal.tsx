import { TherapySession } from "@/types/therapy-session";
import Modal from "@/components/organisms/Modal";
import { Calendar, User, BookOpen, Clock, Smile } from "lucide-react";

interface TherapySessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TherapySession;
}

export default function TherapySessionDetailModal({ isOpen, onClose, session }: TherapySessionDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Therapy Session #${session.sessionNumber} Details`}>
      <div className="space-y-4 p-2">
        <div className="flex justify-between items-center pb-2 border-b">
          <h3 className="text-xl font-bold">Session Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={Calendar} label="Session Date" value={new Date(session.sessionDate).toLocaleString()} />
          <DetailItem icon={Clock} label="Duration" value={`${session.sessionDuration} minutes`} />
          <DetailItem icon={User} label="Therapist" value={`${session.therapist.firstName} ${session.therapist.lastName}`} />
          <DetailItem icon={Smile} label="Mood" value={session.mood} />
        </div>

        {session.evolutionNotes && (
          <div>
            <p className="font-semibold text-gray-700 mt-4">Evolution Notes:</p>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{session.evolutionNotes}</p>
          </div>
        )}

        {session.patientProgress && (
          <div>
            <p className="font-semibold text-gray-700 mt-4">Patient Progress:</p>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{session.patientProgress}</p>
          </div>
        )}
        
        {session.assignedTasks && (
          <div>
            <p className="font-semibold text-gray-700 mt-4">Assigned Tasks:</p>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{session.assignedTasks}</p>
          </div>
        )}

        {session.observations && (
          <div>
            <p className="font-semibold text-gray-700 mt-4">Observations:</p>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{session.observations}</p>
          </div>
        )}

        {session.nextSessionPlan && (
          <div>
            <p className="font-semibold text-gray-700 mt-4">Next Session Plan:</p>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{session.nextSessionPlan}</p>
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

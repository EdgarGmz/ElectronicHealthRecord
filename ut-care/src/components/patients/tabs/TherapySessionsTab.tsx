import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTherapySessionsByRecordId, createTherapySession, updateTherapySession } from '@/services/therapy-session.service';
import type { Patient } from '@/types/patient';
import type { PsychometricEvaluation } from '@/types/psychometric-evaluation';
import { Plus, Edit } from 'lucide-react';
import type { TherapySession } from '@/types/therapy-session';
import { useState } from 'react';
import Modal from '@/components/organisms/Modal';
import NewSessionForm from '@/components/patients/forms/NewSessionForm';
import EditTherapySessionForm from '@/components/patients/forms/EditTherapySessionForm';
import type { UpdateTherapySessionInput } from '@/types/therapy-session.update.schema';
import { useAuthStore } from '@/store/auth.store';
import TherapySessionDetailModal from '@/components/patients/details/TherapySessionDetailModal';


const SessionItem = ({ session, onClick, onEditClick }: { session: TherapySession, onClick: (s: TherapySession) => void, onEditClick: (s: TherapySession) => void }) => (
  <div 
    className="p-4 bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200"
  >
    <div className="flex items-center justify-between mb-2" onClick={() => onClick(session)}>
      <h4 className="font-bold">Session #{session.sessionNumber}</h4>
      <span className="text-sm text-gray-500">{new Date(session.sessionDate).toLocaleDateString()}</span>
    </div>
    <p className="text-sm text-gray-700">{session.evolutionNotes?.substring(0, 100) || 'No notes for this session.'}{session.evolutionNotes && session.evolutionNotes.length > 100 ? '...' : ''}</p>
    <div className="flex justify-end mt-2">
        <button 
            onClick={(e) => { e.stopPropagation(); onEditClick(session); }}
            className="flex items-center px-2 py-1 text-xs text-white rounded-md bg-secondary hover:bg-secondary-dark"
        >
            <Edit className="w-3 h-3 mr-1" /> Edit
        </button>
    </div>
  </div>
);

export default function TherapySessionsTab({ patient }: { patient: Patient }) {
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const psychologyRecordId = patient.medicalRecord?.psychologyRecord?.id;

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['therapySessions', psychologyRecordId],
    queryFn: () => getTherapySessionsByRecordId(psychologyRecordId!),
    enabled: !!psychologyRecordId,
  });

  const createSessionMutation = useMutation({
    mutationFn: createTherapySession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapySessions', psychologyRecordId] });
      setIsNewSessionModalOpen(false);
    },
    onError: (err) => {
      console.error("Error creating session:", err);
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: UpdateTherapySessionInput }) => updateTherapySession(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapySessions', psychologyRecordId] });
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      console.error("Error updating session:", err);
    }
  });


  const handleCreateSession = (formData: any) => {
    if (!psychologyRecordId || !user) return;
    createSessionMutation.mutate({
      ...formData,
      psychologyRecordId,
      therapistId: user.id,
    });
  };

  const handleUpdateSession = (formData: UpdateTherapySessionInput) => {
    if (!selectedSession) return;
    updateSessionMutation.mutate({
      sessionId: selectedSession.id,
      data: formData,
    });
  };

  const handleSessionClick = (session: TherapySession) => {
    setSelectedSession(session);
    setIsDetailModalOpen(true);
  };

  const handleEditSessionClick = (session: TherapySession) => {
    setSelectedSession(session);
    setIsEditModalOpen(true);
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Therapy Sessions</h3>
        <button 
          onClick={() => setIsNewSessionModalOpen(true)}
          disabled={!psychologyRecordId}
          className="flex items-center px-3 py-1 text-sm text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Session
        </button>
      </div>

      {isLoading && <p>Loading sessions...</p>}
      {error && <p className="text-red-500">Could not load sessions.</p>}
      {!psychologyRecordId && <p className="text-gray-500">This patient does not have a psychology record yet.</p>}

      {sessions && sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map(session => (
            <SessionItem 
                key={session.id} 
                session={session} 
                onClick={handleSessionClick} 
                onEditClick={handleEditSessionClick}
            />
          ))}
        </div>
      ) : (
        sessions && <p className="text-gray-500">No therapy sessions recorded yet.</p>
      )}

      <Modal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        title={`New Therapy Session for ${patient.user.firstName}`}
      >
        <NewSessionForm
          onSubmit={handleCreateSession}
          onCancel={() => setIsNewSessionModalOpen(false)}
          isLoading={createSessionMutation.isPending}
        />
      </Modal>

      {selectedSession && (
        <TherapySessionDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          session={selectedSession}
        />
      )}

      {selectedSession && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Session #${selectedSession.sessionNumber} for ${patient.user.firstName}`}
        >
          <EditTherapySessionForm
            session={selectedSession}
            onSubmit={handleUpdateSession}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={updateSessionMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}

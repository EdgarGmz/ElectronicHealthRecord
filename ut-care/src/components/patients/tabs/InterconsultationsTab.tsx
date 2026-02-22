import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInterconsultationsByPatientId, createInterconsultation, updateInterconsultation } from '@/services/interconsultation.service';
import type { Patient } from '@/types/patient';
import type { Interconsultation } from '@/types/interconsultation';
import { Plus, MessageSquare, Edit } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/organisms/Modal';
import NewInterconsultationForm from '@/components/patients/forms/NewInterconsultationForm';
import EditInterconsultationForm from '@/components/patients/forms/EditInterconsultationForm';
import type { CreateInterconsultationInput } from '@/types/interconsultation';
import type { UpdateInterconsultationInput } from '@/types/interconsultation.update.schema';
import { useAuthStore } from '@/store/auth.store';

const InterconsultationItem = ({ interconsultation, onEditClick }: { interconsultation: Interconsultation, onEditClick: (i: Interconsultation) => void }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-800">
          From {interconsultation.fromDepartment} to {interconsultation.toDepartment}
        </h4>
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(interconsultation.status)}`}>
            {interconsultation.status}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onEditClick(interconsultation); }}
            className="ml-3 p-1 rounded-md hover:bg-gray-100 text-secondary hover:text-secondary-dark"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-700">Reason: {interconsultation.reason}</p>
      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
        <span>Requested by: {interconsultation.fromProfessional.firstName} {interconsultation.fromProfessional.lastName}</span>
        <span className={getUrgencyColor(interconsultation.urgency)}>Urgency: {interconsultation.urgency}</span>
      </div>
      {interconsultation.response && (
        <div className="mt-2 text-xs text-gray-800 p-2 bg-gray-100 rounded-md">
          <strong>Response:</strong> {interconsultation.response}
          {interconsultation.respondedByUser && ` (by ${interconsultation.respondedByUser.firstName} ${interconsultation.respondedByUser.lastName})`}
        </div>
      )}
    </div>
  );
};

export default function InterconsultationsTab({ patient }: { patient: Patient }) {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInterconsultation, setSelectedInterconsultation] = useState<Interconsultation | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: interconsultations, isLoading, error } = useQuery({
    queryKey: ['interconsultations', patient.id],
    queryFn: () => getInterconsultationsByPatientId(patient.id),
  });

  const createInterconsultationMutation = useMutation({
    mutationFn: createInterconsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interconsultations', patient.id] });
      setIsNewModalOpen(false);
    },
    onError: (err) => {
      console.error("Error creating interconsultation:", err);
    }
  });

  const updateInterconsultationMutation = useMutation({
    mutationFn: ({ interconsultationId, data }: { interconsultationId: string; data: UpdateInterconsultationInput }) => updateInterconsultation(interconsultationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interconsultations', patient.id] });
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      console.error("Error updating interconsultation:", err);
    }
  });

  const handleCreateInterconsultation = (formData: Omit<CreateInterconsultationInput, 'patientId' | 'fromProfessionalId'>) => {
    if (!user) return; // Should not happen if route is protected
    createInterconsultationMutation.mutate({
      ...formData,
      patientId: patient.id,
      fromProfessionalId: user.id, // The logged-in user is the one initiating
    });
  };

  const handleUpdateInterconsultation = (formData: UpdateInterconsultationInput) => {
    if (!selectedInterconsultation) return;
    updateInterconsultationMutation.mutate({
      interconsultationId: selectedInterconsultation.id,
      data: formData,
    });
  };

  const handleEditInterconsultationClick = (interconsultation: Interconsultation) => {
    setSelectedInterconsultation(interconsultation);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Interconsultations</h3>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center px-3 py-1 text-sm text-white rounded-md bg-primary hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Interconsultation
        </button>
      </div>

      {isLoading && <p>Loading interconsultations...</p>}
      {error && <p className="text-red-500">Could not load interconsultations.</p>}

      {interconsultations && interconsultations.length > 0 ? (
        <div className="space-y-3">
          {interconsultations.map(interconsultation => (
            <InterconsultationItem 
                key={interconsultation.id} 
                interconsultation={interconsultation} 
                onEditClick={handleEditInterconsultationClick} 
            />
          ))}
        </div>
      ) : (
        interconsultations && <p className="text-gray-500">No interconsultations found for this patient.</p>
      )}

      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title={`New Interconsultation for ${patient.user.firstName} ${patient.user.lastName}`}
      >
        <NewInterconsultationForm
          onSubmit={handleCreateInterconsultation}
          onCancel={() => setIsNewModalOpen(false)}
          isLoading={createInterconsultationMutation.isPending}
        />
      </Modal>

      {selectedInterconsultation && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Interconsultation: ${selectedInterconsultation.reason}`}
        >
          <EditInterconsultationForm
            interconsultation={selectedInterconsultation}
            onSubmit={handleUpdateInterconsultation}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={updateInterconsultationMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}

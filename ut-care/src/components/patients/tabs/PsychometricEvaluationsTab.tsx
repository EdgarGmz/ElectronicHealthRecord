import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPsychometricEvaluationsByRecordId, createPsychometricEvaluation, updatePsychometricEvaluation } from '@/services/psychometric-evaluation.service';
import type { Patient } from '@/types/patient';
import type { PsychometricEvaluation } from '@/types/psychometric-evaluation';
import { Plus, ClipboardCheck, Edit } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/organisms/Modal';
import NewPsychometricEvaluationForm from '@/components/patients/forms/NewPsychometricEvaluationForm';
import EditPsychometricEvaluationForm from '@/components/patients/forms/EditPsychometricEvaluationForm';
import type { UpdatePsychometricEvaluationInput } from '@/types/psychometric-evaluation.update.schema';
import { useAuthStore } from '@/store/auth.store';
import { CAN_MANAGE_PSICOMETRIA } from '@/constants/roles';
import type { Role } from '@/constants/roles';

const EvaluationItem = ({ evaluation, onEditClick, canEdit }: { evaluation: PsychometricEvaluation; onEditClick?: (e: PsychometricEvaluation) => void; canEdit?: boolean }) => (
  <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-bold">{evaluation.evaluationType}</h4>
      <div className="flex items-center text-sm text-gray-500">
        <span>{new Date(evaluation.applicationDate).toLocaleDateString()}</span>
        {canEdit && onEditClick && (
          <button
            onClick={(e) => { e.stopPropagation(); onEditClick(evaluation); }}
            className="ml-3 p-1 rounded-md hover:bg-gray-100 text-secondary hover:text-secondary-dark"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
    <div className="text-sm text-gray-700">
      {evaluation.rawScore && <span>Raw Score: {evaluation.rawScore} | </span>}
      {evaluation.standardScore && <span>Standard Score: {evaluation.standardScore} | </span>}
      {evaluation.percentile && <span>Percentile: {evaluation.percentile}%</span>}
    </div>
    {evaluation.interpretation && <p className="mt-2 text-xs italic text-gray-500">Interpretation: {evaluation.interpretation}</p>}
    {evaluation.fileUrl && <a href={evaluation.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm mt-2 block">View File</a>}
  </div>
);

export default function PsychometricEvaluationsTab({ patient }: { patient: Patient }) {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PsychometricEvaluation | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canManageEvaluations = user?.role && CAN_MANAGE_PSICOMETRIA.includes(user.role as Role);

  const psychologyRecordId = patient.medicalRecord?.psychologyRecord?.id;

  const { data: evaluations, isLoading, error } = useQuery({
    queryKey: ['psychometricEvaluations', psychologyRecordId],
    queryFn: () => getPsychometricEvaluationsByRecordId(psychologyRecordId!),
    enabled: !!psychologyRecordId,
  });

  const createEvaluationMutation = useMutation({
    mutationFn: createPsychometricEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychometricEvaluations', psychologyRecordId] });
      setIsNewModalOpen(false);
    },
    onError: (err) => {
      console.error("Error creating evaluation:", err);
    }
  });

  const updateEvaluationMutation = useMutation({
    mutationFn: ({ evaluationId, data }: { evaluationId: string; data: UpdatePsychometricEvaluationInput }) => updatePsychometricEvaluation(evaluationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychometricEvaluations', psychologyRecordId] });
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      console.error("Error updating evaluation:", err);
    }
  });


  const handleCreateEvaluation = (formData: any) => {
    if (!psychologyRecordId || !user) return;
    createEvaluationMutation.mutate({
      ...formData,
      psychologyRecordId,
      administeredBy: user.id,
    });
  };

  const handleUpdateEvaluation = (formData: UpdatePsychometricEvaluationInput) => {
    if (!selectedEvaluation) return;
    updateEvaluationMutation.mutate({
      evaluationId: selectedEvaluation.id,
      data: formData,
    });
  };

  const handleEditEvaluationClick = (evaluation: PsychometricEvaluation) => {
    setSelectedEvaluation(evaluation);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Psychometric Evaluations</h3>
        {canManageEvaluations && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            disabled={!psychologyRecordId}
            className="flex items-center px-3 py-1 text-sm text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Evaluation
          </button>
        )}
      </div>

      {isLoading && <p>Loading evaluations...</p>}
      {error && <p className="text-red-500">Could not load evaluations.</p>}
      {!psychologyRecordId && <p className="text-gray-500">This patient does not have a psychology record yet.</p>}

      {evaluations && evaluations.length > 0 ? (
        <div className="space-y-3">
          {evaluations.map(evaluation => (
            <EvaluationItem
              key={evaluation.id}
              evaluation={evaluation}
              onEditClick={handleEditEvaluationClick}
              canEdit={canManageEvaluations}
            />
          ))}
        </div>
      ) : (
        evaluations && <p className="text-gray-500">No psychometric evaluations recorded yet.</p>
      )}

      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title={`New Psychometric Evaluation for ${patient.user.firstName}`}
      >
        <NewPsychometricEvaluationForm
          onSubmit={handleCreateEvaluation}
          onCancel={() => setIsNewModalOpen(false)}
          isLoading={createEvaluationMutation.isPending}
        />
      </Modal>

      {selectedEvaluation && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Evaluation: ${selectedEvaluation.evaluationType}`}
        >
          <EditPsychometricEvaluationForm
            evaluation={selectedEvaluation}
            onSubmit={handleUpdateEvaluation}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={updateEvaluationMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}

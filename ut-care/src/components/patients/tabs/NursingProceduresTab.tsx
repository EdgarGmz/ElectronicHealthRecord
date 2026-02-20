import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNursingConsultationsByMedicalRecordId, createNursingConsultation, updateNursingConsultation, createNursingProcedure, updateNursingProcedure } from '@/services/nursing-procedure.service';
import { Patient } from '@/types/patient';
import { NursingConsultation, NursingProcedure } from '@/types/nursing-procedure';
import { Plus, Nurse, FlaskConical, Edit } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/organisms/Modal';
import NewNursingConsultationForm from '@/components/patients/forms/NewNursingConsultationForm';
import EditNursingConsultationForm from '@/components/patients/forms/EditNursingConsultationForm';
import NewNursingProcedureForm from '@/components/patients/forms/NewNursingProcedureForm';
import EditNursingProcedureForm from '@/components/patients/forms/EditNursingProcedureForm';
import { UpdateNursingConsultationInput } from '@/types/nursing-consultation.update.schema';
import { UpdateNursingProcedureInput } from '@/types/nursing-procedure.update.schema';
import { useAuthStore } from '@/store/auth.store';

const ProcedureItem = ({ procedure, onEditClick }: { procedure: NursingProcedure, onEditClick: (p: NursingProcedure) => void }) => (
  <div className="p-3 bg-gray-100 rounded-md shadow-sm border border-gray-200 flex justify-between items-center">
    <div>
      <div className="flex items-center text-sm text-gray-700">
        <FlaskConical className="w-4 h-4 mr-2" />
        <span className="font-medium">{procedure.procedureType}</span>
      </div>
      <p className="mt-1 text-xs text-gray-600">{procedure.description}</p>
      <p className="mt-1 text-xs text-gray-500">Performed by: {procedure.performedByUser.firstName} {procedure.performedByUser.lastName}</p>
    </div>
    <button 
        onClick={(e) => { e.stopPropagation(); onEditClick(procedure); }}
        className="p-1 rounded-md hover:bg-gray-200 text-secondary hover:text-secondary-dark"
    >
        <Edit className="w-4 h-4" />
    </button>
  </div>
);

const ConsultationItem = ({ consultation, medicalRecordId, patient }: { consultation: NursingConsultation, medicalRecordId: string, patient: Patient }) => {
  const [isNewProcedureModalOpen, setIsNewProcedureModalOpen] = useState(false);
  const [isEditConsultationModalOpen, setIsEditConsultationModalOpen] = useState(false);
  const [isEditProcedureModalOpen, setIsEditProcedureModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<NursingProcedure | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const createProcedureMutation = useMutation({
    mutationFn: createNursingProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursingConsultations', medicalRecordId] });
      setIsNewProcedureModalOpen(false);
    },
    onError: (err) => {
      console.error("Error creating procedure:", err);
    }
  });

  const updateConsultationMutation = useMutation({
    mutationFn: ({ consultationId, data }: { consultationId: string; data: UpdateNursingConsultationInput }) => updateNursingConsultation(consultationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursingConsultations', medicalRecordId] });
      setIsEditConsultationModalOpen(false);
    },
    onError: (err) => {
      console.error("Error updating consultation:", err);
    }
  });

  const updateProcedureMutation = useMutation({
    mutationFn: ({ procedureId, data }: { procedureId: string; data: UpdateNursingProcedureInput }) => updateNursingProcedure(procedureId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursingConsultations', medicalRecordId] });
      setIsEditProcedureModalOpen(false);
    },
    onError: (err) => {
      console.error("Error updating procedure:", err);
    }
  });


  const handleCreateProcedure = (formData: any) => {
    if (!user) return;
    createProcedureMutation.mutate({
      ...formData,
      nursingConsultationId: consultation.id,
      performedBy: user.id,
    });
  };

  const handleUpdateConsultation = (formData: UpdateNursingConsultationInput) => {
    updateConsultationMutation.mutate({
      consultationId: consultation.id,
      data: formData,
    });
  };

  const handleUpdateProcedure = (formData: UpdateNursingProcedureInput) => {
    if (!selectedProcedure) return;
    updateProcedureMutation.mutate({
      procedureId: selectedProcedure.id,
      data: formData,
    });
  };

  const handleEditProcedureClick = (procedure: NursingProcedure) => {
    setSelectedProcedure(procedure);
    setIsEditProcedureModalOpen(true);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-800 flex items-center">
          <Nurse className="w-5 h-5 mr-2 text-blue-600" />
          Nursing Consultation - {new Date(consultation.consultationDate).toLocaleDateString()}
        </h4>
        <div className="flex items-center">
            <span className="text-sm text-gray-600">Nurse: {consultation.nurse.firstName} {consultation.nurse.lastName}</span>
            <button 
                onClick={() => setIsEditConsultationModalOpen(true)}
                className="ml-3 p-1 rounded-md hover:bg-gray-100 text-secondary hover:text-secondary-dark"
            >
                <Edit className="w-4 h-4" />
            </button>
        </div>
      </div>
      <p className="text-sm text-gray-700">Chief Complaint: {consultation.chiefComplaint || 'N/A'}</p>
      {consultation.diagnosis && <p className="text-sm text-gray-700">Diagnosis: {consultation.diagnosis}</p>}
      
      <h5 className="mt-4 mb-2 text-md font-semibold">Procedures:</h5>
      {consultation.nursingProcedures && consultation.nursingProcedures.length > 0 ? (
        <div className="space-y-2">
          {consultation.nursingProcedures.map(procedure => (
            <ProcedureItem 
                key={procedure.id} 
                procedure={procedure} 
                onEditClick={handleEditProcedureClick}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No procedures recorded for this consultation.</p>
      )}

      <div className="flex justify-end mt-3">
        <button
          onClick={() => setIsNewProcedureModalOpen(true)}
          className="flex items-center px-3 py-1 text-xs text-white rounded-md bg-secondary hover:bg-secondary-dark"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Procedure
        </button>
      </div>

      <Modal
        isOpen={isNewProcedureModalOpen}
        onClose={() => setIsNewProcedureModalOpen(false)}
        title={`Add Procedure to Consultation on ${new Date(consultation.consultationDate).toLocaleDateString()}`}
      >
        <NewNursingProcedureForm
          onSubmit={handleCreateProcedure}
          onCancel={() => setIsNewProcedureModalOpen(false)}
          isLoading={createProcedureMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={isEditConsultationModalOpen}
        onClose={() => setIsEditConsultationModalOpen(false)}
        title={`Edit Nursing Consultation - ${new Date(consultation.consultationDate).toLocaleDateString()}`}
      >
        <EditNursingConsultationForm
          consultation={consultation}
          onSubmit={handleUpdateConsultation}
          onCancel={() => setIsEditConsultationModalOpen(false)}
          isLoading={updateConsultationMutation.isPending}
        />
      </Modal>

      {selectedProcedure && (
        <Modal
          isOpen={isEditProcedureModalOpen}
          onClose={() => setIsEditProcedureModalOpen(false)}
          title={`Edit Procedure: ${selectedProcedure.procedureType}`}
        >
          <EditNursingProcedureForm
            procedure={selectedProcedure}
            onSubmit={handleUpdateProcedure}
            onCancel={() => setIsEditProcedureModalOpen(false)}
            isLoading={updateProcedureMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
};

export default function NursingProceduresTab({ patient }: { patient: Patient }) {
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const medicalRecordId = patient.medicalRecord?.id;

  const { data: consultations, isLoading, error } = useQuery({
    queryKey: ['nursingConsultations', medicalRecordId],
    queryFn: () => getNursingConsultationsByMedicalRecordId(medicalRecordId!),
    enabled: !!medicalRecordId,
  });

  const createConsultationMutation = useMutation({
    mutationFn: createNursingConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursingConsultations', medicalRecordId] });
      setIsConsultationModalOpen(false);
    },
    onError: (err) => {
      console.error("Error creating consultation:", err);
    }
  });

  const handleCreateConsultation = (formData: any) => {
    if (!medicalRecordId || !user) return;
    createConsultationMutation.mutate({
      ...formData,
      medicalRecordId,
      nurseId: user.id,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Nursing Consultations & Procedures</h3>
        <button
          onClick={() => setIsConsultationModalOpen(true)}
          disabled={!medicalRecordId}
          className="flex items-center px-3 py-1 text-sm text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Consultation
        </button>
      </div>

      {isLoading && <p>Loading consultations...</p>}
      {error && <p className="text-red-500">Could not load consultations: {error.message}</p>}
      {!medicalRecordId && <p className="text-gray-500">This patient does not have a medical record yet.</p>}

      {consultations && consultations.length > 0 ? (
        <div className="space-y-4">
          {consultations.map(consultation => (
            <ConsultationItem 
              key={consultation.id} 
              consultation={consultation} 
              medicalRecordId={medicalRecordId!}
              patient={patient} // Pass patient to ConsultationItem for modal titles
            />
          ))}
        </div>
      ) : (
        consultations && <p className="text-gray-500">No nursing consultations recorded yet.</p>
      )}

      <Modal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        title={`New Nursing Consultation for ${patient.user.firstName}`}
      >
        <NewNursingConsultationForm
          onSubmit={handleCreateConsultation}
          onCancel={() => setIsConsultationModalOpen(false)}
          isLoading={createConsultationMutation.isPending}
        />
      </Modal>
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPsychologyRecordByMedicalRecordId, updatePsychologyRecordDiagnosis } from '@/services/diagnosis.service';
import { Patient } from '@/types/patient';
import { PsychologyRecordDetails, UpdatePsychologyRecordDiagnosisInput } from '@/types/diagnosis';
import { useState } from 'react';
import Modal from '@/components/organisms/Modal';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit } from 'lucide-react';

const diagnosisSchema = z.object({
  currentDiagnosisDsm5: z.string().optional().or(z.literal('')),
  currentDiagnosisCie10: z.string().optional().or(z.literal('')),
});

type DiagnosisFormInput = z.infer<typeof diagnosisSchema>;

interface EditDiagnosisFormProps {
  initialData: DiagnosisFormInput;
  onSubmit: (data: DiagnosisFormInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const InputField = ({ label, name, register, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      {...register(name)}
      className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
    />
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
);

function EditDiagnosisForm({ initialData, onSubmit, onCancel, isLoading }: EditDiagnosisFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<DiagnosisFormInput>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField label="DSM-5 Diagnosis" name="currentDiagnosisDsm5" register={register} error={errors.currentDiagnosisDsm5} />
      <InputField label="CIE-10 Diagnosis" name="currentDiagnosisCie10" register={register} error={errors.currentDiagnosisCie10} />

      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}


export default function DiagnosesTab({ patient }: { patient: Patient }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const medicalRecordId = patient.medicalRecord?.id;

  const { data: psychologyRecord, isLoading, error } = useQuery<PsychologyRecordDetails, Error>({
    queryKey: ['psychologyRecord', medicalRecordId],
    queryFn: () => getPsychologyRecordByMedicalRecordId(medicalRecordId!),
    enabled: !!medicalRecordId,
  });

  const updateDiagnosisMutation = useMutation({
    mutationFn: ({ psychologyRecordId, data }: { psychologyRecordId: string; data: UpdatePsychologyRecordDiagnosisInput }) =>
      updatePsychologyRecordDiagnosis(psychologyRecordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychologyRecord', medicalRecordId] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      console.error("Error updating diagnosis:", err);
    }
  });

  const handleUpdateDiagnosis = (formData: DiagnosisFormInput) => {
    if (!psychologyRecord?.id) return;
    updateDiagnosisMutation.mutate({
      psychologyRecordId: psychologyRecord.id,
      data: formData,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Diagnoses</h3>
        {psychologyRecord?.id && (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-3 py-1 text-sm text-white rounded-md bg-primary hover:bg-primary-dark"
            >
                <Edit className="w-4 h-4 mr-1" />
                Edit Diagnoses
            </button>
        )}
      </div>

      {isLoading && <p>Loading diagnoses...</p>}
      {error && <p className="text-red-500">Could not load psychology record: {error.message}</p>}
      {!medicalRecordId && <p className="text-gray-500">This patient does not have a medical record yet.</p>}
      
      {psychologyRecord ? (
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            <div><strong>DSM-5:</strong> {psychologyRecord.currentDiagnosisDsm5 || 'N/A'}</div>
            <div><strong>CIE-10/11:</strong> {psychologyRecord.currentDiagnosisCie10 || 'N/A'}</div>
            <div><strong>Suicide Risk:</strong> {psychologyRecord.suicideRiskLevel || 'N/A'}</div>
            <div><strong>Violence Risk:</strong> {psychologyRecord.violenceRiskLevel || 'N/A'}</div>
            {psychologyRecord.assignedPsychologist && (
                <div>
                    <strong>Assigned Psychologist:</strong> {psychologyRecord.assignedPsychologist.firstName} {psychologyRecord.assignedPsychologist.lastName}
                </div>
            )}
          </div>
        </div>
      ) : (
        !isLoading && !error && <p className="text-gray-500">No psychology record found for this patient.</p>
      )}

      {psychologyRecord && (
          <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Edit Diagnoses"
          >
              <EditDiagnosisForm
                  initialData={{
                      currentDiagnosisDsm5: psychologyRecord.currentDiagnosisDsm5 || '',
                      currentDiagnosisCie10: psychologyRecord.currentDiagnosisCie10 || '',
                  }}
                  onSubmit={handleUpdateDiagnosis}
                  onCancel={() => setIsModalOpen(false)}
                  isLoading={updateDiagnosisMutation.isPending}
              />
          </Modal>
      )}
    </div>
  );
}

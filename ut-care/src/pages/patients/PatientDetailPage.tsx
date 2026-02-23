import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatientById, updatePatient } from '@/services/patient.service';
import PatientHeader from '@/components/patients/PatientHeader';
import MedicalRecordTabs from '@/components/patients/MedicalRecordTabs';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/organisms/Modal';
import EditPatientForm from '@/components/patients/forms/EditPatientForm';
import type { UpdatePatientInput } from '@/types/patient.update.schema';
import { useAuthStore } from '@/store/auth.store';
import { CAN_MANAGE_PATIENTS } from '@/constants/roles';
import type { Role } from '@/constants/roles';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canManagePatients = user?.role && CAN_MANAGE_PATIENTS.includes(user.role as Role);

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatientById(id!),
    enabled: !!id,
  });

  const updatePatientMutation = useMutation({
    mutationFn: (data: UpdatePatientInput) => updatePatient(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setIsEditModalOpen(false);
      // Success toast
    },
    onError: (err) => {
      console.error("Error updating patient:", err);
      // Error toast
    }
  });

  const handleUpdatePatient = (formData: UpdatePatientInput) => {
    // Send only fields that the API expects (user + patient fields). Do not send role/userId.
    updatePatientMutation.mutate(formData);
  };

  if (isLoading) return <div className="text-center p-8">Loading patient data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  if (!patient) return <div className="p-8 text-center">Patient not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PatientHeader patient={patient} />
        {canManagePatients && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Patient
          </button>
        )}
      </div>
      
      <MedicalRecordTabs patient={patient} />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Patient: ${patient.user.firstName} ${patient.user.lastName}`}
      >
        <EditPatientForm
          patient={patient}
          onSubmit={handleUpdatePatient}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={updatePatientMutation.isPending}
        />
      </Modal>
    </div>
  );
}

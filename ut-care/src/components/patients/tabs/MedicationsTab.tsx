import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrescriptionsByPatientId, createPrescription, getAllMedications } from '@/services/medication.service';
import type { Patient } from '@/types/patient';
import type { Prescription } from '@/types/medication';
import { Plus, Pill } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/organisms/Modal';
import NewPrescriptionForm from '@/components/patients/forms/NewPrescriptionForm';
import type { CreatePrescriptionFormInput } from '@/types/prescription.schema';
import { useAuthStore } from '@/store/auth.store';

const PrescriptionItem = ({ prescription }: { prescription: Prescription }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'discontinued': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Pill className="w-5 h-5 mr-3 text-primary" />
          <h4 className="font-bold text-gray-800">{prescription.medication.name}</h4>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
          {prescription.status}
        </span>
      </div>
      <div className="mt-2 pl-8 text-sm text-gray-600 grid grid-cols-2 gap-x-4">
        <div><strong>Dosage:</strong> {prescription.dosage}</div>
        <div><strong>Frequency:</strong> {prescription.frequency}</div>
        <div><strong>Route:</strong> {prescription.route}</div>
        <div><strong>Duration:</strong> {prescription.duration || 'N/A'}</div>
      </div>
      <div className="mt-2 pl-8 text-xs text-gray-500">
        Prescribed by Dr. {prescription.prescribedByUser.firstName} {prescription.prescribedByUser.lastName} on {new Date(prescription.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default function MedicationsTab({ patient }: { patient: Patient }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: prescriptions, isLoading, error } = useQuery({
    queryKey: ['prescriptions', patient.id],
    queryFn: () => getPrescriptionsByPatientId(patient.id),
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions', patient.id] });
      setIsModalOpen(false);
      // Here you could add a success toast notification
    },
    onError: (err) => {
      // Here you could add an error toast notification
      console.error("Error creating prescription:", err);
    }
  });

  const handleCreatePrescription = (formData: CreatePrescriptionFormInput) => {
    if (!user) return; // Should not happen if route is protected
    createPrescriptionMutation.mutate({
      ...formData,
      patientId: patient.id,
      prescribedBy: user.id, // The logged-in user is the one prescribing
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Medication Prescriptions</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-3 py-1 text-sm text-white rounded-md bg-primary hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Prescription
        </button>
      </div>

      {isLoading && <p>Loading prescriptions...</p>}
      {error && <p className="text-red-500">Could not load prescriptions.</p>}

      {prescriptions && prescriptions.length > 0 ? (
        <div className="space-y-3">
          {prescriptions.map(p => (
            <PrescriptionItem key={p.id} prescription={p} />
          ))}
        </div>
      ) : (
        prescriptions && <p className="text-gray-500">No prescriptions found for this patient.</p>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`New Prescription for ${patient.user.firstName} ${patient.user.lastName}`}
      >
        <NewPrescriptionForm 
          onSubmit={handleCreatePrescription}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createPrescriptionMutation.isPending}
        />
      </Modal>
    </div>
  );
}

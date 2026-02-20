import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePrescriptionFormInput, createPrescriptionSchema } from '@/types/prescription.schema';
import { useQuery } from '@tanstack/react-query';
import { getAllMedications } from '@/services/medication.service';
import { useEffect } from 'react';

interface NewPrescriptionFormProps {
  onSubmit: (data: CreatePrescriptionFormInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

// Reusable InputField component
const InputField = ({ label, name, type = 'text', register, error, options }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    {type === 'select' ? (
      <select {...register(name)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        {...register(name)}
        className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
      />
    )}
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
);

const TextAreaField = ({ label, name, register, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea {...register(name)} rows={3} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
);


export default function NewPrescriptionForm({ onSubmit, onCancel, isLoading }: NewPrescriptionFormProps) {
  const { register, handleSubmit, formState: { errors, dirtyFields }, reset } = useForm<CreatePrescriptionFormInput>({
    resolver: zodResolver(createPrescriptionSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      endDate: '', // Initialize as empty string for optional date
    }
  });

  const { data: medications, isLoading: medicationsLoading, error: medicationsError } = useQuery({
    queryKey: ['allMedications'],
    queryFn: getAllMedications,
  });

  // Reset form when modal is closed
  useEffect(() => {
    if (!isLoading && !dirtyFields.medicationId) { // Check if form is not submitting and not dirty
      reset();
    }
  }, [isLoading, dirtyFields.medicationId, reset]);

  if (medicationsLoading) return <div>Loading medications...</div>;
  if (medicationsError) return <div className="text-red-500">Error loading medications: {medicationsError.message}</div>;

  const medicationOptions = medications?.map(med => ({
    value: med.id,
    label: `${med.name} (${med.genericName})`,
  })) || [];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'discontinued', label: 'Discontinued' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField 
          label="Medication" 
          name="medicationId" 
          type="select" 
          register={register} 
          error={errors.medicationId} 
          options={[{ value: '', label: 'Select a medication' }, ...medicationOptions]}
        />
        <InputField label="Dosage" name="dosage" register={register} error={errors.dosage} />
        <InputField label="Frequency" name="frequency" register={register} error={errors.frequency} />
        <InputField label="Route" name="route" register={register} error={errors.route} />
        <InputField label="Duration" name="duration" register={register} error={errors.duration} />
        <InputField label="Start Date" name="startDate" type="date" register={register} error={errors.startDate} />
        <InputField label="End Date (Optional)" name="endDate" type="date" register={register} error={errors.endDate} />
        <InputField 
          label="Status" 
          name="status" 
          type="select" 
          register={register} 
          error={errors.status} 
          options={statusOptions}
        />
      </div>
      <TextAreaField label="Instructions" name="instructions" register={register} error={errors.instructions} />

      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50">
          {isLoading ? 'Prescribing...' : 'Prescribe Medication'}
        </button>
      </div>
    </form>
  );
}

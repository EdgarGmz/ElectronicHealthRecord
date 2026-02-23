import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateInterconsultationInput } from '@/types/interconsultation';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/services/api'; // Assuming you have an API service to fetch users/professionals

const interconsultationSchema = z.object({
  fromDepartment: z.string().min(1, 'From Department is required.'),
  toDepartment: z.string().min(1, 'To Department is required.'),
  toProfessionalId: z.string().uuid('Invalid Professional ID.').optional().or(z.literal('')),
  reason: z.string().min(1, 'Reason is required.'),
  relevantInformation: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']),
});

type InterconsultationFormInput = Omit<CreateInterconsultationInput, 'patientId' | 'fromProfessionalId'>;

interface NewInterconsultationFormProps {
  onSubmit: (data: InterconsultationFormInput) => void;
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


export default function NewInterconsultationForm({ onSubmit, onCancel, isLoading }: NewInterconsultationFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<InterconsultationFormInput>({
    resolver: zodResolver(interconsultationSchema),
    defaultValues: {
      urgency: 'medium',
      toProfessionalId: '',
    }
  });

  // Fetch list of professionals for the 'toProfessionalId' dropdown
  const { data: professionals, isLoading: professionalsLoading, error: professionalsError } = useQuery({
    queryKey: ['allProfessionals'],
    queryFn: async () => {
      const response = await api.get('/users?role=psicologo&role=enfermero&role=admin&role=coordinador_psicologia&role=coordinador_enfermeria');
      return response.data.users; // Assuming API returns { users: [...] }
    },
  });

  const departmentOptions = [
    { value: 'Psychology', label: 'Psychology' },
    { value: 'Nursing', label: 'Nursing' },
    { value: 'Administration', label: 'Administration' },
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  if (professionalsLoading) return <div>Loading professionals...</div>;
  if (professionalsError) return <div className="text-red-500">Error loading professionals: {professionalsError.message}</div>;

  const professionalOptions = professionals?.map((prof: any) => ({
    value: prof.id,
    label: `${prof.firstName} ${prof.lastName} (${prof.role})`,
  })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField 
          label="From Department" 
          name="fromDepartment" 
          type="select" 
          register={register} 
          error={errors.fromDepartment} 
          options={departmentOptions}
        />
        <InputField 
          label="To Department" 
          name="toDepartment" 
          type="select" 
          register={register} 
          error={errors.toDepartment} 
          options={departmentOptions}
        />
        <InputField 
          label="To Professional (Optional)" 
          name="toProfessionalId" 
          type="select" 
          register={register} 
          error={errors.toProfessionalId} 
          options={[{ value: '', label: 'Select professional' }, ...professionalOptions]}
        />
        <InputField 
          label="Urgency" 
          name="urgency" 
          type="select" 
          register={register} 
          error={errors.urgency} 
          options={urgencyOptions}
        />
      </div>
      <TextAreaField label="Reason" name="reason" register={register} error={errors.reason} />
      <TextAreaField label="Relevant Information" name="relevantInformation" register={register} error={errors.relevantInformation} />

      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50">
          {isLoading ? 'Sending...' : 'Send Interconsultation'}
        </button>
      </div>
    </form>
  );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPatientSchema, CreatePatientInput } from '@/types/patient.schema';

interface NewPatientFormProps {
  onSubmit: (data: CreatePatientInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

// Dummy data for careers - this should come from an API call
const careers = [
  { id: 'd4b7c3b0-9a6d-4f1e-8c3b-5e6a7d8f9c1b', name: 'Software Engineering' },
  { id: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', name: 'Psychology' },
];

export default function NewPatientForm({ onSubmit, onCancel, isLoading }: NewPatientFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* User Fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField label="First Name" name="firstName" register={register} error={errors.firstName} />
        <InputField label="Last Name" name="lastName" register={register} error={errors.lastName} />
        <InputField label="Email" name="email" type="email" register={register} error={errors.email} />
        <InputField label="Password" name="password" type="password" register={register} error={errors.password} />
        <InputField label="Date of Birth" name="dateOfBirth" type="date" register={register} error={errors.dateOfBirth} />
        <InputField label="Enrollment #" name="enrollmentNumber" register={register} error={errors.enrollmentNumber} />
        <InputField label="Phone" name="phone" register={register} error={errors.phone} />
        
        {/* Patient Fields */}
        <InputField label="Patient Type" name="patientType" register={register} error={errors.patientType} />
        <InputField label="Marital Status" name="maritalStatus" register={register} error={errors.maritalStatus} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Career</label>
          <select {...register('careerId')} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
            <option value="">Select a career</option>
            {careers.map(career => (
              <option key={career.id} value={career.id}>{career.name}</option>
            ))}
          </select>
          {errors.careerId && <p className="mt-1 text-sm text-red-500">{errors.careerId.message}</p>}
        </div>
        <InputField label="Group" name="group" register={register} error={errors.group} />
        <InputField label="Occupation" name="occupation" register={register} error={errors.occupation} />
        <InputField label="Trimester" name="trimester" type="number" register={register} error={errors.trimester} />
      </div>

      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50">
          {isLoading ? 'Creating...' : 'Create Patient'}
        </button>
      </div>
    </form>
  );
}

// Reusable InputField component to reduce repetition
const InputField = ({ label, name, type = 'text', register, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      {...register(name)}
      className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
    />
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
);

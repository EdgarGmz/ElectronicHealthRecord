import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePatientSchema, UpdatePatientInput } from '@/types/patient.update.schema';
import { Patient } from '@/types/patient';
import { useQuery } from '@tanstack/react-query';
import { getCareers } from '@/services/career.service'; // Import from new career.service

interface EditPatientFormProps {
  patient: Patient;
  onSubmit: (data: UpdatePatientInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

// Reusable InputField component to reduce repetition
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


export default function EditPatientForm({ patient, onSubmit, onCancel, isLoading }: EditPatientFormProps) {
  const { data: careers, isLoading: careersLoading, error: careersError } = useQuery({
    queryKey: ['careers'],
    queryFn: getCareers,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<UpdatePatientInput>({
    resolver: zodResolver(updatePatientSchema),
    defaultValues: {
      email: patient.user.email,
      firstName: patient.user.firstName,
      lastName: patient.user.lastName,
      dateOfBirth: patient.user.dateOfBirth.split('T')[0], // Format date for input type="date"
      enrollmentNumber: patient.user.enrollmentNumber || '',
      phone: patient.user.phone || '',
      patientType: patient.patientType,
      maritalStatus: patient.maritalStatus || '',
      careerId: patient.careerId,
      group: patient.group || '',
      occupation: patient.occupation || '',
      trimester: patient.trimester || undefined,
    }
  });

  if (careersLoading) return <div>Loading careers...</div>;
  if (careersError) return <div className="text-red-500">Error loading careers: {careersError.message}</div>;

  const careerOptions = careers?.map(career => ({
    value: career.id,
    label: career.name,
  })) || [];


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* User Fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField label="First Name" name="firstName" register={register} error={errors.firstName} />
        <InputField label="Last Name" name="lastName" register={register} error={errors.lastName} />
        <InputField label="Email" name="email" type="email" register={register} error={errors.email} />
        {/* Password is not included in this form as it's typically handled separately */}
        <InputField label="Date of Birth" name="dateOfBirth" type="date" register={register} error={errors.dateOfBirth} />
        <InputField label="Enrollment #" name="enrollmentNumber" register={register} error={errors.enrollmentNumber} />
        <InputField label="Phone" name="phone" register={register} error={errors.phone} />
        
        {/* Patient Fields */}
        <InputField label="Patient Type" name="patientType" register={register} error={errors.patientType} />
        <InputField label="Marital Status" name="maritalStatus" register={register} error={errors.maritalStatus} />
        <InputField 
          label="Career" 
          name="careerId" 
          type="select" 
          register={register} 
          error={errors.careerId} 
          options={[{ value: '', label: 'Select a career' }, ...careerOptions]}
        />
        <InputField label="Group" name="group" register={register} error={errors.group} />
        <InputField label="Occupation" name="occupation" register={register} error={errors.occupation} />
        <InputField label="Trimester" name="trimester" type="number" register={register} error={errors.trimester} />
      </div>

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

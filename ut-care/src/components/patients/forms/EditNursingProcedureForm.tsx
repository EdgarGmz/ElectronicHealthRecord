import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateNursingProcedureSchema, UpdateNursingProcedureInput } from '@/types/nursing-procedure.update.schema';
import { NursingProcedure } from '@/types/nursing-procedure';

interface EditNursingProcedureFormProps {
  procedure: NursingProcedure;
  onSubmit: (data: UpdateNursingProcedureInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

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

const TextAreaField = ({ label, name, register, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea {...register(name)} rows={3} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
);

export default function EditNursingProcedureForm({ procedure, onSubmit, onCancel, isLoading }: EditNursingProcedureFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateNursingProcedureInput>({
    resolver: zodResolver(updateNursingProcedureSchema),
    defaultValues: {
      procedureType: procedure.procedureType,
      procedureDate: new Date(procedure.procedureDate).toISOString().split('T')[0],
      description: procedure.description,
      materialsUsed: procedure.materialsUsed || '',
      observations: procedure.observations || '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField label="Procedure Type" name="procedureType" register={register} error={errors.procedureType} />
        <InputField label="Procedure Date" name="procedureDate" type="date" register={register} error={errors.procedureDate} />
      </div>
      <TextAreaField label="Description" name="description" register={register} error={errors.description} />
      <TextAreaField label="Materials Used" name="materialsUsed" register={register} error={errors.materialsUsed} />
      <TextAreaField label="Observations" name="observations" register={register} error={errors.observations} />

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

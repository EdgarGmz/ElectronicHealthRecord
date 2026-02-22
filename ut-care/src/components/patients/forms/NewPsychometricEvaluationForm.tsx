import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreatePsychometricEvaluationInput } from '@/types/psychometric-evaluation';

const evaluationSchema = z.object({
  evaluationType: z.string().min(1, 'Evaluation type is required.'),
  applicationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date.' }),
  rawScore: z.coerce.number().optional(),
  standardScore: z.coerce.number().optional(),
  percentile: z.coerce.number().int().min(0).max(100).optional(),
  interpretation: z.string().optional(),
  fileUrl: z.string().url('Invalid URL format.').optional().or(z.literal('')),
});

type EvaluationFormInput = Omit<CreatePsychometricEvaluationInput, 'psychologyRecordId' | 'administeredBy'>;

interface NewPsychometricEvaluationFormProps {
  onSubmit: (data: EvaluationFormInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

// Reusable InputField component
const InputField = ({ label, name, type = 'text', register, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      {...register(name, { valueAsNumber: type === 'number' })}
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

export default function NewPsychometricEvaluationForm({ onSubmit, onCancel, isLoading }: NewPsychometricEvaluationFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EvaluationFormInput>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      applicationDate: new Date().toISOString().split('T')[0],
      fileUrl: '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField label="Evaluation Type" name="evaluationType" register={register} error={errors.evaluationType} />
        <InputField label="Application Date" name="applicationDate" type="date" register={register} error={errors.applicationDate} />
        <InputField label="Raw Score" name="rawScore" type="number" register={register} error={errors.rawScore} />
        <InputField label="Standard Score" name="standardScore" type="number" register={register} error={errors.standardScore} />
        <InputField label="Percentile (0-100)" name="percentile" type="number" register={register} error={errors.percentile} />
        <InputField label="File URL (Optional)" name="fileUrl" type="url" register={register} error={errors.fileUrl} />
      </div>
      <TextAreaField label="Interpretation" name="interpretation" register={register} error={errors.interpretation} />

      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save Evaluation'}
        </button>
      </div>
    </form>
  );
}

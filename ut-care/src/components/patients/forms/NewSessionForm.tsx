import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTherapySessionInput } from '@/types/therapy-session';

const sessionSchema = z.object({
  sessionDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date.' }),
  mood: z.string().min(1, 'Mood is required.'),
  evolutionNotes: z.string().min(1, 'Evolution notes are required.'),
  patientProgress: z.string().min(1, 'Patient progress is required.'),
  assignedTasks: z.string().optional(),
  observations: z.string().optional(),
});

type SessionFormInput = Omit<CreateTherapySessionInput, 'psychologyRecordId' | 'therapistId'>;

interface NewSessionFormProps {
  onSubmit: (data: SessionFormInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TextAreaField = ({ label, name, register, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea {...register(name)} rows={4} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
);

export default function NewSessionForm({ onSubmit, onCancel, isLoading }: NewSessionFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SessionFormInput>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      sessionDate: new Date().toISOString().split('T')[0], // Today's date
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Session Date</label>
          <input type="date" {...register('sessionDate')} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
          {errors.sessionDate && <p className="mt-1 text-sm text-red-500">{errors.sessionDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Patient's Mood</label>
          <input {...register('mood')} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
          {errors.mood && <p className="mt-1 text-sm text-red-500">{errors.mood.message}</p>}
        </div>
      </div>

      <TextAreaField label="Evolution Notes" name="evolutionNotes" register={register} error={errors.evolutionNotes} />
      <TextAreaField label="Patient Progress" name="patientProgress" register={register} error={errors.patientProgress} />
      <TextAreaField label="Assigned Tasks" name="assignedTasks" register={register} error={errors.assignedTasks} />
      <TextAreaField label="Observations" name="observations" register={register} error={errors.observations} />

      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save Session'}
        </button>
      </div>
    </form>
  );
}

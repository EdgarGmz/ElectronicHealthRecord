import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { updateTherapySessionSchema, UpdateTherapySessionInput } from '@/types/therapy-session.update.schema';
import type { TherapySession } from '@/types/therapy-session';

interface EditTherapySessionFormProps {
  session: TherapySession;
  onSubmit: (data: UpdateTherapySessionInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

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

export default function EditTherapySessionForm({ session, onSubmit, onCancel, isLoading }: EditTherapySessionFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateTherapySessionInput>({
    resolver: zodResolver(updateTherapySessionSchema),
    defaultValues: {
      sessionDate: new Date(session.sessionDate).toISOString().split('T')[0],
      sessionDuration: session.sessionDuration,
      mood: session.mood,
      evolutionNotes: session.evolutionNotes || '',
      patientProgress: session.patientProgress || '',
      assignedTasks: session.assignedTasks || '',
      observations: session.observations || '',
      nextSessionPlan: session.nextSessionPlan || '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField label="Session Date" name="sessionDate" type="date" register={register} error={errors.sessionDate} />
        <InputField label="Duration (minutes)" name="sessionDuration" type="number" register={register} error={errors.sessionDuration} />
        <InputField label="Mood" name="mood" register={register} error={errors.mood} />
      </div>

      <TextAreaField label="Evolution Notes" name="evolutionNotes" register={register} error={errors.evolutionNotes} />
      <TextAreaField label="Patient Progress" name="patientProgress" register={register} error={errors.patientProgress} />
      <TextAreaField label="Assigned Tasks" name="assignedTasks" register={register} error={errors.assignedTasks} />
      <TextAreaField label="Observations" name="observations" register={register} error={errors.observations} />
      <TextAreaField label="Next Session Plan" name="nextSessionPlan" register={register} error={errors.nextSessionPlan} />

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

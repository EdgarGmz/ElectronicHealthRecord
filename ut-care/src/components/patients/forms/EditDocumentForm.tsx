import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { updateDocumentSchema, UpdateDocumentInput } from '@/types/document.update.schema';
import type { Document } from '@/types/document';

interface EditDocumentFormProps {
  document: Document;
  onSubmit: (data: UpdateDocumentInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TextAreaField = ({ label, name, register, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea {...register(name)} rows={3} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
);

export default function EditDocumentForm({ document, onSubmit, onCancel, isLoading }: EditDocumentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateDocumentInput>({
    resolver: zodResolver(updateDocumentSchema),
    defaultValues: {
      description: document.description || '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h4 className="font-bold text-gray-800">Editing: {document.fileName}</h4>
      <TextAreaField label="Description" name="description" register={register} error={errors.description} />

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

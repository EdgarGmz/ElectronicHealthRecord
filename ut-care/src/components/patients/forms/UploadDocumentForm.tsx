import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

const uploadDocumentSchema = z.object({
  file: z.instanceof(FileList)
    .refine(files => files.length > 0, "File is required.")
    .refine(files => files[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(files => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type), "Only .jpg, .jpeg, .png, .webp and .pdf formats are supported."),
  description: z.string().optional(),
});

type UploadDocumentFormInput = z.infer<typeof uploadDocumentSchema>;

interface UploadDocumentFormProps {
  onSubmit: (data: UploadDocumentFormInput) => void;
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

export default function UploadDocumentForm({ onSubmit, onCancel, isLoading }: UploadDocumentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<UploadDocumentFormInput>({
    resolver: zodResolver(uploadDocumentSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">File</label>
        <input 
          type="file" 
          {...register('file')} 
          className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-1" 
        />
        {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file.message}</p>}
      </div>
      <TextAreaField label="Description (Optional)" name="description" register={register} error={errors.description} />

      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50">
          {isLoading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </form>
  );
}

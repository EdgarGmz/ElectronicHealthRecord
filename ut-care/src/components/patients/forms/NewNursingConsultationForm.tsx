import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateNursingConsultationInput } from '@/types/nursing-procedure';

const consultationSchema = z.object({
  consultationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date.' }),
  chiefComplaint: z.string().min(1, 'Chief complaint is required.'),
  vitalSignsTemperature: z.coerce.number().optional(),
  vitalSignsBloodPressureSys: z.coerce.number().optional(),
  vitalSignsBloodPressureDia: z.coerce.number().optional(),
  vitalSignsHeartRate: z.coerce.number().optional(),
  vitalSignsRespiratoryRate: z.coerce.number().optional(),
  vitalSignsOxygenSaturation: z.coerce.number().optional(),
  vitalSignsWeight: z.coerce.number().optional(),
  vitalSignsHeight: z.coerce.number().optional(),
  physicalExamination: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  observations: z.string().optional(),
});

type ConsultationFormInput = Omit<CreateNursingConsultationInput, 'medicalRecordId' | 'nurseId'>;

interface NewNursingConsultationFormProps {
  onSubmit: (data: ConsultationFormInput) => void;
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

export default function NewNursingConsultationForm({ onSubmit, onCancel, isLoading }: NewNursingConsultationFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ConsultationFormInput>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      consultationDate: new Date().toISOString().split('T')[0],
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField label="Consultation Date" name="consultationDate" type="date" register={register} error={errors.consultationDate} />
        <InputField label="Chief Complaint" name="chiefComplaint" register={register} error={errors.chiefComplaint} />
        <InputField label="Temperature (°C)" name="vitalSignsTemperature" type="number" register={register} error={errors.vitalSignsTemperature} />
        <InputField label="Blood Pressure (Sys)" name="vitalSignsBloodPressureSys" type="number" register={register} error={errors.vitalSignsBloodPressureSys} />
        <InputField label="Blood Pressure (Dia)" name="vitalSignsBloodPressureDia" type="number" register={register} error={errors.vitalSignsBloodPressureDia} />
        <InputField label="Heart Rate (bpm)" name="vitalSignsHeartRate" type="number" register={register} error={errors.vitalSignsHeartRate} />
        <InputField label="Respiratory Rate" name="vitalSignsRespiratoryRate" type="number" register={register} error={errors.vitalSignsRespiratoryRate} />
        <InputField label="Oxygen Saturation (%)" name="vitalSignsOxygenSaturation" type="number" register={register} error={errors.vitalSignsOxygenSaturation} />
        <InputField label="Weight (kg)" name="vitalSignsWeight" type="number" register={register} error={errors.vitalSignsWeight} />
        <InputField label="Height (cm)" name="vitalSignsHeight" type="number" register={register} error={errors.vitalSignsHeight} />
      </div>
      <TextAreaField label="Physical Examination" name="physicalExamination" register={register} error={errors.physicalExamination} />
      <TextAreaField label="Diagnosis" name="diagnosis" register={register} error={errors.diagnosis} />
      <TextAreaField label="Treatment Plan" name="treatmentPlan" register={register} error={errors.treatmentPlan} />
      <TextAreaField label="Observations" name="observations" register={register} error={errors.observations} />

      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save Consultation'}
        </button>
      </div>
    </form>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { medicalRecordService } from '../../services/medicalRecord.service';
import { patientService } from '../../services/patient.service';
import type { MedicalRecord, Patient } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';
import { Select } from '../atoms/Select';
import { PencilIcon, XMarkIcon, CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const bloodTypeOptions = [
  { value: '', label: 'Seleccionar tipo de sangre' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

export const MedicalRecordPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuthStore();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    familyHistory: '',
    notes: '',
  });

  // Check if user has permission to edit
  const canEdit = hasRole(['admin', 'nurse', 'psychologist']);

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    if (!patientId) {
      toast.error('ID de paciente no válido');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch patient data
      const patientData = await patientService.getById(patientId);
      setPatient(patientData);

      // Fetch medical record
      const recordData = await medicalRecordService.getByPatientId(patientId);
      
      if (recordData) {
        setMedicalRecord(recordData);
        setFormData({
          bloodType: recordData.bloodType || '',
          allergies: recordData.allergies || '',
          chronicConditions: recordData.chronicConditions || '',
          currentMedications: recordData.currentMedications || '',
          familyHistory: recordData.familyHistory || '',
          notes: recordData.notes || '',
        });
      } else {
        // No medical record exists yet
        setMedicalRecord(null);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    if (!canEdit) {
      toast.error('No tienes permisos para editar el expediente médico');
      return;
    }
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form data to original values
    if (medicalRecord) {
      setFormData({
        bloodType: medicalRecord.bloodType || '',
        allergies: medicalRecord.allergies || '',
        chronicConditions: medicalRecord.chronicConditions || '',
        currentMedications: medicalRecord.currentMedications || '',
        familyHistory: medicalRecord.familyHistory || '',
        notes: medicalRecord.notes || '',
      });
    }
  };

  const handleSave = async () => {
    if (!patientId) return;

    setIsSaving(true);
    try {
      let updatedRecord: MedicalRecord;

      if (medicalRecord) {
        // Update existing record
        updatedRecord = await medicalRecordService.update(medicalRecord.id, formData);
        toast.success('Expediente médico actualizado exitosamente');
      } else {
        // Create new record
        updatedRecord = await medicalRecordService.create(patientId, formData);
        toast.success('Expediente médico creado exitosamente');
      }

      setMedicalRecord(updatedRecord);
      setIsEditMode(false);
    } catch (error: any) {
      console.error('Error saving medical record:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el expediente médico');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Paciente no encontrado</h2>
          <Button onClick={() => navigate('/patients')}>Volver a pacientes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/patients/${patientId}`)}
            className="mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver al perfil del paciente
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expediente Médico</h1>
              <p className="mt-1 text-gray-600">
                Paciente: {patient.user.firstName} {patient.user.lastName}
              </p>
            </div>

            {!isEditMode && canEdit && (
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <PencilIcon className="h-5 w-5" />
                Editar
              </Button>
            )}

            {isEditMode && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <XMarkIcon className="h-5 w-5" />
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  onClick={handleSave}
                  isLoading={isSaving}
                  className="flex items-center gap-2"
                >
                  <CheckIcon className="h-5 w-5" />
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Medical Record Form/Display */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Blood Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {isEditMode ? (
                  <Select
                    label="Tipo de Sangre"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    options={bloodTypeOptions}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Sangre
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                      {medicalRecord?.bloodType || 'No especificado'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div>
              {isEditMode ? (
                <Textarea
                  label="Alergias"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="Describir alergias conocidas..."
                  rows={3}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alergias
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md whitespace-pre-wrap">
                    {medicalRecord?.allergies || 'Sin alergias registradas'}
                  </p>
                </div>
              )}
            </div>

            {/* Chronic Conditions */}
            <div>
              {isEditMode ? (
                <Textarea
                  label="Condiciones Crónicas"
                  name="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={handleInputChange}
                  placeholder="Describir condiciones crónicas..."
                  rows={3}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condiciones Crónicas
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md whitespace-pre-wrap">
                    {medicalRecord?.chronicConditions || 'Sin condiciones crónicas registradas'}
                  </p>
                </div>
              )}
            </div>

            {/* Current Medications */}
            <div>
              {isEditMode ? (
                <Textarea
                  label="Medicamentos Actuales"
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleInputChange}
                  placeholder="Listar medicamentos actuales..."
                  rows={3}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicamentos Actuales
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md whitespace-pre-wrap">
                    {medicalRecord?.currentMedications || 'Sin medicamentos registrados'}
                  </p>
                </div>
              )}
            </div>

            {/* Family History */}
            <div>
              {isEditMode ? (
                <Textarea
                  label="Historial Familiar"
                  name="familyHistory"
                  value={formData.familyHistory}
                  onChange={handleInputChange}
                  placeholder="Describir historial médico familiar..."
                  rows={3}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Historial Familiar
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md whitespace-pre-wrap">
                    {medicalRecord?.familyHistory || 'Sin historial familiar registrado'}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              {isEditMode ? (
                <Textarea
                  label="Notas Adicionales"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notas adicionales..."
                  rows={4}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Adicionales
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md whitespace-pre-wrap">
                    {medicalRecord?.notes || 'Sin notas adicionales'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          {medicalRecord && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Creado:</span>{' '}
                  {new Date(medicalRecord.createdAt).toLocaleString('es-MX')}
                </div>
                <div>
                  <span className="font-medium">Última actualización:</span>{' '}
                  {new Date(medicalRecord.updatedAt).toLocaleString('es-MX')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info message if no medical record exists */}
        {!medicalRecord && !isEditMode && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">
              Este paciente aún no tiene un expediente médico. {canEdit && 'Haz clic en "Editar" para crear uno.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

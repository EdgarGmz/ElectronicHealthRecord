import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { MedicalRecord, Patient } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';
import { Select } from '../atoms/Select';
import { PencilIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

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

// Mock data for demo purposes
const mockPatient: Patient = {
  id: 'demo-patient-id',
  userId: 'demo-user-id',
  patientType: 'student',
  maritalStatus: 'single',
  careerId: 'demo-career-id',
  group: '5A',
  occupation: 'Estudiante',
  trimester: 5,
  user: {
    id: 'demo-user-id',
    email: 'juan.perez@universidad.edu.mx',
    firstName: 'Juan',
    lastName: 'Pérez García',
    role: 'student',
    isActive: true,
  },
};

const mockMedicalRecord: MedicalRecord = {
  id: 'demo-record-id',
  patientId: 'demo-patient-id',
  bloodType: 'O+',
  allergies: 'Alergia a la penicilina\nAlergia al polen',
  chronicConditions: 'Asma leve controlada con inhalador',
  currentMedications: 'Salbutamol 100mcg - según necesidad\nLoratadina 10mg - una vez al día',
  familyHistory: 'Padre con hipertensión\nMadre con diabetes tipo 2\nAbuelo paterno con enfermedad cardíaca',
  notes: 'Paciente activo y saludable. Practica deporte regularmente. Última revisión: enero 2026.',
  createdAt: '2025-01-15T10:00:00.000Z',
  createdBy: 'nurse-id-123',
  updatedAt: '2026-01-20T14:30:00.000Z',
  updatedBy: 'nurse-id-123',
};

export const DemoMedicalRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole, clearAuth } = useAuthStore();

  const [patient] = useState<Patient>(mockPatient);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord>(mockMedicalRecord);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bloodType: medicalRecord.bloodType || '',
    allergies: medicalRecord.allergies || '',
    chronicConditions: medicalRecord.chronicConditions || '',
    currentMedications: medicalRecord.currentMedications || '',
    familyHistory: medicalRecord.familyHistory || '',
    notes: medicalRecord.notes || '',
  });

  // Check if user has permission to edit
  const canEdit = hasRole(['admin', 'nurse', 'psychologist']);

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
    setFormData({
      bloodType: medicalRecord.bloodType || '',
      allergies: medicalRecord.allergies || '',
      chronicConditions: medicalRecord.chronicConditions || '',
      currentMedications: medicalRecord.currentMedications || '',
      familyHistory: medicalRecord.familyHistory || '',
      notes: medicalRecord.notes || '',
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update mock record
    const updatedRecord: MedicalRecord = {
      ...medicalRecord,
      ...formData,
      updatedAt: new Date().toISOString(),
    };
    
    setMedicalRecord(updatedRecord);
    setIsEditMode(false);
    setIsSaving(false);
    toast.success('Expediente médico actualizado exitosamente (DEMO)');
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/demo-login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Demo Banner */}
        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Modo Demo</strong> - Los cambios no se guardan realmente. Esto es solo una demostración de la interfaz.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Cambiar Rol
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
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

            {!canEdit && !isEditMode && (
              <div className="bg-gray-100 px-4 py-2 rounded-md">
                <span className="text-sm text-gray-600">Solo lectura</span>
              </div>
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
                      {medicalRecord.bloodType || 'No especificado'}
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
                    {medicalRecord.allergies || 'Sin alergias registradas'}
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
                    {medicalRecord.chronicConditions || 'Sin condiciones crónicas registradas'}
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
                    {medicalRecord.currentMedications || 'Sin medicamentos registrados'}
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
                    {medicalRecord.familyHistory || 'Sin historial familiar registrado'}
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
                    {medicalRecord.notes || 'Sin notas adicionales'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
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
        </div>
      </div>
    </div>
  );
};

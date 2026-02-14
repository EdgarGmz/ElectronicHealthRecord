import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../atoms/Badge';
import { PersonalInfoCard } from '../molecules/PersonalInfoCard';
import { AcademicInfoCard } from '../molecules/AcademicInfoCard';
import { EmergencyContactsCard } from '../molecules/EmergencyContactsCard';
import { Tabs } from '../molecules/Tabs';
import { AppointmentsTab } from '../organisms/AppointmentsTab';
import { MedicalRecordsTab } from '../organisms/MedicalRecordsTab';
import { PsychologyTab } from '../organisms/PsychologyTab';
import type { Student } from '../../types/student.types';

const mockStudent: Student = {
  id: 'demo-123',
  userId: 'user-123',
  patientType: 'Estudiante',
  maritalStatus: 'Soltero',
  guardianName: 'María González López',
  guardianPhone: '+52 (662) 123-4567',
  careerId: 'career-1',
  group: 'A-301',
  occupation: 'Estudiante',
  trimester: 5,
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-02-14T00:00:00.000Z',
  user: {
    id: 'user-123',
    email: 'juan.perez@universidad.edu.mx',
    firstName: 'Juan Carlos',
    lastName: 'Pérez Martínez',
    dateOfBirth: '2002-05-15T00:00:00.000Z',
    phone: '+52 (662) 987-6543',
    enrollmentNumber: '2021030145',
    isActive: true,
  },
  career: {
    id: 'career-1',
    name: 'Ingeniería en Sistemas Computacionales',
    code: 'ISC',
    isActive: true,
  },
  emergencyContacts: [
    {
      id: 'contact-1',
      name: 'María González López',
      relationship: 'Madre',
      phone: '+52 (662) 123-4567',
      email: 'maria.gonzalez@email.com',
      patientId: 'demo-123',
    },
    {
      id: 'contact-2',
      name: 'Roberto Pérez García',
      relationship: 'Padre',
      phone: '+52 (662) 765-4321',
      email: 'roberto.perez@email.com',
      patientId: 'demo-123',
    },
  ],
};

export const StudentProfileDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const student = mockStudent;

  const tabs = [
    {
      id: 'medical-records',
      label: 'Expediente Médico',
      content: <MedicalRecordsTab studentId={student.id} />,
    },
    {
      id: 'appointments',
      label: 'Historial de Citas',
      content: <AppointmentsTab studentId={student.id} />,
    },
    {
      id: 'psychology',
      label: 'Evaluaciones Psicológicas',
      content: <PsychologyTab studentId={student.id} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Demo Banner */}
        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Modo Demo:</strong> Esta es una vista de demostración con datos de ejemplo. En producción, los datos se cargarían desde el backend.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/students')}
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a estudiantes
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {student.user.firstName} {student.user.lastName}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {student.user.enrollmentNumber && `Matrícula: ${student.user.enrollmentNumber}`}
              </p>
            </div>
            <Badge variant={student.user.isActive ? 'success' : 'danger'}>
              {student.user.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <PersonalInfoCard student={student} />
          <AcademicInfoCard student={student} />
          <EmergencyContactsCard contacts={student.emergencyContacts} />
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Tabs tabs={tabs} />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-end">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar Perfil
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Agendar Cita
          </button>
        </div>
      </div>
    </div>
  );
};

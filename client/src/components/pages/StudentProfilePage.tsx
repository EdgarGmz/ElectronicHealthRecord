import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudent } from '../../hooks/useStudent';
import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { PersonalInfoCard } from '../molecules/PersonalInfoCard';
import { AcademicInfoCard } from '../molecules/AcademicInfoCard';
import { EmergencyContactsCard } from '../molecules/EmergencyContactsCard';
import { Tabs } from '../molecules/Tabs';
import { AppointmentsTab } from '../organisms/AppointmentsTab';
import { MedicalRecordsTab } from '../organisms/MedicalRecordsTab';
import { PsychologyTab } from '../organisms/PsychologyTab';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { student, loading, error, refetch } = useStudent(id!);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando perfil del estudiante...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error al cargar</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6 space-x-3">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Reintentar
              </button>
              <button
                onClick={() => navigate('/students')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Volver
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Estudiante no encontrado</h3>
            <p className="mt-2 text-sm text-gray-500">
              El estudiante que buscas no existe o ha sido eliminado.
            </p>
            <button
              onClick={() => navigate('/students')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Volver a la lista
            </button>
          </div>
        </Card>
      </div>
    );
  }

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

import React from 'react';
import { Card } from '../atoms/Card';
import type { Student } from '../../types/student.types';

interface PersonalInfoCardProps {
  student: Student;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ student }) => {
  const { user } = student;
  
  return (
    <Card title="Información Personal">
      <div className="space-y-3">
        <InfoRow label="Nombre Completo" value={`${user.firstName} ${user.lastName}`} />
        <InfoRow label="Matrícula" value={user.enrollmentNumber || 'N/A'} />
        <InfoRow label="Correo Electrónico" value={user.email} />
        <InfoRow label="Teléfono" value={user.phone || 'N/A'} />
        <InfoRow 
          label="Fecha de Nacimiento" 
          value={new Date(user.dateOfBirth).toLocaleDateString('es-MX')} 
        />
        <InfoRow label="Estado Civil" value={student.maritalStatus || 'N/A'} />
        {student.guardianName && (
          <>
            <InfoRow label="Nombre del Tutor" value={student.guardianName} />
            <InfoRow label="Teléfono del Tutor" value={student.guardianPhone || 'N/A'} />
          </>
        )}
      </div>
    </Card>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
};

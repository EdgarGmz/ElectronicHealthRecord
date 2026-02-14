import React from 'react';
import { Card } from '../atoms/Card';
import type { Student } from '../../types/student.types';
import { Badge } from '../atoms/Badge';

interface AcademicInfoCardProps {
  student: Student;
}

export const AcademicInfoCard: React.FC<AcademicInfoCardProps> = ({ student }) => {
  const { career } = student;
  
  return (
    <Card title="Información Académica">
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-600">Carrera:</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{career.name}</p>
            {career.code && (
              <p className="text-xs text-gray-500">{career.code}</p>
            )}
          </div>
        </div>
        
        {student.group && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Grupo:</span>
            <Badge variant="info">{student.group}</Badge>
          </div>
        )}
        
        {student.trimester && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Trimestre:</span>
            <span className="text-sm text-gray-900">{student.trimester}</span>
          </div>
        )}
        
        {student.occupation && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Ocupación:</span>
            <span className="text-sm text-gray-900">{student.occupation}</span>
          </div>
        )}
        
        <div className="flex justify-between py-2">
          <span className="text-sm font-medium text-gray-600">Tipo de Paciente:</span>
          <Badge variant="default">{student.patientType}</Badge>
        </div>
      </div>
    </Card>
  );
};

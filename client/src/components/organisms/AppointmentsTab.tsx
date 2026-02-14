import React from 'react';
import { Card } from '../atoms/Card';

interface AppointmentsTabProps {
  studentId: string;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = () => {
  return (
    <div className="space-y-4">
      <Card>
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Historial de Citas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Las citas del estudiante aparecerán aquí
          </p>
        </div>
      </Card>
    </div>
  );
};

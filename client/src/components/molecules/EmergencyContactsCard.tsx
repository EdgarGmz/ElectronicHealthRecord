import React from 'react';
import { Card } from '../atoms/Card';
import type { EmergencyContact } from '../../types/student.types';

interface EmergencyContactsCardProps {
  contacts?: EmergencyContact[];
}

export const EmergencyContactsCard: React.FC<EmergencyContactsCardProps> = ({ contacts }) => {
  if (!contacts || contacts.length === 0) {
    return (
      <Card title="Contactos de Emergencia">
        <p className="text-sm text-gray-500 italic">No hay contactos de emergencia registrados</p>
      </Card>
    );
  }
  
  return (
    <Card title="Contactos de Emergencia">
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
            <p className="text-xs text-gray-600 mt-1">Relación: {contact.relationship}</p>
            <p className="text-xs text-gray-600">Teléfono: {contact.phone}</p>
            {contact.email && (
              <p className="text-xs text-gray-600">Email: {contact.email}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../atoms/Button';
import { Select } from '../atoms/Select';

export const DemoLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState('psychologist');

  const handleLogin = () => {
    // Mock user based on selected role
    const mockUser = {
      userId: 'demo-user-123',
      email: 'demo@example.com',
      role: selectedRole,
      firstName: 'Demo',
      lastName: 'User',
    };

    const mockToken = 'demo-token-123';
    
    setAuth(mockUser, mockToken);
    navigate('/demo/medical-record');
  };

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'psychologist', label: 'Psicólogo' },
    { value: 'nurse', label: 'Enfermero' },
    { value: 'student', label: 'Estudiante (Solo lectura)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Expedientes Médicos
          </h1>
          <p className="text-gray-600">Modo Demo - Selecciona un rol para continuar</p>
        </div>

        <div className="space-y-6">
          <Select
            label="Selecciona tu rol"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            options={roles}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
            <p className="text-blue-800 font-medium mb-2">Información del demo:</p>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li><strong>Admin/Enfermero/Psicólogo:</strong> Pueden editar el expediente</li>
              <li><strong>Estudiante:</strong> Solo puede ver el expediente</li>
              <li>No se requiere conexión al backend</li>
            </ul>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
          >
            Ingresar al Demo
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Este es un modo de demostración. Los datos no se guardan realmente.
          </p>
        </div>
      </div>
    </div>
  );
};

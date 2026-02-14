import React from 'react';
import { useNavigate } from 'react-router-dom';

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Lista de Estudiantes</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-4">
            Esta es una página placeholder. En producción, aquí se mostraría una lista completa de estudiantes.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Para probar el perfil de estudiante, puedes ver la versión demo con datos de ejemplo.
          </p>
          
          <button
            onClick={() => navigate('/students/demo')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Ver Perfil Demo con Datos de Ejemplo
          </button>
        </div>
      </div>
    </div>
  );
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatients, createPatient } from '@/services/patient.service';
import { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Plus } from 'lucide-react';
import Modal from '@/components/organisms/Modal';
import NewPatientForm from '@/components/patients/NewPatientForm';
import type { CreatePatientInput } from '@/types/patient.schema';

// Placeholder for a more complex DataTable component
const DataTable = ({ data, columns }: { data: any[], columns: any[] }) => (
  <div className="overflow-x-auto bg-white rounded-lg shadow">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((col) => (
            <th key={col.accessor} className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {col.Header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col.accessor} className="px-6 py-4 whitespace-nowrap">
                {row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


export default function PatientListPage() {
  const [page] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', page],
    queryFn: () => getPatients(page),
  });

  const createPatientMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("Error creating patient:", error);
    }
  });

  const handleCreatePatient = (formData: CreatePatientInput) => {
    const dataToSubmit = { ...formData, role: 'patient' };
    createPatientMutation.mutate(dataToSubmit);
  };

  const columns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Enrollment #', accessor: 'enrollmentNumber' },
    { Header: 'Career', accessor: 'career' },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Actions', accessor: 'actions' },
  ];
  
  const formattedData = data?.patients.map(p => ({
    id: p.id, // Add id for linking
    name: `${p.user.firstName} ${p.user.lastName}`,
    enrollmentNumber: p.user.enrollmentNumber,
    career: p.career.name,
    status: p.user.isActive ? 'Active' : 'Inactive',
    actions: (
      <Link to={`/patients/${p.id}`} className="text-primary hover:underline">
        Details
      </Link>
    )
  })) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Patients</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Patient
        </button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error fetching patients: {error.message}</p>}
      {data && <DataTable columns={columns} data={formattedData} />}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Patient"
      >
        <NewPatientForm 
          onSubmit={handleCreatePatient}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createPatientMutation.isPending}
        />
      </Modal>
    </div>
  );
}

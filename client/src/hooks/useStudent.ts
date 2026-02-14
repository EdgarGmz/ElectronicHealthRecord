import { useState, useEffect } from 'react';
import type { Student } from '../types/student.types';
import studentService from '../services/student.service';

interface UseStudentReturn {
  student: Student | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStudent = (id: string): UseStudentReturn => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getById(id);
      setStudent(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar el estudiante';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  return { student, loading, error, refetch: fetchStudent };
};

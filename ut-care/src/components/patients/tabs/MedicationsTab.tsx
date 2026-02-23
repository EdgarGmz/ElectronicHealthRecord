import type { Patient } from '@/types/patient';
import { Pill } from 'lucide-react';

/**
 * Pestaña de medicamentos. Las prescripciones fueron eliminadas del sistema
 * (la universidad no puede prescribir). Solo se muestra información al respecto.
 */
export default function MedicationsTab({ patient }: { patient: Patient }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Pill className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Medicamentos</h3>
      </div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
        <p className="font-medium">Prescripciones no disponibles</p>
        <p className="mt-1 text-sm">
          Las prescripciones médicas no forman parte del sistema (la universidad no puede prescribir).
          El inventario de medicamentos del centro se gestiona en el módulo correspondiente.
        </p>
      </div>
    </div>
  );
}

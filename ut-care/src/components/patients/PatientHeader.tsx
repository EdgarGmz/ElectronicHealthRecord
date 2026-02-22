import type { Patient } from "@/types/patient";
import { User, Mail, Phone, Briefcase, GraduationCap } from "lucide-react";

interface PatientHeaderProps {
  patient: Patient;
}

export default function PatientHeader({ patient }: PatientHeaderProps) {
  const patientName = `${patient.user.firstName} ${patient.user.lastName}`;
  const age = new Date().getFullYear() - new Date(patient.user.dateOfBirth).getFullYear();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full">
            <User className="w-8 h-8 text-gray-600" />
          </span>
        </div>
        <div className="ml-6">
          <h1 className="text-3xl font-bold text-gray-900">{patientName}</h1>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2 text-sm text-gray-600">
            <InfoItem icon={Mail} text={patient.user.email} />
            <InfoItem icon={Phone} text={patient.user.phone || 'N/A'} />
            <InfoItem icon={Briefcase} text={`${age} years old`} />
            <InfoItem icon={GraduationCap} text={patient.career.name} />
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
  <div className="flex items-center">
    <Icon className="w-4 h-4 mr-2 text-gray-400" />
    <span>{text}</span>
  </div>
);

import Tabs from "@/components/organisms/Tabs";
import type { Patient } from "@/types/patient";
import TherapySessionsTab from "./tabs/TherapySessionsTab";
import AppointmentsTab from "./tabs/AppointmentsTab";
import MedicationsTab from "./tabs/MedicationsTab";
import PsychometricEvaluationsTab from "./tabs/PsychometricEvaluationsTab";
import DiagnosesTab from "./tabs/DiagnosesTab";
import HistoryTab from "./tabs/HistoryTab";
import NursingProceduresTab from "./tabs/NursingProceduresTab";
import InterconsultationsTab from "./tabs/InterconsultationsTab";
import AttachedDocumentsTab from "./tabs/AttachedDocumentsTab"; // Import AttachedDocumentsTab

interface MedicalRecordTabsProps {
    patient: Patient;
}

const GeneralInfoTab = ({ patient }: MedicalRecordTabsProps) => (
    <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold">General Information</h3>
        <div className="grid grid-cols-2 gap-4">
            <div><strong>Email:</strong> {patient.user.email}</div>
            <div><strong>Phone:</strong> {patient.user.phone || 'N/A'}</div>
            <div><strong>Enrollment #:</strong> {patient.user.enrollmentNumber}</div>
            <div><strong>Career:</strong> {patient.career.name}</div>
            <div><strong>Marital Status:</strong> {patient.maritalStatus || 'N/A'}</div>
            <div><strong>Occupation:</strong> {patient.occupation || 'N/A'}</div>
        </div>
    </div>
);

export default function MedicalRecordTabs({ patient }: MedicalRecordTabsProps) {
    const tabs = [
        { label: 'General Info', content: <GeneralInfoTab patient={patient} /> },
        { label: 'History', content: <HistoryTab patient={patient} /> },
        { label: 'Appointments', content: <AppointmentsTab patient={patient} /> },
        { label: 'Therapy Sessions', content: <TherapySessionsTab patient={patient} /> },
        { label: 'Evaluations', content: <PsychometricEvaluationsTab patient={patient} /> },
        { label: 'Diagnoses', content: <DiagnosesTab patient={patient} /> },
        { label: 'Medications', content: <MedicationsTab patient={patient} /> },
        { label: 'Nursing Procedures', content: <NursingProceduresTab patient={patient} /> },
        { label: 'Interconsultations', content: <InterconsultationsTab patient={patient} /> },
        { label: 'Documents', content: <AttachedDocumentsTab patient={patient} /> }, // Add AttachedDocumentsTab
    ];

    return <Tabs tabs={tabs} />;
}

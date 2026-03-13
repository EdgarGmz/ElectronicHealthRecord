import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleGuard } from '@/components/RoleGuard'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PatientListPage } from '@/pages/patients/PatientListPage'
import { PatientDetailPage } from '@/pages/patients/PatientDetailPage'
import { PatientExpedientPage } from '@/pages/patients/PatientExpedientPage'
import { NewPatientPage } from '@/pages/patients/NewPatientPage'
import { AppointmentListPage } from '@/pages/appointments/AppointmentListPage'
import { AppointmentDetailPage } from '@/pages/appointments/AppointmentDetailPage'
import { NewAppointmentPage } from '@/pages/appointments/NewAppointmentPage'
import { SessionListPage } from '@/pages/sessions/SessionListPage'
import { SessionDetailPage } from '@/pages/sessions/SessionDetailPage'
import { NewSessionPage } from '@/pages/sessions/NewSessionPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { MedicationListPage } from '@/pages/medications/MedicationListPage'
import { MedicationDetailPage } from '@/pages/medications/MedicationDetailPage'
import { NewMedicationPage } from '@/pages/medications/NewMedicationPage'
import { ProcedureListPage } from '@/pages/procedures/ProcedureListPage'
import { ProcedureDetailPage } from '@/pages/procedures/ProcedureDetailPage'
import { NewProcedurePage } from '@/pages/procedures/NewProcedurePage'
import { InterconsultationListPage } from '@/pages/interconsultations/InterconsultationListPage'
import { InterconsultationDetailPage } from '@/pages/interconsultations/InterconsultationDetailPage'
import { NewInterconsultationPage } from '@/pages/interconsultations/NewInterconsultationPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { EvaluationListPage } from '@/pages/evaluations/EvaluationListPage'
import { EvaluationDetailPage } from '@/pages/evaluations/EvaluationDetailPage'
import { NewEvaluationPage } from '@/pages/evaluations/NewEvaluationPage'
import { NotificationListPage } from '@/pages/notifications/NotificationListPage'
import { NotificationDetailPage } from '@/pages/notifications/NotificationDetailPage'
import { NewNotificationPage } from '@/pages/notifications/NewNotificationPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { HelpPage } from '@/pages/help/HelpPage'
import { AuditLogsPage } from '@/pages/audit-logs/AuditLogsPage'
import { UsersPage } from '@/pages/users/UsersPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<RoleGuard><PatientListPage /></RoleGuard>} />
          <Route path="patients/new" element={<RoleGuard><NewPatientPage /></RoleGuard>} />
          <Route path="patients/:id" element={<RoleGuard><PatientDetailPage /></RoleGuard>} />
          <Route path="patients/:id/expedient" element={<RoleGuard><PatientExpedientPage /></RoleGuard>} />
          <Route path="appointments" element={<RoleGuard><AppointmentListPage /></RoleGuard>} />
          <Route path="appointments/new" element={<RoleGuard><NewAppointmentPage /></RoleGuard>} />
          <Route path="appointments/:id" element={<RoleGuard><AppointmentDetailPage /></RoleGuard>} />
          <Route path="sessions" element={<RoleGuard><SessionListPage /></RoleGuard>} />
          <Route path="sessions/new" element={<RoleGuard><NewSessionPage /></RoleGuard>} />
          <Route path="sessions/:id" element={<RoleGuard><SessionDetailPage /></RoleGuard>} />
          <Route path="medications" element={<RoleGuard><MedicationListPage /></RoleGuard>} />
          <Route path="medications/new" element={<RoleGuard><NewMedicationPage /></RoleGuard>} />
          <Route path="medications/:id" element={<RoleGuard><MedicationDetailPage /></RoleGuard>} />
          <Route path="procedures" element={<RoleGuard><ProcedureListPage /></RoleGuard>} />
          <Route path="procedures/new" element={<RoleGuard><NewProcedurePage /></RoleGuard>} />
          <Route path="procedures/:id" element={<RoleGuard><ProcedureDetailPage /></RoleGuard>} />
          <Route path="interconsultations" element={<InterconsultationListPage />} />
          <Route path="interconsultations/new" element={<NewInterconsultationPage />} />
          <Route path="interconsultations/:id" element={<InterconsultationDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="evaluations" element={<RoleGuard><EvaluationListPage /></RoleGuard>} />
          <Route path="evaluations/new" element={<RoleGuard><NewEvaluationPage /></RoleGuard>} />
          <Route path="evaluations/:id" element={<RoleGuard><EvaluationDetailPage /></RoleGuard>} />
          <Route path="notifications" element={<NotificationListPage />} />
          <Route path="notifications/new" element={<NewNotificationPage />} />
          <Route path="notifications/:id" element={<NotificationDetailPage />} />
          <Route path="users" element={<RoleGuard><UsersPage /></RoleGuard>} />
          <Route path="audit-logs" element={<RoleGuard><AuditLogsPage /></RoleGuard>} />
          <Route path="admin" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

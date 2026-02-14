import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MedicalRecordPage } from './components/pages/MedicalRecordPage';
import { DemoLoginPage } from './components/pages/DemoLoginPage';
import { DemoMedicalRecordPage } from './components/pages/DemoMedicalRecordPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Routes>
          {/* Demo routes - no backend required */}
          <Route path="/" element={<Navigate to="/demo-login" replace />} />
          <Route path="/demo-login" element={<DemoLoginPage />} />
          <Route path="/demo/medical-record" element={<DemoMedicalRecordPage />} />
          
          {/* Real routes - require backend */}
          <Route path="/patients/:patientId/medical-record" element={<MedicalRecordPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

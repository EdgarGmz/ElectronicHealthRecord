import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './layouts/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import { useAuthStore } from './store/auth.store';
import QueryProvider from './layouts/QueryProvider';
import PatientListPage from './pages/patients/PatientListPage';
import PatientDetailPage from './pages/patients/PatientDetailPage';
import DashboardPage from './pages/dashboard/DashboardPage'; // Import DashboardPage

function App() {
  const { isLoggedIn } = useAuthStore();

  return (
    <QueryProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} /> {/* Use DashboardPage */}
              <Route path="/patients" element={<PatientListPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              {/* Add other protected routes here */}
            </Route>
          </Route>
          
          <Route 
            path="/" 
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
          />
          
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </QueryProvider>
  );
}

export default App;

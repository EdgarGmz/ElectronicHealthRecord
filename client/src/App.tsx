import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StudentsListPage } from './components/pages/StudentsListPage';
import { StudentProfilePage } from './components/pages/StudentProfilePage';
import { StudentProfileDemoPage } from './components/pages/StudentProfileDemoPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/students" replace />} />
        <Route path="/students" element={<StudentsListPage />} />
        <Route path="/students/demo" element={<StudentProfileDemoPage />} />
        <Route path="/students/:id" element={<StudentProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;

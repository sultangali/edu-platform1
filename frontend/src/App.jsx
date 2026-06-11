import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Modules from './pages/Modules.jsx';
import ModuleDetail from './pages/ModuleDetail.jsx';
import CaseDetail from './pages/CaseDetail.jsx';
import Live from './pages/Live.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">⏳</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/modules" element={<Protected><Modules /></Protected>} />
        <Route path="/modules/:id" element={<Protected><ModuleDetail /></Protected>} />
        <Route path="/cases/:id" element={<Protected><CaseDetail /></Protected>} />
        <Route path="/live" element={<Protected><Live /></Protected>} />
        <Route path="/profile" element={<Protected role="student"><StudentProfile /></Protected>} />
        <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
        <Route path="/teacher" element={<Protected role="teacher"><TeacherDashboard /></Protected>} />
        <Route path="/admin" element={<Protected role="admin"><AdminPanel /></Protected>} />
      </Routes>
    </div>
  );
}

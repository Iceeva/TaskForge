import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/Dashboard';
import ProjectPage from './pages/Project';
import ProjectAnalytics from './pages/ProjectAnalytics';
import ProjectSprints from './pages/ProjectSprints';
import SettingsPage from './pages/Settings';
import TeamPage from './pages/Team';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="project/:id" element={<ProjectPage />} />
        <Route path="project/:id/analytics" element={<ProjectAnalytics />} />
        <Route path="project/:id/sprints" element={<ProjectSprints />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="team" element={<TeamPage />} />
      </Route>
    </Routes>
  );
}

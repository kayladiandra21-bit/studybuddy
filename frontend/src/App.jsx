// App.jsx — the route table.
// Pages marked "(Step 6/7)" are temporary placeholders for now.
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import Spinner from './components/ui/Spinner';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Pomodoro from './pages/Pomodoro';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';

/** Wraps pages that require login (optionally a specific role) */
function Protected({ children, role }) {
  const { user, booting } = useAuth();
  if (booting) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Logged-in app */}
      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin only */}
      <Route
        element={
          <Protected role="admin">
            <AppLayout />
          </Protected>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

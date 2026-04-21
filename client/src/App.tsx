import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { ReactNode } from 'react';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';

// App pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { MyApplicationsPage } from '@/pages/applications/MyApplicationsPage';
import { NewApplicationPage } from '@/pages/applications/NewApplicationPage';
import { ApplicationSubmittedPage } from '@/pages/applications/ApplicationSubmittedPage';

// Layout
import { AppLayout } from '@/components/layout/AppLayout';

// Auth state
import { selectIsAuthenticated } from '@/features/auth/model/selectors';

// ── Protected route ──────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

// ── Auth guard (redirect authenticated users away from auth pages) ────────────

function PublicRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes (public only) */}
      <Route path="/auth/login"            element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/auth/register"         element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/auth/forgot-password"  element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/auth/reset"            element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      <Route path="/auth/verify"           element={<VerifyEmailPage />} />

      {/* Protected app routes */}
      <Route path="/dashboard"             element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/applications"          element={<ProtectedRoute><MyApplicationsPage /></ProtectedRoute>} />
      <Route path="/applications/new"      element={<ProtectedRoute><NewApplicationPage /></ProtectedRoute>} />
      <Route path="/applications/:id/edit" element={<ProtectedRoute><NewApplicationPage /></ProtectedRoute>} />
      <Route path="/applications/:id/submitted" element={<ProtectedRoute><ApplicationSubmittedPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

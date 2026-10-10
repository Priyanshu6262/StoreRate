import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute, RoleRoute } from './RoleRoute';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages - Lazy loaded for optimal performance (Requirement 24)
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const ChangePasswordPage = lazy(() => import('../pages/shared/ChangePasswordPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminCreateUserPage = lazy(() => import('../pages/admin/AdminCreateUserPage'));
const AdminStoresPage = lazy(() => import('../pages/admin/AdminStoresPage'));
const UserDashboardPage = lazy(() => import('../pages/user/UserDashboardPage'));
const OwnerDashboardPage = lazy(() => import('../pages/owner/OwnerDashboardPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Route Root Component that directs user to their specific dashboard or login
const RootRedirect = () => {
  const { user, isAuthenticated, loading, getDashboardRouteForRole } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardRouteForRole(user?.role)} replace />;
};

const LoadingFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated, user, getDashboardRouteForRole } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Index Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth routes (only accessible if not logged in) */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={getDashboardRouteForRole(user?.role)} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to={getDashboardRouteForRole(user?.role)} replace />
              ) : (
                <SignupPage />
              )
            }
          />
        </Route>

        {/* Authenticated Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Shared Change Password Route */}
            <Route path="/change-password" element={<ChangePasswordPage />} />

            {/* Admin Exclusive Routes */}
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/users/create" element={<AdminCreateUserPage />} />
              <Route path="/admin/stores" element={<AdminStoresPage />} />
            </Route>

            {/* Normal User Routes */}
            <Route element={<RoleRoute allowedRoles={['USER', 'ADMIN']} />}>
              <Route path="/user/dashboard" element={<UserDashboardPage />} />
            </Route>

            {/* Store Owner Routes */}
            <Route element={<RoleRoute allowedRoles={['STORE_OWNER']} />}>
              <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Catch All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

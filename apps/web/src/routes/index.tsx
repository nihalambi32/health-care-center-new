import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';

// Pages
import { LandingPage } from '@/pages/Landing';
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/Auth';
import { DashboardPage } from '@/pages/Dashboard';
import { LogsPage } from '@/pages/Logs';
import { MedicinesPage } from '@/pages/Medicines';
import { RemindersPage } from '@/pages/Reminders';
import { AppointmentsPage } from '@/pages/Appointments';
import { AnalyticsPage } from '@/pages/Analytics';
import { AssistantPage } from '@/pages/Assistant';
import { SettingsPage } from '@/pages/Settings';
import { NotFoundPage } from '@/pages/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Authenticated Protected Clinical Portal */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/medicines" element={<MedicinesPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

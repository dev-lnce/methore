import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioAlertProvider } from './context/AudioAlertContext';
import { ThemeProvider } from './context/ThemeContext';

import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import LiveIncidentsPage from './pages/LiveIncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import OfflineMapPage from './pages/OfflineMapPage';
import IncidentHistoryPage from './pages/IncidentHistoryPage';
import ResidentsAdminPage from './pages/ResidentsAdminPage';
import NetworkStatusPage from './pages/NetworkStatusPage';
import EvaluationLabPage from './pages/EvaluationLabPage';
import HandheldSimulatorPage from './pages/HandheldSimulatorPage';

// Simple guard: redirects to login if user logged out
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Role-based route guard
function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/incidents" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AudioAlertProvider>
        <BrowserRouter>
          <Routes>
            {/* Public local login route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated layout routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect to Live Incidents */}
              <Route index element={<Navigate to="/incidents" replace />} />

              {/* Core Operational Views */}
              <Route path="incidents" element={<LiveIncidentsPage />} />
              <Route path="incidents/:id" element={<IncidentDetailPage />} />
              <Route path="map" element={<OfflineMapPage />} />
              <Route path="history" element={<IncidentHistoryPage />} />

              {/* Admin Views */}
              <Route
                path="admin/residents"
                element={
                  <RoleRoute allowedRoles={['administrator']}>
                    <ResidentsAdminPage />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/network"
                element={
                  <RoleRoute allowedRoles={['administrator', 'researcher']}>
                    <NetworkStatusPage />
                  </RoleRoute>
                }
              />

              {/* Researcher & Evaluation View */}
              <Route
                path="research/evaluation"
                element={
                  <RoleRoute allowedRoles={['administrator', 'researcher']}>
                    <EvaluationLabPage />
                  </RoleRoute>
                }
              />

              {/* Handheld Device Interface Simulator */}
              <Route path="handheld" element={<HandheldSimulatorPage />} />

              {/* Fallback Catch-all */}
              <Route path="*" element={<Navigate to="/incidents" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AudioAlertProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

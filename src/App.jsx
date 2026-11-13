import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FormViewPage from './pages/FormViewPage';
import UsersPage from './pages/UsersPage';
import ToolHandoverViewPage from './pages/ToolHandoverViewPage';
import FOPRecordPage from './pages/FOPRecordPage';
import HourlyProductionMonitoringPage from './pages/HourlyProductionMonitoringPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>

          <BrowserRouter basename="/satavikas">
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes inside AppLayout */}
              <Route element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/hourly-production-monitoring" element={<HourlyProductionMonitoringPage />} />
                <Route path="/fop-record" element={<FOPRecordPage />} />
                <Route path="/form/:id" element={<FormViewPage />} />
                <Route path="/tool-handover/:id" element={<ToolHandoverViewPage />} />
                <Route path="/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <UsersPage />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

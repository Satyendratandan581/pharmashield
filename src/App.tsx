import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MedicineProvider } from './context/MedicineContext';
import { ToastProvider } from './components/Toast';
import { AppLayout } from './components/AppLayout';
import { RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { AlertsPage } from './pages/AlertsPage';

export function App() {
  return (
    <ToastProvider>
      <MedicineProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/medicines" element={<MedicinesPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MedicineProvider>
    </ToastProvider>
  );
}

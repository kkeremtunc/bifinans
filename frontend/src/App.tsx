import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BudgetPage } from './pages/BudgetPage';
import { AssetPage } from './pages/AssetPage';
import { ContentPage } from './pages/ContentPage';
import { SupportPage } from './pages/SupportPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { GlossaryGuidePage } from './pages/GlossaryGuidePage';
import { LiveMarketPage } from './pages/LiveMarketPage';
import { MarketDetailPage } from './pages/MarketDetailPage';
import { AiAnalysisPage } from './pages/AiAnalysisPage';
import { ComparePage } from './pages/ComparePage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes inside MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/canli-piyasa" element={<LiveMarketPage />} />
              <Route path="/canli-piyasa/:symbol" element={<MarketDetailPage />} />
              <Route path="/yapay-zeka-analiz" element={<AiAnalysisPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/rehber" element={<GlossaryGuidePage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Budget & Asset: Standard Users & Super Admin */}
              <Route
                element={<ProtectedRoute allowedRoles={['STANDART_KULLANICI', 'SUPER_ADMIN']} />}
              >
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/assets" element={<AssetPage />} />
              </Route>

              {/* Financial News & Bulletin */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'STANDART_KULLANICI',
                      'ICERIK_YONETICI',
                      'BIRIM_YONETICI',
                      'SUPER_ADMIN',
                    ]}
                  />
                }
              >
                <Route path="/content" element={<ContentPage />} />
              </Route>

              {/* Support Tickets */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={['STANDART_KULLANICI', 'BIRIM_YONETICI', 'SUPER_ADMIN']}
                  />
                }
              >
                <Route path="/tickets" element={<SupportPage />} />
              </Route>

              {/* System Analytics: General Coordinator & Super Admin */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['GENEL_KOORDINATOR', 'SUPER_ADMIN']} />
                }
              >
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>

              {/* Super Admin Audit Logs & Management */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/admin/audit" element={<AdminAuditPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

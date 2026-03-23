import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { QuestTemplatesPage } from './pages/QuestTemplatesPage';
import { DailyQuestsPage } from './pages/DailyQuestsPage';
import { UserStatsPage } from './pages/UserStatsPage';
import { useAuth } from './auth/AuthContext';

export const App: React.FC = () => {
  const { loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="content">Lade…</div>;
  }

  if (!isAdmin) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/quests/templates" element={<QuestTemplatesPage />} />
        <Route path="/quests/daily" element={<DailyQuestsPage />} />
        <Route path="/users/stats" element={<UserStatsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};


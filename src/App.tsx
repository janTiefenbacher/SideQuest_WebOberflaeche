import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { QuestTemplatesPage } from './pages/QuestTemplatesPage';
import { DailyQuestsPage } from './pages/DailyQuestsPage';
import { UserStatsPage } from './pages/UserStatsPage';

export const App: React.FC = () => {
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


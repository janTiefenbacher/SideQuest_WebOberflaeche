import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface Counts {
  openReports: number;
  totalPosts: number;
  totalQuestTemplates: number;
  totalUsersWithStats: number;
}

export const DashboardPage: React.FC = () => {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [reportsRes, postsRes, templatesRes, statsRes] = await Promise.all([
          supabase.from('post_reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
          supabase.from('posts').select('id', { count: 'exact', head: true }),
          supabase.from('quest_templates').select('id', { count: 'exact', head: true }),
          supabase.from('user_quest_stats').select('id', { count: 'exact', head: true })
        ]);

        if (reportsRes.error) throw reportsRes.error;
        if (postsRes.error) throw postsRes.error;
        if (templatesRes.error) throw templatesRes.error;
        if (statsRes.error) throw statsRes.error;

        setCounts({
          openReports: reportsRes.count ?? 0,
          totalPosts: postsRes.count ?? 0,
          totalQuestTemplates: templatesRes.count ?? 0,
          totalUsersWithStats: statsRes.count ?? 0
        });
      } catch (e: any) {
        setError(e.message ?? 'Fehler beim Laden der Übersicht');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="page-title">Übersicht</h1>
      <p className="page-subtitle">
        Schnellblick über Moderation (Reports/Tickets) und Quest-System deiner App.
      </p>

      {error && <div className="card">Fehler: {error}</div>}

      <div className="grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Offene Reports</span>
            <span className="badge">
              <span className="status-dot status-dot-red" />
              Moderation
            </span>
          </div>
          <div className="card-value">{loading || !counts ? '–' : counts.openReports}</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Posts im System</span>
            <span className="badge">Content</span>
          </div>
          <div className="card-value">{loading || !counts ? '–' : counts.totalPosts}</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Aktive Quest-Vorlagen</span>
            <span className="badge">Quests</span>
          </div>
          <div className="card-value">
            {loading || !counts ? '–' : counts.totalQuestTemplates}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">User mit Quest-Stats</span>
            <span className="badge">
              <span className="status-dot status-dot-green" />
              Engagement
            </span>
          </div>
          <div className="card-value">
            {loading || !counts ? '–' : counts.totalUsersWithStats}
          </div>
        </div>
      </div>
    </div>
  );
};


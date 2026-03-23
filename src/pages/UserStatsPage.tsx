import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface UserStatsRow {
  id: string;
  user_id: string;
  total_points: number;
  total_quests_completed: number;
  easy_quests_completed: number;
  medium_quests_completed: number;
  hard_quests_completed: number;
  current_streak: number;
  longest_streak: number;
  last_quest_date: string | null;
}

export const UserStatsPage: React.FC = () => {
  const [rows, setRows] = useState<UserStatsRow[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: qError } = await supabase
        .from('user_quest_stats')
        .select(
          `
          id,
          user_id,
          total_points,
          total_quests_completed,
          easy_quests_completed,
          medium_quests_completed,
          hard_quests_completed,
          current_streak,
          longest_streak,
          last_quest_date
        `
        )
        .order('total_points', { ascending: false })
        .limit(200);
      if (qError) throw qError;
      const nextRows = (data ?? []) as UserStatsRow[];
      setRows(nextRows);

      const ids = Array.from(new Set(nextRows.map((r) => r.user_id).filter(Boolean)));
      if (ids.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', ids);
        const map: Record<string, string | null> = {};
        for (const p of profilesData ?? []) {
          map[p.id] = p.username;
        }
        setUsernames(map);
      } else {
        setUsernames({});
      }
    } catch (e: any) {
      setError(e.message ?? 'Fehler beim Laden der User-Stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <h1 className="page-title">User-Quest-Stats</h1>
      <p className="page-subtitle">
        Sieh, wie aktiv deine Community mit dem Quest-System interagiert (Punkte, Streaks, etc.).
      </p>

      {error && <div className="card">Fehler: {error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Punkte</th>
              <th>Quests gesamt</th>
              <th>Easy / Med / Hard</th>
              <th>Aktueller Streak</th>
              <th>Längster Streak</th>
              <th>Letzte Quest</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  {loading ? 'Lade Stats…' : 'Keine Statistiken gefunden.'}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{usernames[r.user_id] ?? r.user_id}</td>
                <td>{r.total_points}</td>
                <td>{r.total_quests_completed}</td>
                <td>
                  {r.easy_quests_completed} / {r.medium_quests_completed} /{' '}
                  {r.hard_quests_completed}
                </td>
                <td>{r.current_streak}</td>
                <td>{r.longest_streak}</td>
                <td>
                  {r.last_quest_date
                    ? new Date(r.last_quest_date).toLocaleDateString()
                    : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


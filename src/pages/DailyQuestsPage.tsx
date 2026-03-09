import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface DailyQuestRow {
  id: string;
  user_id: string;
  quest_date: string;
  is_completed: boolean;
  completed_at: string | null;
  user: {
    id: string;
    username: string | null;
  } | null;
  easy: { id: string; title: string } | null;
  medium: { id: string; title: string } | null;
  hard: { id: string; title: string } | null;
  selected: { id: string; title: string } | null;
}

export const DailyQuestsPage: React.FC = () => {
  const [rows, setRows] = useState<DailyQuestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // Beziehungen laut Schema:
      // daily_quests.easy_quest_id    -> quest_templates.id (daily_quests_easy_quest_id_fkey)
      // daily_quests.medium_quest_id  -> quest_templates.id (daily_quests_medium_quest_id_fkey)
      // daily_quests.hard_quest_id    -> quest_templates.id (daily_quests_hard_quest_id_fkey)
      // daily_quests.selected_quest_id-> quest_templates.id (daily_quests_selected_quest_id_fkey)
      const { data, error: qError } = await supabase
        .from('daily_quests')
        .select(
          `
          id,
          user_id,
          quest_date,
          is_completed,
          completed_at,
          user:profiles!daily_quests_user_id_fkey (
            id,
            username
          ),
          easy:quest_templates!daily_quests_easy_quest_id_fkey (
            id,
            title
          ),
          medium:quest_templates!daily_quests_medium_quest_id_fkey (
            id,
            title
          ),
          hard:quest_templates!daily_quests_hard_quest_id_fkey (
            id,
            title
          ),
          selected:quest_templates!daily_quests_selected_quest_id_fkey (
            id,
            title
          )
        `
        )
        .order('quest_date', { ascending: false })
        .limit(200);

      if (qError) throw qError;
      setRows((data ?? []) as DailyQuestRow[]);
    } catch (e: any) {
      setError(e.message ?? 'Fehler beim Laden der Daily Quests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const markCompleted = async (id: string) => {
    const { error: upError } = await supabase
      .from('daily_quests')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', id);
    if (upError) {
      // eslint-disable-next-line no-alert
      alert(upError.message);
      return;
    }
    await load();
  };

  return (
    <div>
      <h1 className="page-title">Daily Quests</h1>
      <p className="page-subtitle">
        Überblick, welche Quests Nutzer:innen täglich bekommen und ob sie abgeschlossen wurden.
      </p>

      {error && <div className="card">Fehler: {error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>User</th>
              <th>Easy / Medium / Hard</th>
              <th>Gewählte Quest</th>
              <th>Status</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  {loading ? 'Lade Daily Quests…' : 'Keine Einträge gefunden.'}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.quest_date).toLocaleDateString()}</td>
                <td>{r.user?.username ?? r.user_id}</td>
                <td>
                  <div className="pill-group">
                    <span className="tag">{r.easy?.title ?? '–'}</span>
                    <span className="tag">{r.medium?.title ?? '–'}</span>
                    <span className="tag">{r.hard?.title ?? '–'}</span>
                  </div>
                </td>
                <td>{r.selected?.title ?? 'Noch nichts gewählt'}</td>
                <td>
                  {r.is_completed ? (
                    <span className="tag tag-closed">
                      <span className="status-dot status-dot-green" />
                      Abgeschlossen
                    </span>
                  ) : (
                    <span className="tag tag-open">
                      <span className="status-dot status-dot-red" />
                      Offen
                    </span>
                  )}
                </td>
                <td>
                  {!r.is_completed && (
                    <button className="btn btn-sm" onClick={() => void markCompleted(r.id)}>
                      Als erledigt markieren
                    </button>
                  )}
                  {r.is_completed && r.completed_at && (
                    <span className="muted" style={{ fontSize: 11 }}>
                      {new Date(r.completed_at).toLocaleString()}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


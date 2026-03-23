import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

type ReportStatus = 'open' | 'in_review' | 'closed';

interface ReportRow {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  post: {
    id: string;
    content: string | null;
    image_url: string | null;
    user_name: string | null;
  } | null;
  reporter: {
    username: string | null;
  } | null;
}

export const ReportsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('open');
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('post_reports')
        .select(
          `
          id,
          post_id,
          reporter_id,
          reason,
          status,
          created_at,
          updated_at,
          post:posts (
            id,
            content,
            image_url,
            user_name
          ),
          reporter:profiles!reporter_id (
            username
          )
        `
        )
        .order('created_at', { ascending: false }) as any;

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: qError } = await query;
      if (qError) throw qError;
      setRows(data ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Fehler beim Laden der Reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateStatus = async (id: string, status: ReportStatus) => {
    const { error: upError } = await supabase
      .from('post_reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (upError) {
      // eslint-disable-next-line no-alert
      alert(`Fehler beim Aktualisieren: ${upError.message}`);
      return;
    }
    await loadReports();
  };

  const handleDeletePost = async (postId: string | undefined | null, reportId: string) => {
    if (!postId) return;
    // eslint-disable-next-line no-alert
    const ok = confirm('Post wirklich dauerhaft löschen?');
    if (!ok) return;

    const { error: postError } = await supabase.from('posts').delete().eq('id', postId);
    if (postError) {
      // eslint-disable-next-line no-alert
      alert(`Fehler beim Löschen des Posts: ${postError.message}`);
      return;
    }
    await updateStatus(reportId, 'closed');
  };

  return (
    <div>
      <h1 className="page-title">Reports & Tickets</h1>
      <p className="page-subtitle">
        Melden, bewerten und abarbeiten von Content-Reports aus der App.
      </p>

      <div className="field-row" style={{ marginBottom: 12 }}>
        <div className="field" style={{ maxWidth: 220 }}>
          <label>Status-Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
          >
            <option value="all">Alle</option>
            <option value="open">Offen</option>
            <option value="in_review">In Bearbeitung</option>
            <option value="closed">Geschlossen</option>
          </select>
        </div>
        <div className="field" style={{ flex: '0 0 auto' }}>
          <label>&nbsp;</label>
          <button className="btn" onClick={() => void loadReports()}>
            Neu laden
          </button>
        </div>
      </div>

      {error && <div className="card">Fehler: {error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Erstellt</th>
              <th>Status</th>
              <th>Grund</th>
              <th>Post</th>
              <th>Reporter</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  {loading ? 'Lade Reports…' : 'Keine Reports vorhanden.'}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>
                  <span
                    className={
                      r.status === 'open'
                        ? 'tag tag-open'
                        : r.status === 'closed'
                        ? 'tag tag-closed'
                        : 'tag'
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td>{r.reason}</td>
                <td>
                  <div>
                    <div className="muted" style={{ marginBottom: 2 }}>
                      {r.post?.user_name ?? 'Unbekannter User'}
                    </div>
                    <div>
                      {r.post?.content
                        ? r.post.content.length > 100
                          ? `${r.post.content.slice(0, 100)}…`
                          : r.post.content
                        : r.post?.image_url
                        ? 'Bild-Post'
                        : '–'}
                    </div>
                  </div>
                </td>
                <td>{r.reporter?.username ?? r.reporter_id.slice(0, 8) + '…'}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => void updateStatus(r.id, 'in_review')}
                  >
                    Aufnehmen
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => void updateStatus(r.id, 'closed')}
                  >
                    Schließen
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => void handleDeletePost(r.post?.id, r.id)}
                  >
                    Post löschen & schließen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


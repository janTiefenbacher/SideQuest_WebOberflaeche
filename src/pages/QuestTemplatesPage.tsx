import React, { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

type Difficulty = 'easy' | 'medium' | 'hard';

interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  points: number;
  category: string;
  is_active: boolean;
}

const emptyForm: Omit<QuestTemplate, 'id'> = {
  title: '',
  description: '',
  difficulty: 'easy',
  points: 10,
  category: '',
  is_active: true
};

export const QuestTemplatesPage: React.FC = () => {
  const [items, setItems] = useState<QuestTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<QuestTemplate, 'id'>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: qError } = await supabase
        .from('quest_templates')
        .select('id, title, description, difficulty, points, category, is_active')
        .order('created_at', { ascending: false });
      if (qError) throw qError;
      setItems((data ?? []) as QuestTemplate[]);
    } catch (e: any) {
      setError(e.message ?? 'Fehler beim Laden der Quest-Vorlagen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        const { error: upError } = await supabase
          .from('quest_templates')
          .update(form)
          .eq('id', editingId);
        if (upError) throw upError;
      } else {
        const { error: insError } = await supabase.from('quest_templates').insert(form);
        if (insError) throw insError;
      }
      resetForm();
      await load();
    } catch (e: any) {
      // eslint-disable-next-line no-alert
      alert(e.message ?? 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (q: QuestTemplate) => {
    setEditingId(q.id);
    setForm({
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      points: q.points,
      category: q.category,
      is_active: q.is_active
    });
  };

  const toggleActive = async (q: QuestTemplate) => {
    const { error: upError } = await supabase
      .from('quest_templates')
      .update({ is_active: !q.is_active })
      .eq('id', q.id);
    if (upError) {
      // eslint-disable-next-line no-alert
      alert(upError.message);
      return;
    }
    await load();
  };

  return (
    <div>
      <h1 className="page-title">Quest-Vorlagen</h1>
      <p className="page-subtitle">
        Erstelle und verwalte deine Quest-Templates (easy/medium/hard), die in Daily Quests
        gezogen werden.
      </p>

      {error && <div className="card">Fehler: {error}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">
            {editingId ? 'Quest-Vorlage bearbeiten' : 'Neue Quest-Vorlage'}
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="field-row">
            <div className="field">
              <label>Titel</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="field" style={{ maxWidth: 160 }}>
              <label>Schwierigkeit</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="field" style={{ maxWidth: 120 }}>
              <label>Punkte</label>
              <input
                type="number"
                min={1}
                required
                value={form.points}
                onChange={(e) =>
                  setForm({ ...form, points: e.target.value ? Number(e.target.value) : 0 })
                }
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Kategorie</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="z.B. Social, Health, Productivity…"
              />
            </div>
            <div className="field" style={{ maxWidth: 140 }}>
              <label>Status</label>
              <select
                value={form.is_active ? 'active' : 'inactive'}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.value === 'active' ? true : false })
                }
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Beschreibung</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Speichern' : 'Anlegen'}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={resetForm}>
                Abbrechen
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Titel</th>
              <th>Diff.</th>
              <th>Punkte</th>
              <th>Kategorie</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  {loading ? 'Lade Vorlagen…' : 'Noch keine Quest-Vorlagen vorhanden.'}
                </td>
              </tr>
            )}
            {items.map((q) => (
              <tr key={q.id}>
                <td>
                  <div>{q.title}</div>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {q.description.length > 80
                      ? `${q.description.slice(0, 80)}…`
                      : q.description}
                  </div>
                </td>
                <td>{q.difficulty}</td>
                <td>{q.points}</td>
                <td>{q.category}</td>
                <td>
                  <span className={q.is_active ? 'tag tag-closed' : 'tag tag-open'}>
                    {q.is_active ? 'aktiv' : 'inaktiv'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm" onClick={() => onEdit(q)}>
                    Bearbeiten
                  </button>
                  <button className="btn btn-sm" onClick={() => void toggleActive(q)}>
                    {q.is_active ? 'Deaktivieren' : 'Aktivieren'}
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


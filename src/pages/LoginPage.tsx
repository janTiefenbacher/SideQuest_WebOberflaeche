import React, { FormEvent, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export const LoginPage: React.FC = () => {
  const { loading, signInWithEmailPassword, role } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await signInWithEmailPassword(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        // AuthProvider übernimmt weiteres Handling (role/admin check)
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-title">SideQuest Admin Login</div>
        <div className="login-subtitle">
          Nur Admin-Zugang. Kein Registrieren im UI.
        </div>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>E-Mail</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              disabled={loading || submitting}
            />
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label>Passwort</label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              disabled={loading || submitting}
            />
          </div>

          {error && <div className="login-error">Fehler: {error}</div>}
          {role && role !== 'admin' && (
            <div className="login-error">Du bist kein Admin (role: {role}).</div>
          )}

          <button className="btn btn-primary login-btn" disabled={loading || submitting}>
            {submitting ? 'Login…' : 'Login'}
          </button>
        </form>

        <div className="login-footnote">
          Falls du kein Konto hast: Admin-User muss in Supabase angelegt werden und
          in `profiles.role` auf `admin` stehen.
        </div>
      </div>
    </div>
  );
};


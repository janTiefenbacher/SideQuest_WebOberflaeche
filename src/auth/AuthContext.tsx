import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

type Role = 'admin' | string | null;

interface AuthContextValue {
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: Role;
  isAdmin: boolean;
  signInWithEmailPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);

  const loadRole = async (uid: string) => {
    // eslint-disable-next-line no-console
    console.log('[Auth] loadRole: START uid=', uid);

    try {
      const fetchPromise = supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('loadRole: 4s Timeout – RLS-Policy hängt vermutlich')), 4000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        // eslint-disable-next-line no-console
        console.error('[Auth] loadRole: FEHLER', error);
        setRole(null);
        return;
      }

      // eslint-disable-next-line no-console
      console.log('[Auth] loadRole: ERGEBNIS data=', data, '→ role=', data?.role ?? null);
      setRole(data?.role ?? null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Auth] loadRole: EXCEPTION (wahrscheinlich Timeout/RLS)', e);
      setRole(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[Auth] useEffect: MOUNT');
    let mounted = true;
    let resolved = false;

    const finish = (source: string) => {
      // eslint-disable-next-line no-console
      console.log(`[Auth] finish() aufgerufen von: ${source} | mounted=${mounted} resolved=${resolved}`);
      if (mounted && !resolved) {
        resolved = true;
        // eslint-disable-next-line no-console
        console.log('[Auth] setLoading(false) → DONE');
        setLoading(false);
      } else {
        // eslint-disable-next-line no-console
        console.log('[Auth] finish() ignoriert (bereits resolved oder unmounted)');
      }
    };

    const applySession = async (nextSession: Session | null, source: string) => {
      // eslint-disable-next-line no-console
      console.log(`[Auth] applySession: START von ${source} | session=`, nextSession ? `user=${nextSession.user.id}` : 'null');
      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);
      if (nextUser?.id) {
        // eslint-disable-next-line no-console
        console.log('[Auth] applySession: rufe loadRole auf...');
        await loadRole(nextUser.id);
        // eslint-disable-next-line no-console
        console.log('[Auth] applySession: loadRole abgeschlossen');
      } else {
        // eslint-disable-next-line no-console
        console.log('[Auth] applySession: kein User → setRole(null)');
        setRole(null);
      }
      // eslint-disable-next-line no-console
      console.log(`[Auth] applySession: ENDE von ${source}`);
    };

    // Schneller initialer Check beim Laden der Seite
    // eslint-disable-next-line no-console
    console.log('[Auth] getSession: wird aufgerufen...');
    supabase.auth.getSession().then(async ({ data }) => {
      // eslint-disable-next-line no-console
      console.log('[Auth] getSession: Antwort erhalten | session=', data.session ? `user=${data.session.user.id}` : 'null', '| mounted=', mounted);
      if (!mounted) return;
      try {
        await applySession(data.session ?? null, 'getSession');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[Auth] getSession: applySession FEHLER', e);
      } finally {
        finish('getSession');
      }
    }).catch((e) => {
      // eslint-disable-next-line no-console
      console.error('[Auth] getSession: Promise FEHLER', e);
      finish('getSession-catch');
    });

    // Sicherheitsnetz: nach 5s spätestens aus dem Ladezustand raus
    const safetyTimeout = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.warn('[Auth] SAFETY TIMEOUT ausgelöst nach 5s – Ladevorgang hat gehangen!');
      finish('safetyTimeout');
    }, 5000);

    // Nachfolgende Auth-Änderungen (Login, Logout, Token-Refresh)
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      // eslint-disable-next-line no-console
      console.log('[Auth] onAuthStateChange: event=', event, '| session=', nextSession ? `user=${nextSession.user.id}` : 'null', '| mounted=', mounted);
      if (!mounted) return;
      try {
        await applySession(nextSession, `onAuthStateChange(${event})`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[Auth] onAuthStateChange: applySession FEHLER', e);
      } finally {
        finish(`onAuthStateChange(${event})`);
      }
    });

    return () => {
      // eslint-disable-next-line no-console
      console.log('[Auth] useEffect: CLEANUP (unmount)');
      mounted = false;
      clearTimeout(safetyTimeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmailPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = useMemo(() => role === 'admin', [role]);

  const value: AuthContextValue = {
    loading,
    session,
    user,
    role,
    isAdmin,
    signInWithEmailPassword,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


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
    // profiles.role ist die Quelle für Admin-Rechte in deinem Schema
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      // Kein Hard-Fail: wir behandeln fehlende Role als nicht Admin
      // eslint-disable-next-line no-console
      console.warn('[Auth] role load error', error);
      setRole(null);
      return;
    }

    setRole(data?.role ?? null);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const nextSession = data.session ?? null;
      const nextUser = nextSession?.user ?? null;

      if (!mounted) return;
      setSession(nextSession);
      setUser(nextUser);

      if (nextUser?.id) {
        await loadRole(nextUser.id);
      } else {
        setRole(null);
      }
      if (mounted) setLoading(false);
    };

    void init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (nextUser?.id) {
        await loadRole(nextUser.id);
      } else {
        setRole(null);
      }
    });

    return () => {
      mounted = false;
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


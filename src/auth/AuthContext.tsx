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

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    let timer: number | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((resolve) => {
          timer = window.setTimeout(() => resolve(fallback), ms);
        })
      ]);
    } finally {
      if (timer) window.clearTimeout(timer);
    }
  };

  const loadRole = async (uid: string) => {
    const result = await withTimeout(
      supabase.from('profiles').select('role').eq('id', uid).maybeSingle(),
      3000,
      { data: null, error: null } as any
    );

    if (result?.error) {
      setRole(null);
      return;
    }
    setRole(result?.data?.role ?? null);
  };

  useEffect(() => {
    let mounted = true;

    const applySession = async (nextSession: Session | null) => {
      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);
      if (nextUser?.id) {
        await loadRole(nextUser.id);
      } else {
        setRole(null);
      }
    };

    const init = async () => {
      try {
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          3000,
          { data: { session: null } } as any
        );
        if (!mounted) return;
        await applySession(sessionResult.data.session ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      try {
        await applySession(nextSession);
      } finally {
        if (mounted) setLoading(false);
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


// src/contexts/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode, FC } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const handleSession = (session: Session | null) => {
    const sbUser = session?.user ?? null;
    if (sbUser) setUser({ id: sbUser.id, email: sbUser.email ?? '' });
    else setUser(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session ?? null);
    });

    const listener = supabase.auth.onAuthStateChange((_evt, session) => {
      handleSession(session);
    });

    return () => {
      listener.data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) setUser({ id: data.user.id, email: data.user.email ?? '' });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

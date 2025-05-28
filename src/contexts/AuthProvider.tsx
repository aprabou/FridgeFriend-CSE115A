// src/contexts/AuthProvider.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";
import { AuthContext, AuthContextType } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn: AuthContextType["signIn"] = (email, password) =>
    supabase.auth.signInWithPassword({ email, password }).then(({ error }) => ({ error }));

  const signUp: AuthContextType["signUp"] = (email, password, phone) =>
    supabase.auth.signUp({ email, password, phone }).then(({ data, error }) => ({
      error,
      user: data.user,
    }));

  // Wrap signOut to match Promise<void> signature
  const signOut: AuthContextType["signOut"] = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

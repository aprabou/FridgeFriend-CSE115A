import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";

interface Profile {
  id: string;
  name: string | null;
  number: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  saveProfile: (fields: {
    name: string | null;
    number: string;
  }) => Promise<void>;
  setProfile: (profile: Profile | null) => void; // New function
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- 1. Fetch or create profile ---------- */
  const fetchProfile = async () => {
    if (!user) return; // guard against race on logout
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(); // won’t throw on 0 rows

      if (error) throw error;
      setProfileState(data); // Update profile state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 3. Save profile (upsert) ---------- */
  const saveProfile = async (fields: {
    name: string | null;
    number: string;
  }) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...fields }, { onConflict: "id" }); // ← key line

      if (error) throw error;
      await fetchProfile(); // refresh local copy
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 4. Auto-fetch once on mount / user change ---------- */
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /* ---------- 5. Set profile directly ---------- */
  const setProfile = (profile: Profile | null) => {
    setProfileState(profile);
  };

  return (
    <ProfileContext.Provider
      value={{ profile, loading, error, fetchProfile, saveProfile, setProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

/* ---------- Hook ---------- */
export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
};

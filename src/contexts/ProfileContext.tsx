// src/contexts/ProfileContext.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
//Defines a React context to manage user profile data, including fetching, updating, and storing profile information from Supabase
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../lib/supabaseClient";

// Define the shape of your Profile
export interface Profile {
  id: string;
  name: string | null;
  number: string | null;
  household_id: string | null;
  expiry_notifications: boolean;
  inventory_updates: boolean;
  recipe_recommendations: boolean;
  email_notifications: boolean;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  saveProfile: (fields: Partial<Profile>) => Promise<void>;
  setProfile: (profile: Profile | null) => void;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("profiles")
        .select(
          `
          id,
          name,
          number,
          household_id,
          expiry_notifications,
          inventory_updates,
          recipe_recommendations,
          email_notifications
        `
        )
        .eq("id", user.id)
        .single();

      if (fetchErr) throw fetchErr;
      setProfileState(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (fields: Partial<Profile>) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...fields }, { onConflict: "id" });
      if (upsertErr) throw upsertErr;
      await fetchProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const setProfile = (p: Profile | null) => {
    setProfileState(p);
  };

  return (
    <ProfileContext.Provider
      value={{ profile, loading, error, fetchProfile, saveProfile, setProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

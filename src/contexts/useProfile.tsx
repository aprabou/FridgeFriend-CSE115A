// Defines a custom React hook and context to manage user profile data
// Including fetching, updating, and providing access to profile information from Supabase
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

// Define the shape of the profile object
export interface Profile {
  id: string;
  name: string;
  household_id: string | null;
  // add other profile fields here
}

// Context value type
interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  fetchProfile: () => Promise<void>;
  saveProfile: (updates: Partial<Profile>) => Promise<void>;
}

// Create the context
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Export the provider
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    // Remove generic here, supabase.from infers types
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      setError(fetchError);
    } else {
      // cast returned data to our Profile type
      setProfile(data as Profile);
    }
    setLoading(false);
  };

  const saveProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    setLoading(true);

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .single();

    if (updateError) {
      setError(updateError);
    } else {
      setProfile(data as Profile);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return (
    <ProfileContext.Provider
      value={{ profile, loading, error, fetchProfile, saveProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Export the hook
export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};

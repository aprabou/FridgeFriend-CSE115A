import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  purchased: string;
  expiration: string;
  location: string;
  notes?: string;
  user_id: string;
  household_id: string;
  created_at: string;
}

interface InventoryContextType {
  items: FoodItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<FoodItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<FoodItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getSoonToExpire: () => FoodItem[];
  getStorageLocationCounts: () => Record<string, number>;
  refetchItems: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType>({
  items: [],
  loading: false,
  error: null,
  addItem: async () => {},
  updateItem: async () => {},
  deleteItem: async () => {},
  getSoonToExpire: () => [],
  getStorageLocationCounts: () => ({}),
  refetchItems: async () => {},
});

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: householdMember } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user?.id)
        .eq('status', 'accepted')
        .single();

      const householdId = householdMember?.household_id;

      if (!householdId) {
        setItems([]);
        return;
      }

      const { data, error } = await supabase
        .from('fridge_items')
        .select('*')
        .eq('household_id', householdId)
        .order('expiration', { ascending: true });

      if (error) throw error;
      setItems(data ?? []);
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchItems();

      // Subscribe to real-time changes scoped by household_id
      const setupRealtime = async () => {
        const { data: householdMember } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', user.id)
          .eq('status', 'accepted')
          .single();

        const householdId = householdMember?.household_id;

        if (householdId) {
          const channel = supabase
            .channel('fridge_sync')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'fridge_items',
                filter: `household_id=eq.${householdId}`,
              },
              () => {
                fetchItems();
              }
            )
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
        }
      };

      setupRealtime();
    }
  }, [user?.id]);

  const addItem = async (item: Omit<FoodItem, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data: householdMember } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user?.id)
        .eq('status', 'accepted')
        .single();

      const householdId = householdMember?.household_id;

      if (!householdId) {
        throw new Error('User is not in an accepted household.');
      }

      const { error } = await supabase.from('fridge_items').insert({
        ...item,
        user_id: user?.id,
        household_id: householdId,
      });

      if (error) throw error;
      await fetchItems();
    } catch (error: any) {
      console.error('Error adding item:', error);
      setError(error.message);
    }
  };

  const updateItem = async (id: string, updates: Partial<FoodItem>) => {
    try {
      const { error } = await supabase
        .from('fridge_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchItems();
    } catch (error: any) {
      console.error('Error updating item:', error);
      setError(error.message);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fridge_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error('Error deleting item:', error);
      setError(error.message);
    }
  };

  const getSoonToExpire = () => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return items.filter((item) => {
      const expDate = new Date(item.expiration);
      return expDate >= today && expDate <= sevenDaysFromNow;
    });
  };

  const getStorageLocationCounts = () => {
    return items.reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const value = {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    getSoonToExpire,
    getStorageLocationCounts,
    refetchItems: fetchItems,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

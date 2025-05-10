import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  purchased: string;     // ✅ matches DB column
  expiration: string;        // ✅ matches DB column
  location: string;          // ✅ matches DB column
  notes?: string;
  user_id: string;
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
});

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('fridge_items')
        .select('*')
        .eq('user_id', user?.id)
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

  const addItem = async (item: Omit<FoodItem, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('fridge_items')
        .insert({ ...item, user_id: user?.id })
        .select();

      if (error) throw error;
      if (data) {
        setItems((prev) => [...prev, data[0]]);
      }
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
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
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
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

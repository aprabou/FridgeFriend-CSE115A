/* eslint-disable @typescript-eslint/no-explicit-any */
// src/contexts/InventoryContext.tsx

import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";
import { useContext } from "react";
import { useNotification } from "./NotificationContext";

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
  addItem: (
    item: Omit<FoodItem, "id" | "user_id" | "household_id" | "created_at">
  ) => Promise<void>;
  updateItem: (id: string, updates: Partial<FoodItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getSoonToExpire: () => FoodItem[];
  getStorageLocationCounts: () => Record<string, number>;
  refetchItems: () => Promise<void>;
}

export const InventoryContext = createContext<InventoryContextType>({
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

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) fetch all accepted household IDs for this user
      const { data: memberships, error: memErr } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user?.id)
        .eq("status", "accepted");
      if (memErr) throw memErr;

      if (!memberships || memberships.length === 0) {
        setItems([]);
        return;
      }

      const householdIds = memberships.map((m) => m.household_id);

      // 2) fetch items for any of those households
      const { data: fetchedItems, error: fetchError } = await supabase
        .from("fridge_items")
        .select("*")
        .in("household_id", householdIds)
        .order("expiration", { ascending: true });
      if (fetchError) throw fetchError;

      setItems(fetchedItems ?? []);
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    // initial load
    fetchItems();

    // subscribe to changes on all accepted households
    (async () => {
      const { data: memberships } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .eq("status", "accepted");
      if (!memberships) return;

      const channels = memberships.map(({ household_id }) =>
        supabase
          .channel(`fridge_sync_${household_id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "fridge_items",
              filter: `household_id=eq.${household_id}`,
            },
            fetchItems
          )
          .subscribe()
      );

      // cleanup
      return () => {
        channels.forEach((ch) => supabase.removeChannel(ch));
      };
    })();
  }, [user?.id]);

  const addItem = async (
    item: Omit<FoodItem, "id" | "user_id" | "household_id" | "created_at">
  ) => {
    setError(null);
    try {
      // fetch all accepted household memberships
      const { data: memberships, error: memErr } = await supabase
        .from("household_members")
        .select("household_id, role")
        .eq("user_id", user!.id)
        .eq("status", "accepted");
      if (memErr) throw memErr;
      if (!memberships || memberships.length === 0) {
        throw new Error("User is not in an accepted household.");
      }

      // pick the owner household if present, otherwise the first
      const householdId =
        memberships.find((m) => m.role === "owner")?.household_id ||
        memberships[0].household_id;

      // insert the new item
      const { data: newItem, error: insertError } = await supabase
        .from("fridge_items")
        .insert([
          {
            ...item,
            user_id: user!.id,
            household_id: householdId,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (insertError) throw insertError;

      // Update the state with the new item
      setItems((prev) => [...prev, newItem]);

      // Fetch all household members to notify them
      const { data: householdMembers, error: membersError } = await supabase
        .from("household_members")
        .select("user_id")
        .eq("household_id", householdId)
        .eq("status", "accepted");
      
      if (membersError) throw membersError;

      // Fetch profiles for all household members
      const userIds = householdMembers?.map(member => member.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Send notifications to all household members
      for (const profile of profiles || []) {
        if (profile.email) {
          addNotification({
            title: "Item Added",
            message: `The item "${item.name}" has been added to your household inventory.`,
            type: "info",
          });
        }
      }
    } catch (err: any) {
      console.error("Error adding item:", err);
      setError(err.message);
    }
  };

  const updateItem = async (id: string, updates: Partial<FoodItem>) => {
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("fridge_items")
        .update(updates)
        .eq("id", id);
      if (updateError) throw updateError;
      await fetchItems();
    } catch (err: any) {
      console.error("Error updating item:", err);
      setError(err.message);
    }
  };

  const deleteItem = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from("fridge_items")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err: any) {
      console.error("Error deleting item:", err);
      setError(err.message);
    }
  };

  const [alertedExpiryIds, setAlertedExpiryIds] = useState<Set<string>>(
    new Set()
  );

  // Pure helper: get all items expiring in the next 7 days
  const getSoonToExpire = (): FoodItem[] => {
    const today = new Date();
    const inSeven = new Date(today);
    inSeven.setDate(today.getDate() + 7);

    return items.filter((it) => {
      const exp = new Date(it.expiration);
      return exp >= today && exp <= inSeven;
    });
  };

  // useEffect: whenever `items` changes, run expiry logic once
  useEffect(() => {
    if (!items.length) return;

    const soon = getSoonToExpire();
    soon.forEach(async (item) => {
      if (!alertedExpiryIds.has(item.id)) {
        // Fetch all household members to notify them
        const { data: householdMembers, error: membersError } = await supabase
          .from("household_members")
          .select("user_id")
          .eq("household_id", item.household_id)
          .eq("status", "accepted");
        
        if (membersError) {
          console.error("Error fetching household members:", membersError);
          return;
        }

        // Fetch profiles for all household members
        const userIds = householdMembers?.map(member => member.user_id) || [];
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          return;
        }

        // Send notifications to all household members
        for (const profile of profiles || []) {
          if (profile.email) {
            addNotification({
              title: "Item Expiring Soon",
              message: `${item.name} will expire on ${new Date(
                item.expiration
              ).toLocaleDateString()}`,
              type: "warning",
            });
          }
        }

        // Mark it as "alerted" so we don't send again
        setAlertedExpiryIds((prev) => new Set(prev).add(item.id));
      }
    });

    // (Optional) If you want to clear the set for truly new data:
    // remove IDs that are no longer in `soon`, etc.
  }, [items]); // run this effect whenever `items` array changes

  const getStorageLocationCounts = () =>
    items.reduce((acc, it) => {
      acc[it.location] = (acc[it.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const value: InventoryContextType = {
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

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

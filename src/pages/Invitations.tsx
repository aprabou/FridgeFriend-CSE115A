// src/pages/Invitations.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
//Defines a React component that fetches and displays a list of pending household invitations for the logged-in user
//Uses Supabase for database queries and React state for managing the invitations
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/useAuth";
import { useNavigate } from "react-router-dom";

// Shape of an invite row, including the joined household name
type Invite = {
  household_id: string;
  status: "pending" | "accepted" | "rejected";
  households: { name: string };
};

const Invitations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invites, setInvites] = useState<Invite[]>([]);

  // Fetch pending invitations on mount
  useEffect(() => {
    async function loadInvites() {
      const { data, error } = await supabase
        .from("household_members")
        .select(
          `
            household_id,
            status,
            households(name)
          `
        )
        .eq("user_id", user!.id)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching invites:", error);
        return;
      }

      if (data) {
        // Normalize households: Supabase may return an object or array
        const normalized: Invite[] = data.map((row: any) => {
          const raw = row.households;
          const houseObj = Array.isArray(raw) ? raw[0] : raw;
          return {
            household_id: row.household_id,
            status: row.status,
            households: { name: houseObj?.name ?? "" },
          };
        });
        setInvites(normalized);
      }
    }

    if (user) loadInvites();
  }, [user]);

  // Accept an invitation
  const acceptInvite = async (householdId: string) => {
    const { error: updateErr } = await supabase
      .from("household_members")
      .update({ status: "accepted" })
      .eq("user_id", user!.id)
      .eq("household_id", householdId);

    if (updateErr) {
      console.error("Error accepting invite:", updateErr);
      return alert("Failed to accept invite.");
    }

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ household_id: householdId })
      .eq("id", user!.id);

    if (profileErr) console.error("Error linking profile:", profileErr);

    setInvites((prev) => prev.filter((i) => i.household_id !== householdId));
    alert("Invite accepted!");
    navigate("/inventory");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Pending Invitations</h2>
      {invites.length === 0 ? (
        <p className="text-gray-700">You have no pending invitations.</p>
      ) : (
        <ul className="space-y-3">
          {invites.map((inv) => (
            <li
              key={inv.household_id}
              className="flex items-center justify-between p-4 bg-white rounded shadow"
            >
              <span className="font-medium">
                Join household: <strong>{inv.households.name}</strong>
              </span>
              <button
                onClick={() => acceptInvite(inv.household_id)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Accept
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Invitations;

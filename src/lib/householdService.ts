// src/lib/householdService.ts
//Defines functions for managing household-related operations
//Such as creating a household, linking it to a user profile, and adding the creator as a household member
//Done using Supabase for database interactions
import { supabase } from "./supabaseClient";

export async function createHousehold(
  name: string,
  userId: string
): Promise<{ id: string; name: string }> {
  // 1️⃣ insert household
  const { data: hh, error: hhErr } = await supabase
    .from("households")
    .insert({ name })
    .select("id, name")
    .single();

  if (hhErr || !hh) throw hhErr ?? new Error("Failed to create household");

  // 2️⃣ link to profile
  const { error: linkErr } = await supabase
    .from("profiles")
    .update({ household_id: hh.id })
    .eq("id", userId);
  if (linkErr) throw linkErr;

  // 3️⃣ add creator as owner
  const { error: memberErr } = await supabase
    .from("household_members")
    .insert({
      household_id: hh.id,
      user_id: userId,
      role: "owner",
      status: "accepted",
    });

  if (memberErr) throw memberErr;

  return hh as { id: string; name: string };
}

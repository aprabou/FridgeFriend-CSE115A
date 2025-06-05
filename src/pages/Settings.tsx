"use client"
//Defines a React component that allows users to manage their account settings
//Including updating their profile, handling authentication actions like signing out
//Also managing household-related settings using Supabase and custom hooks
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "../contexts/useAuth"
import { useProfile } from "../contexts/useProfile"
import { supabase } from "../lib/supabaseClient"
import { createHousehold } from "../lib/householdService"
import { UserIcon, UsersIcon, BellIcon } from "lucide-react"

type NotifKeys = "expiryNotifications" | "inventoryUpdates" | "recipeRecommendations" | "emailNotifications"

interface HouseholdMember {
  id: string
  user_id: string
  role: string
  status: string
  profiles: {
    id: string
    email: string
    name: string
  }
}

const Settings: React.FC = () => {
  // Profile hook
  const { profile, loading: profileLoading, error: profileError, fetchProfile, saveProfile } = useProfile()

  // Local form state
  const [name, setName] = useState("")

  // Auth
  const { user, signOut } = useAuth()

  // UI tab
  const [activeTab, setActiveTab] = useState("profile")

  // Refs for scrolling
  const profileRef = useRef<HTMLDivElement>(null)
  const householdRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Household form + error
  const [householdForm, setHouseholdForm] = useState({
    name: "",
    inviteEmail: "",
  })
  const [householdError, setHouseholdError] = useState<string | null>(null)
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([])

  const fetchHouseholdMembers = async () => {
    try {
      // Step 1: Fetch household members
      const { data: members, error: membersError } = await supabase
        .from("household_members")
        .select("id, user_id, role, status")
        .eq("household_id", profile?.household_id)

      if (membersError) {
        console.error(membersError)
        return alert("Failed to fetch household members.")
      }

      if (!members || members.length === 0) {
        console.warn("No household members found.")
        setHouseholdMembers([])
        return
      }

      console.log("Household Members:", members)

      // Extract user IDs
      const userIds = members.map((member) => member.user_id)

      // Step 2: Fetch profiles for the user IDs
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, name")
        .in("id", userIds)

      if (profilesError) {
        console.error(profilesError)
        return alert("Failed to fetch user profiles.")
      }

      console.log("Profiles:", profiles)

      // Step 3: Combine household members with their profiles
      const combinedData = members.map((member) => ({
        ...member,
        profiles: profiles.find((profile) => profile.id === member.user_id) || {
          id: "",
          email: "",
          name: "",
        },
      }))

      setHouseholdMembers(combinedData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (profile?.household_id) {
      fetchHouseholdMembers()
    }
  }, [profile?.household_id])

  // Notification prefs
  const [notificationSettings, setNotificationSettings] = useState({
    expiryNotifications: true,
    inventoryUpdates: true,
  });

  // On mount: load profile + notifications
  useEffect(() => {
    fetchProfile()
    fetchNotificationSettings()
  }, [])

  // When profile updates, seed name/number
  useEffect(() => {
    if (profile?.name) setName(profile.name)
  }, [profile])

  // When user logs in, load their household name
  useEffect(() => {
    if (user) {
      loadHouseholdName()
    }
  }, [user])

  // Scroll spy effect to update active tab based on scroll position
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Trigger when section is 20% from top
      threshold: 0,
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id
          if (sectionId === "profile-section") {
            setActiveTab("profile")
          } else if (sectionId === "household-section") {
            setActiveTab("household")
          } else if (sectionId === "notifications-section") {
            setActiveTab("notifications")
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all sections
    if (profileRef.current) observer.observe(profileRef.current)
    if (householdRef.current) observer.observe(householdRef.current)
    if (notificationsRef.current) observer.observe(notificationsRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Handle tab changes with scrolling
  const handleTabClick = useCallback((tab: string) => {
    // Temporarily set the active tab to prevent flickering
    setActiveTab(tab)

    // Scroll to the appropriate section
    if (tab === "profile" && profileRef.current) {
      profileRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    } else if (tab === "household" && householdRef.current) {
      householdRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    } else if (tab === "notifications" && notificationsRef.current) {
      notificationsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  // ── Load Household Name ────────────────────────────────────────
  const loadHouseholdName = async () => {
    const { data: profData, error: profError } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user!.id)
      .maybeSingle()
    if (profError) {
      console.error(profError)
      setHouseholdError("Something went wrong loading your household.")
      return
    }
    if (!profData?.household_id) {
      console.warn("User has no household yet.")
      return
    }
    console.log("Your Household ID:", profData.household_id)
    const { data: household, error: householdErr } = await supabase
      .from("households")
      .select("name")
      .eq("id", profData.household_id)
      .single()
    if (householdErr || !household) {
      console.error("Error loading household name:", householdErr)
      setHouseholdError("Could not load your household name.")
      return
    }
    setHouseholdForm((prev) => ({ ...prev, name: household.name }))
  }
  // ────────────────────────────────────────────────────────────────

  // ── Fetch Notification Settings ────────────────────────────────
  const fetchNotificationSettings = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        expiry_notifications,
        inventory_updates
      `
      )
      .eq("id", user!.id)
      .single()
    if (error) {
      console.error("Error loading notification settings:", error)
      return
    }
    setNotificationSettings({
      expiryNotifications: data.expiry_notifications,
      inventoryUpdates: data.inventory_updates,
    });
  };
  // ────────────────────────────────────────────────────────────────

  // ── Household Name Update ──────────────────────────────────────
  const handleHouseholdNameUpdate = async () => {
    if (!user) return
    setHouseholdError(null)

    // 1️⃣ get your profile's household_id
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user.id)
      .single()
    if (profErr) {
      console.error("Error fetching profile:", profErr)
      return alert("Could not load your profile.")
    }

    let householdId = prof.household_id

    // 2️⃣ if none, create & link & add owner
    if (!householdId) {
      try {
        const hh = await createHousehold(householdForm.name || `${user.email?.split("@")[0]}'s Household`, user.id)
        householdId = hh.id
      } catch (err: any) {
        console.error(err)
        setHouseholdError(err.message)
        return
      }
    }

    // 3️⃣ update the household name
    const { error: updateErr } = await supabase
      .from("households")
      .update({ name: householdForm.name })
      .eq("id", householdId)

    if (updateErr) {
      console.error("Failed to update household name:", updateErr)
      alert("Failed to update household name.")
    } else {
      alert("✅ Household saved!")
    }
  }
  // ────────────────────────────────────────────────────────────────

  // ── Invite Handler ────────────────────────────────────────────
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = householdForm.inviteEmail.trim().toLowerCase()

    // 1️⃣ format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return alert("Please enter a valid email address.")
    }

    // 2️⃣ lookup invitee
    const { data: invitee, error: inviteeErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (inviteeErr) {
      console.error(inviteeErr)
      return alert("Something went wrong.")
    }
    console.log("🔎 lookup invitee by email:", email)
    console.log({ invitee, inviteeErr })

    if (!invitee) {
      return alert("That email isn't registered with FridgeFriend.")
    }

    // 3️⃣ your household
    const { data: me, error: meErr } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user!.id)
      .single()

    if (meErr || !me?.household_id) {
      console.error(meErr)
      return alert("You don't yet have a household—create one first.")
    }

    // 4️⃣ insert membership
    const { error: insertErr } = await supabase.from("household_members").insert({
      user_id: invitee.id,
      household_id: me.household_id,
      status: "pending",
      role: "member",
    })

    if (insertErr) {
      console.error(insertErr)
      return alert("Failed to send invitation.")
    }

    alert("✅ Invitation sent!")
    setHouseholdForm((p) => ({ ...p, inviteEmail: "" }))
  }
  // ────────────────────────────────────────────────────────────────

  // ── Notification Save ─────────────────────────────────────────
  const handleSaveNotificationSettings = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        expiry_notifications: notificationSettings.expiryNotifications,
        inventory_updates: notificationSettings.inventoryUpdates,
      })
      .eq("id", user!.id)

    if (error) {
      console.error("Failed to save notification settings:", error)
      alert("❌ Failed to save notification settings.")
    } else {
      alert("✅ Notification settings saved!")
    }
  }
  // ────────────────────────────────────────────────────────────────

  // ── Handlers for inputs ───────────────────────────────────────
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setNotificationSettings((prev) => ({
      ...prev,
      [name as NotifKeys]: checked,
    }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveProfile({ name })
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-gray-200 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </header>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="flex border-b border-gray-700 sticky top-0 z-10 bg-gray-800">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "profile"
                ? "border-b-2 border-emerald-500 text-emerald-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => handleTabClick("profile")}
          >
            <div className="flex items-center">
              <UserIcon size={16} className="mr-2" />
              Profile
            </div>
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "household"
                ? "border-b-2 border-emerald-500 text-emerald-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => handleTabClick("household")}
          >
            <div className="flex items-center">
              <UsersIcon size={16} className="mr-2" />
              Household
            </div>
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "notifications"
                ? "border-b-2 border-emerald-500 text-emerald-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => handleTabClick("notifications")}
          >
            <div className="flex items-center">
              <BellIcon size={16} className="mr-2" />
              Notifications
            </div>
          </button>
        </div>

        <div className="p-6 space-y-16">
          {/* Profile Section */}
          <div ref={profileRef} id="profile-section" className="scroll-mt-16">
            <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center">
              <UserIcon size={20} className="mr-2" />
              Profile Settings
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {typeof profileError === "string" && <div className="text-red-400 text-sm">{profileError}</div>}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={profileLoading}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col space-y-5">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-40 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-40 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            </form>
          </div>

          {/* Household Section */}
          <div ref={householdRef} id="household-section" className="scroll-mt-16">
            <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center">
              <UsersIcon size={20} className="mr-2" />
              Household Settings
            </h2>

            <div className="space-y-6">
              {/* Household Name */}
              <div>
                <label htmlFor="household-name" className="block text-sm font-medium text-gray-300 mb-1">
                  Household Name
                </label>
                <input
                  type="text"
                  id="household-name"
                  value={householdForm.name}
                  onChange={(e) =>
                    setHouseholdForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleHouseholdNameUpdate}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  Save Household Name
                </button>
                {householdError && <p className="mt-2 text-red-400 text-sm">{householdError}</p>}
              </div>

              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-200">Household Members</h3>
                {householdMembers.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {householdMembers.map((member) => (
                      <li
                        key={member.id}
                        className="flex items-center justify-between p-2 border border-gray-700 rounded-md bg-gray-750"
                      >
                        <div>
                          <p className="font-medium text-gray-200">{member.profiles?.name || "Unknown"}</p>
                          <p className="text-sm text-gray-400">{member.profiles?.email}</p>
                        </div>
                        <span className="text-sm text-gray-300 capitalize px-2 py-1 bg-gray-700 rounded">
                          {member.role}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 mt-2">No household members found.</p>
                )}
              </div>

              {/* Invite by Email */}
              <form onSubmit={handleSendInvite}>
                <label htmlFor="invite-email" className="block text-sm font-medium text-gray-300 mb-1">
                  Invite by Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    id="invite-email"
                    value={householdForm.inviteEmail}
                    onChange={(e) =>
                      setHouseholdForm((prev) => ({
                        ...prev,
                        inviteEmail: e.target.value,
                      }))
                    }
                    placeholder="Enter email"
                    required
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Notifications Section */}
          <div ref={notificationsRef} id="notifications-section" className="scroll-mt-16">
            <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center">
              <BellIcon size={20} className="mr-2" />
              Notification Settings
            </h2>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Notification Preferences</h3>
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <input
                    id={key}
                    name={key}
                    type="checkbox"
                    checked={value}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor={key} className="text-sm text-gray-300">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </label>
                </div>
              ))}
              <button
                onClick={handleSaveNotificationSettings}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

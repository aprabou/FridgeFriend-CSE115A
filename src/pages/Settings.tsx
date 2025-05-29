import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/useAuth";
import { useProfile } from "../contexts/useProfile";
import { supabase } from "../lib/supabaseClient";
import { createHousehold } from "../lib/householdService";
import { UserIcon, UsersIcon, BellIcon } from "lucide-react";

const Settings: React.FC = () => {
  // Profile hook
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    fetchProfile,
    saveProfile,
  } = useProfile();

  // Local form state
  const [name, setName] = useState("");

  // Auth
  const { user, signOut } = useAuth();

  // UI tab
  const [activeTab, setActiveTab] = useState("profile");

  // Household form + error
  const [householdForm, setHouseholdForm] = useState({
    name: "",
    inviteEmail: "",
  });
  const [householdError, setHouseholdError] = useState<string | null>(null);

  interface HouseholdMember {
    id: string;
    user_id: string;
    role: string;
    status: string;
    profiles: {
      id: string;
      email: string;
      name: string;
    };
  }

  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>(
    []
  );

  const fetchHouseholdMembers = async () => {
    try {
      // Step 1: Fetch household members
      const { data: members, error: membersError } = await supabase
        .from("household_members")
        .select("id, user_id, role, status")
        .eq("household_id", profile?.household_id);

      if (membersError) {
        console.error(membersError);
        return alert("Failed to fetch household members.");
      }

      if (!members || members.length === 0) {
        console.warn("No household members found.");
        setHouseholdMembers([]);
        return;
      }

      console.log("Household Members:", members);

      // Extract user IDs
      const userIds = members.map((member) => member.user_id);

      // Step 2: Fetch profiles for the user IDs
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, name")
        .in("id", userIds);

      if (profilesError) {
        console.error(profilesError);
        return alert("Failed to fetch user profiles.");
      }

      console.log("Profiles:", profiles);

      // Step 3: Combine household members with their profiles
      const combinedData = members.map((member) => ({
        ...member,
        profiles: profiles.find((profile) => profile.id === member.user_id) || {
          id: "",
          email: "",
          name: "",
        },
      }));

      setHouseholdMembers(combinedData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (profile?.household_id) {
      fetchHouseholdMembers();
    }
  }, [profile?.household_id]);

  // Notification prefs
  const [notificationSettings, setNotificationSettings] = useState({
    expiryNotifications: true,
    inventoryUpdates: true,
    recipeRecommendations: true,
    emailNotifications: true,
  });

  // On mount: load profile + notifications
  useEffect(() => {
    fetchProfile();
    fetchNotificationSettings();
  }, []);

  // When profile updates, seed name/number
  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  // When user logs in, load their household name
  useEffect(() => {
    if (user) {
      loadHouseholdName();
    }
  }, [user]);

  // ── Load Household Name ────────────────────────────────────────
  const loadHouseholdName = async () => {
    const { data: profData, error: profError } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user!.id)
      .maybeSingle();
    if (profError) {
      console.error(profError);
      setHouseholdError("Something went wrong loading your household.");
      return;
    }
    if (!profData?.household_id) {
      console.warn("User has no household yet.");
      return;
    }
    console.log("Your Household ID:", profData.household_id);
    const { data: household, error: householdErr } = await supabase
      .from("households")
      .select("name")
      .eq("id", profData.household_id)
      .single();
    if (householdErr || !household) {
      console.error("Error loading household name:", householdErr);
      setHouseholdError("Could not load your household name.");
      return;
    }
    setHouseholdForm((prev) => ({ ...prev, name: household.name }));
  };
  // ────────────────────────────────────────────────────────────────

  // ── Fetch Notification Settings ────────────────────────────────
  const fetchNotificationSettings = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        expiry_notifications,
        inventory_updates,
        recipe_recommendations,
        email_notifications
      `
      )
      .eq("id", user!.id)
      .single();
    if (error) {
      console.error("Error loading notification settings:", error);
      return;
    }
    setNotificationSettings({
      expiryNotifications: data.expiry_notifications,
      inventoryUpdates: data.inventory_updates,
      recipeRecommendations: data.recipe_recommendations,
      emailNotifications: data.email_notifications,
    });
  };
  // ────────────────────────────────────────────────────────────────

  // ── Household Name Update ──────────────────────────────────────
  const handleHouseholdNameUpdate = async () => {
    if (!user) return;
    setHouseholdError(null);

    // 1️⃣ get your profile’s household_id
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user.id)
      .single();
    if (profErr) {
      console.error("Error fetching profile:", profErr);
      return alert("Could not load your profile.");
    }

    let householdId = prof.household_id;

    // 2️⃣ if none, create & link & add owner
    if (!householdId) {
      try {
        const hh = await createHousehold(
          householdForm.name || `${user.email?.split("@")[0]}'s Household`,
          user.id
        );
        householdId = hh.id;
      } catch (err: any) {
        console.error(err);
        setHouseholdError(err.message);
        return;
      }
    }

    // 3️⃣ update the household name
    const { error: updateErr } = await supabase
      .from("households")
      .update({ name: householdForm.name })
      .eq("id", householdId);

    if (updateErr) {
      console.error("Failed to update household name:", updateErr);
      alert("Failed to update household name.");
    } else {
      alert("✅ Household saved!");
    }
  };
  // ────────────────────────────────────────────────────────────────

  // ── Invite Handler ────────────────────────────────────────────
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = householdForm.inviteEmail.trim().toLowerCase();

    // 1️⃣ format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return alert("Please enter a valid email address.");
    }

    // 2️⃣ lookup invitee
    const { data: invitee, error: inviteeErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (inviteeErr) {
      console.error(inviteeErr);
      return alert("Something went wrong.");
    }
    console.log("🔎 lookup invitee by email:", email);
    console.log({ invitee, inviteeErr });

    if (!invitee) {
      return alert("That email isn’t registered with FridgeFriend.");
    }

    // 3️⃣ your household
    const { data: me, error: meErr } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user!.id)
      .single();

    if (meErr || !me?.household_id) {
      console.error(meErr);
      return alert("You don’t yet have a household—create one first.");
    }

    // 4️⃣ insert membership
    const { error: insertErr } = await supabase
      .from("household_members")
      .insert({
        user_id: invitee.id,
        household_id: me.household_id,
        status: "pending",
        role: "member",
      });

    if (insertErr) {
      console.error(insertErr);
      return alert("Failed to send invitation.");
    }

    alert("✅ Invitation sent!");
    setHouseholdForm((p) => ({ ...p, inviteEmail: "" }));
  };
  // ────────────────────────────────────────────────────────────────

  // ── Notification Save ─────────────────────────────────────────
  const handleSaveNotificationSettings = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        expiry_notifications: notificationSettings.expiryNotifications,
        inventory_updates: notificationSettings.inventoryUpdates,
        recipe_recommendations: notificationSettings.recipeRecommendations,
        email_notifications: notificationSettings.emailNotifications,
      })
      .eq("id", user!.id);

    if (error) {
      console.error("Failed to save notification settings:", error);
      alert("❌ Failed to save notification settings.");
    } else {
      alert("✅ Notification settings saved!");
    }
  };
  // ────────────────────────────────────────────────────────────────

  // ── Handlers for inputs ───────────────────────────────────────
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name as NotifKeys]: checked,
    }));
  };

  const handleInviteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHouseholdForm((prev) => ({ ...prev, inviteEmail: e.target.value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile({ name });
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </header>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "profile"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <div className="flex items-center">
              <UserIcon size={16} className="mr-2" />
              Profile
            </div>
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "household"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("household")}
          >
            <div className="flex items-center">
              <UsersIcon size={16} className="mr-2" />
              Household
            </div>
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "notifications"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <div className="flex items-center">
              <BellIcon size={16} className="mr-2" />
              Notifications
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "household" && (
            <div className="space-y-6">
              {/* Household Name */}
              <div>
                <label
                  htmlFor="household-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleHouseholdNameUpdate}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Save Household Name
                </button>
              </div>

              <div className="mt-5">
                <h2 className="text-lg font-bold">Household Members</h2>
                <ul className="mt-3 space-y-2">
                  {householdMembers.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">
                          {member.profiles?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.profiles?.email}
                        </p>
                      </div>
                      <span className="text-sm text-gray-700 capitalize">
                        {member.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Invite by Email */}
              <form onSubmit={handleSendInvite}>
                <label
                  htmlFor="invite-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                  >
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Notification Preferences
              </h3>
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <input
                    id={key}
                    name={key}
                    type="checkbox"
                    checked={value}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor={key} className="text-sm text-gray-700">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </label>
                </div>
              ))}
              <button
                onClick={handleSaveNotificationSettings}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {typeof profileError === "string" && (
                <div className="text-red-500 text-sm">{profileError}</div>
              )}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={profileLoading}
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex flex-col space-y-5">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-40 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-40 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Sign Out
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

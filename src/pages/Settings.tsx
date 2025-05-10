import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserIcon, UsersIcon, BellIcon, MailIcon } from "lucide-react";
import { useProfile } from "../contexts/ProfileContext";

const Settings: React.FC = () => {
  const { profile, loading, error, saveProfile, fetchProfile } = useProfile();
  const [name, setName] = useState("");
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [householdForm, setHouseholdForm] = useState({
    name: "My Household",
    members: [{ id: "1", email: "family@example.com", status: "Accepted" }],
    inviteEmail: "",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    expiryNotifications: true,
    inventoryUpdates: true,
    recipeRecommendations: true,
    emailNotifications: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const handleInviteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHouseholdForm((prev) => ({ ...prev, inviteEmail: e.target.value }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending invitation
    alert(`Invitation sent to ${householdForm.inviteEmail}`);
    setHouseholdForm((prev) => ({ ...prev, inviteEmail: "" }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile({ name });
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="max-w-4xl mx-auto">
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
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-6">
                {error && <div className="text-red-500 text-sm">{error}</div>}
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
                  className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Account Actions
                  </h3>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "household" && (
            <div>
              <div className="mb-6">
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
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Household Members
                </h3>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user?.email}
                        </td>
                        <td className="px-4 py-2 text-sm text-blue-600">
                          {member.status}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button className="text-red-500 hover:text-red-700 text-sm">
                            Remove
                          </button>
                        </td>
                      </tr>
                      {householdForm.members.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {member.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-red-600 hover:text-red-900">
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <form
                onSubmit={handleSendInvite}
                className="mb-6 border-t border-gray-200 pt-6"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Invite New Member
                </h3>
                <div className="flex">
                  <div className="flex-grow mr-3">
                    <label htmlFor="invite-email" className="sr-only">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MailIcon size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="invite-email"
                        placeholder="Email address"
                        value={householdForm.inviteEmail}
                        onChange={handleInviteChange}
                        required
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>

              <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 text-sm text-yellow-800">
                <p>
                  <strong>Household Sharing:</strong> Members of your household
                  will have access to view and manage the shared inventory.
                </p>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="expiryNotifications"
                      name="expiryNotifications"
                      type="checkbox"
                      checked={notificationSettings.expiryNotifications}
                      onChange={handleNotificationChange}
                      className="focus:ring-green-500 h-4 w-4 text-green-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="expiryNotifications"
                      className="font-medium text-gray-700"
                    >
                      Expiry Notifications
                    </label>
                    <p className="text-gray-500 text-sm">
                      Receive notifications when food items are about to expire.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="inventoryUpdates"
                      name="inventoryUpdates"
                      type="checkbox"
                      checked={notificationSettings.inventoryUpdates}
                      onChange={handleNotificationChange}
                      className="focus:ring-green-500 h-4 w-4 text-green-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="inventoryUpdates"
                      className="font-medium text-gray-700"
                    >
                      Inventory Updates
                    </label>
                    <p className="text-gray-500 text-sm">
                      Receive notifications when household members update the
                      shared inventory.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="recipeRecommendations"
                      name="recipeRecommendations"
                      type="checkbox"
                      checked={notificationSettings.recipeRecommendations}
                      onChange={handleNotificationChange}
                      className="focus:ring-green-500 h-4 w-4 text-green-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="recipeRecommendations"
                      className="font-medium text-gray-700"
                    >
                      Recipe Recommendations
                    </label>
                    <p className="text-gray-500 text-sm">
                      Receive weekly recipe recommendations based on your
                      inventory.
                    </p>
                  </div>
                </div>

                <div className="flex items-start pt-4 border-t border-gray-200">
                  <div className="flex items-center h-5">
                    <input
                      id="emailNotifications"
                      name="emailNotifications"
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      className="focus:ring-green-500 h-4 w-4 text-green-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="emailNotifications"
                      className="font-medium text-gray-700"
                    >
                      Email Notifications
                    </label>
                    <p className="text-gray-500 text-sm">
                      Receive notifications via email in addition to in-app
                      notifications.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  onClick={() => alert("Notification settings saved!")}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

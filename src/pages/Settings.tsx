import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon, UsersIcon, BellIcon, MailIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: user?.email || '',
  });
  const [householdForm, setHouseholdForm] = useState({
    name: '',
    members: [],
    inviteEmail: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    expiryNotifications: true,
    inventoryUpdates: true,
    recipeRecommendations: false,
    emailNotifications: true,
  });

  useEffect(() => {
    if (!user) return;
    fetchHouseholdData();
  }, [user]);

  const fetchHouseholdData = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('household_id, name')
      .eq('id', user?.id)
      .single();

    if (profile?.name) {
      setProfileForm(prev => ({ ...prev, name: profile.name }));
    }

    if (!profile?.household_id) return;

    const { data: household } = await supabase
      .from('households')
      .select('name')
      .eq('id', profile.household_id)
      .single();

    const { data: members } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('household_id', profile.household_id);

    setHouseholdForm(prev => ({
      ...prev,
      name: household?.name || '',
      members: members?.filter(m => m.id !== user?.id).map(m => ({ id: m.id, email: m.email, status: 'Accepted' })) || [],
    }));
  };

  const handleHouseholdNameUpdate = async () => {
    if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.household_id) {
      alert('Household not found.');
      return;
    }

    const { error: updateError } = await supabase
      .from('households')
      .update({ name: householdForm.name })
      .eq('id', profile.household_id);

    if (updateError) {
      console.error(updateError);
      alert('Failed to update household name.');
    } else {
      alert('Household name updated!');
    }
  };

  const handleInviteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHouseholdForm(prev => ({ ...prev, inviteEmail: e.target.value }));
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: invitee } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', householdForm.inviteEmail)
      .single();

    const { data: inviter } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', user?.id)
      .single();

    if (!invitee?.id || !inviter?.household_id) {
      alert('Invalid invite or missing household');
      return;
    }

    await supabase
      .from('profiles')
      .update({ household_id: inviter.household_id })
      .eq('id', invitee.id);

    await fetchHouseholdData();
    setHouseholdForm(prev => ({ ...prev, inviteEmail: '' }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('profiles')
      .update({ name: profileForm.name })
      .eq('id', user?.id);

    if (error) {
      console.error('Failed to update profile:', error.message);
      alert('Failed to update profile.');
    } else {
      alert('Profile updated successfully');
    }
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
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'profile' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('profile')}
          >
            <div className="flex items-center">
              <UserIcon size={16} className="mr-2" />
              Profile
            </div>
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'household' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('household')}
          >
            <div className="flex items-center">
              <UsersIcon size={16} className="mr-2" />
              Household
            </div>
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'notifications' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <div className="flex items-center">
              <BellIcon size={16} className="mr-2" />
              Notifications
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" id="name" name="name" value={profileForm.name} onChange={handleProfileChange} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" name="email" value={profileForm.email} disabled className="w-full px-3 py-2 border rounded-md bg-gray-50" />
                <p className="text-sm text-gray-500">Email cannot be changed.</p>
              </div>
              <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md">Save Changes</button>
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Account Actions</h3>
                <button type="button" onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md">Sign Out</button>
              </div>
            </form>
          )}

          {activeTab === 'household' && (
            <div>
              <div className="mb-4">
                <label htmlFor="household-name" className="block text-sm font-medium text-gray-700 mb-1">Household Name</label>
                <input type="text" id="household-name" value={householdForm.name} onChange={(e) => setHouseholdForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border rounded-md" />
                <button onClick={handleHouseholdNameUpdate} className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Save Household Name</button>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Household Members</h3>
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-800">{user?.email}</td>
                      <td className="px-4 py-2 text-sm text-green-600">Owner</td>
                      <td className="px-4 py-2 text-right">-</td>
                    </tr>
                    {householdForm.members.map(member => (
                      <tr key={member.id}>
                        <td className="px-4 py-2 text-sm text-gray-800">{member.email}</td>
                        <td className="px-4 py-2 text-sm text-blue-600">{member.status}</td>
                        <td className="px-4 py-2 text-right">
                          <button className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <form onSubmit={handleSendInvite} className="border-t pt-6">
                <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-2">Invite New Member</label>
                <div className="flex items-center gap-2">
                  <div className="relative w-full">
                    <input type="email" id="invite-email" placeholder="Email address" value={householdForm.inviteEmail} onChange={handleInviteChange} required className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <MailIcon size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Send Invitation</button>
                </div>
              </form>
              <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mt-6 text-sm text-yellow-800">
                <p><strong>Household Sharing:</strong> Members of your household will have access to view and manage the shared inventory.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Preferences</h3>
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-start">
                  <input
                    id={key}
                    name={key}
                    type="checkbox"
                    checked={value}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor={key} className="ml-3 text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                </div>
              ))}
              <div className="pt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  onClick={() => alert('Notification settings saved!')}
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

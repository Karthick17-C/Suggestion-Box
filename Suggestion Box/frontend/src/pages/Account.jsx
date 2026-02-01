import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Mail, Lock, Save, AlertTriangle, Calendar, Shield, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Account = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const response = await authAPI.updateProfile(profileData);
      // Update local storage and context
      const updatedUser = { ...user, name: profileData.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await authAPI.updatePassword(passwordData);
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 cyber-grid">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 animate-slideUp">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyber-400 animate-pulse" />
            <span className="text-cyber-400 text-sm font-medium">Profile Settings</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            Account <span className="gradient-text">Details</span>
          </h1>
          <p className="text-gray-400 mt-2">Manage your identity and security</p>
        </div>

        {/* Account Info Card */}
        <div className="glass-card p-6 mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-cyber-500/20 to-purple-500/20 flex items-center justify-center border border-cyber-500/30">
              <User className="w-9 h-9 text-cyber-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="premium-badge flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 glass-card w-fit animate-slideUp" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'profile' 
                ? 'bg-cyber-500/20 text-cyber-400 border border-cyber-500/30' 
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'security' 
                ? 'bg-cyber-500/20 text-cyber-400 border border-cyber-500/30' 
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            <Shield className="w-4 h-4" />
            Security
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="glass-card p-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-cyber-400" />
              <h2 className="font-semibold text-white text-lg">Profile Information</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-field pl-12"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="email"
                    value={profileData.email}
                    className="input-field pl-12 bg-dark-700/50 cursor-not-allowed text-gray-500"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-3 py-4 mt-8"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Profile
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="glass-card p-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-5 h-5 text-cyber-400" />
              <h2 className="font-semibold text-white text-lg">Change Password</h2>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Current Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field pl-12"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field pl-12"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field pl-12"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-3 py-4 mt-8"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        <div className="glass-card p-6 mt-8 border-red-500/30 animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/30">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="font-semibold text-red-400">Danger Zone</h2>
              <p className="text-sm text-gray-500">Actions cannot be undone</p>
            </div>
          </div>
          
          <button
            onClick={() => toast.error('Account deletion is disabled in this demo')}
            className="px-5 py-2.5 bg-red-500/10 text-red-400 font-medium rounded-xl border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;

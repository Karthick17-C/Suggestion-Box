import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Bell, Moon, Globe, Shield, Save, Zap, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newSuggestionAlert: true,
    weeklyDigest: false,
    darkMode: true,
    language: 'en'
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully!');
    setSaving(false);
  };

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange({ target: { checked: !checked } })}
      disabled={disabled}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        checked 
          ? 'bg-gradient-to-r from-cyber-500 to-purple-500 shadow-neon' 
          : 'bg-dark-700 border border-dark-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div
        className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 ${
          checked 
            ? 'left-8 bg-white shadow-lg' 
            : 'left-1 bg-gray-400'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-dark-900 cyber-grid">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 animate-slideUp">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyber-400 animate-pulse" />
            <span className="text-cyber-400 text-sm font-medium">System Config</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="w-9 h-9 text-cyber-400" />
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-gray-400 mt-2">Configure your preferences and notifications</p>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Bell className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">Notifications</h2>
              <p className="text-sm text-gray-500">Manage how you receive alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/60 border border-dark-600/50 hover:border-cyber-500/30 transition-all duration-300">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email updates about your boxes</p>
              </div>
              <ToggleSwitch
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/60 border border-dark-600/50 hover:border-cyber-500/30 transition-all duration-300">
              <div>
                <p className="font-medium text-white">New Suggestion Alerts</p>
                <p className="text-sm text-gray-500">Get notified when someone submits a suggestion</p>
              </div>
              <ToggleSwitch
                checked={settings.newSuggestionAlert}
                onChange={(e) => setSettings({ ...settings, newSuggestionAlert: e.target.checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/60 border border-dark-600/50 hover:border-cyber-500/30 transition-all duration-300">
              <div>
                <p className="font-medium text-white">Weekly Digest</p>
                <p className="text-sm text-gray-500">Receive a weekly summary of all suggestions</p>
              </div>
              <ToggleSwitch
                checked={settings.weeklyDigest}
                onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-card p-6 mb-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <Moon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">Appearance</h2>
              <p className="text-sm text-gray-500">Customize the look and feel</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/60 border border-dark-600/50">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium text-white">Dark Mode</p>
                <p className="text-sm text-gray-500">Cyber theme enabled by default</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="premium-badge">Active</span>
              <ToggleSwitch
                checked={settings.darkMode}
                onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="glass-card p-6 mb-8 animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
              <Globe className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">Language</h2>
              <p className="text-sm text-gray-500">Choose your preferred language</p>
            </div>
          </div>

          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-3 py-4 animate-slideUp"
          style={{ animationDelay: '0.4s' }}
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;

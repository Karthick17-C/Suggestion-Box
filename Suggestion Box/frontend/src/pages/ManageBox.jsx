import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boxAPI, suggestionAPI } from '../services/api';
import SuggestionCard from '../components/SuggestionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeft, Settings, ExternalLink, Copy, MessageSquare, 
  Eye, EyeOff, Lock, Palette, Check, Trash2, Save, Image,
  Reply, Archive, ThumbsUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard } from '../utils/helpers';

const COLOR_OPTIONS = [
  '#00d4ff', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', 
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

const CATEGORY_TABS = [
  { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'cyber' },
  { id: 'replied', label: 'Replied', icon: Reply, color: 'green' },
  { id: 'reacted', label: 'Reacted', icon: ThumbsUp, color: 'blue' },
  { id: 'archived', label: 'Archived', icon: Archive, color: 'gray' },
];

const ManageBox = () => {
  const { boxId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [box, setBox] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [categoryFilter, setCategoryFilter] = useState('messages');
  const [counts, setCounts] = useState({});
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBox();
  }, [boxId]);

  useEffect(() => {
    if (box) {
      fetchSuggestions();
    }
  }, [box, categoryFilter]);

  const fetchBox = async () => {
    try {
      const response = await boxAPI.getBox(boxId);
      const boxData = response.data.data;
      
      // Check ownership
      if (boxData.owner._id !== user?.id) {
        toast.error('You do not own this box');
        navigate('/dashboard');
        return;
      }
      
      setBox(boxData);
      setEditData({
        title: boxData.title,
        description: boxData.description || '',
        logoUrl: boxData.logoUrl || '',
        isPublic: boxData.isPublic,
        passkey: '',
        theme: boxData.theme
      });
    } catch (error) {
      toast.error('Box not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      // Fetch all suggestions first, then filter on frontend for non-archived
      const statusParam = categoryFilter === 'messages' ? undefined : categoryFilter;
      const response = await suggestionAPI.getForBox(boxId, { status: statusParam });
      
      let filteredSuggestions = response.data.data;
      
      // If "messages" is selected, exclude archived
      if (categoryFilter === 'messages') {
        filteredSuggestions = filteredSuggestions.filter(s => s.status !== 'archived');
      }
      
      setSuggestions(filteredSuggestions);
      setCounts(response.data.counts);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/box/${boxId}`;
    const success = await copyToClipboard(link);
    if (success) {
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSaveSettings = async () => {
    if (!editData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!editData.isPublic && !editData.passkey && !box.isPublic) {
      // Keeping private without new passkey is fine
    } else if (!editData.isPublic && !editData.passkey && box.isPublic) {
      toast.error('Please enter a passkey for private box');
      return;
    }

    setSaving(true);
    try {
      const updatePayload = {
        title: editData.title,
        description: editData.description,
        logoUrl: editData.logoUrl,
        isPublic: editData.isPublic,
        theme: editData.theme
      };

      if (!editData.isPublic && editData.passkey) {
        updatePayload.passkey = editData.passkey;
      }

      await boxAPI.updateBox(boxId, updatePayload);
      toast.success('Settings saved successfully!');
      fetchBox();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClearSuggestions = async () => {
    if (!confirm('Are you sure you want to clear all suggestions? This cannot be undone.')) {
      return;
    }
    try {
      await suggestionAPI.clearAll(boxId);
      toast.success('All suggestions cleared successfully');
      fetchSuggestions();
    } catch (error) {
      toast.error('Failed to clear suggestions');
    }
  };

  const handleDeleteBox = async () => {
    if (!confirm(`Are you sure you want to delete "${box.title}"? This will delete all suggestions and cannot be undone.`)) {
      return;
    }

    try {
      await boxAPI.deleteBox(boxId);
      toast.success('Box deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete box');
    }
  };

  // Calculate counts for display (exclude archived from "all")
  const displayCounts = {
    all: (counts.total || 0) - (counts.archived || 0),
    replied: counts.replied || 0,
    reacted: counts.reacted || 0,
    archived: counts.archived || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 cyber-grid flex items-center justify-center">
        <LoadingSpinner text="Loading box..." />
      </div>
    );
  }

  if (!box) return null;

  return (
    <div className="min-h-screen bg-dark-900 cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 animate-slideUp">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="p-3 rounded-xl bg-dark-800/60 border border-dark-600/50 hover:border-cyber-500/50 hover:bg-dark-700/60 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            
            {box.logoUrl ? (
              <img 
                src={box.logoUrl} 
                alt={box.title}
                className="w-16 h-16 rounded-xl object-cover border border-dark-600/50"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center border border-dark-600/50"
                style={{ backgroundColor: box.theme?.primaryColor || '#00d4ff' }}
              >
                <Image className="w-8 h-8 text-white/70" />
              </div>
            )}
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{box.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="font-mono">ID: {box.boxId}</span>
                {!box.isPublic && (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Lock className="w-3.5 h-3.5" />
                    Private
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleCopyLink} className="btn-secondary flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
            <Link to={`/box/${boxId}`} className="btn-secondary flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View Box
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 glass-card w-fit animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'suggestions' 
                ? 'bg-cyber-500/20 text-cyber-400 border border-cyber-500/30' 
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Suggestions
            {displayCounts.all > 0 && (
              <span className="bg-cyber-500/30 text-cyber-400 px-2 py-0.5 rounded-full text-xs font-medium">
                {displayCounts.all}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'settings' 
                ? 'bg-cyber-500/20 text-cyber-400 border border-cyber-500/30' 
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="animate-slideUp" style={{ animationDelay: '0.15s' }}>
            {/* Category Tabs and Clear Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {CATEGORY_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const count = displayCounts[tab.id] || 0;
                  const isActive = categoryFilter === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 border ${
                      isActive 
                        ? tab.color === 'cyber' ? 'bg-cyber-500/20 text-cyber-400 border-cyber-500/50' 
                        : tab.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        : tab.color === 'green' ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : tab.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                        : 'bg-dark-800/60 text-gray-400 border-dark-600/50 hover:border-dark-500'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                    {count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isActive 
                          ? 'bg-white/10' 
                          : 'bg-dark-700/50'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
              </div>
              
              {suggestions.length > 0 && (
                <button
                  onClick={handleClearSuggestions}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 border bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            {/* Suggestions List */}
            {suggestionsLoading ? (
              <LoadingSpinner text="Loading suggestions..." />
            ) : suggestions.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <div className="w-20 h-20 bg-dark-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-dark-600/50">
                  <MessageSquare className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No suggestions yet</h3>
                <p className="text-gray-500 mb-6">Share your box link to start collecting feedback</p>
                <button onClick={handleCopyLink} className="btn-primary inline-flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Box Link
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <SuggestionCard 
                    key={suggestion._id} 
                    suggestion={suggestion}
                    isOwner={true}
                    onUpdate={fetchSuggestions}
                    onDelete={fetchSuggestions}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && editData && (
          <div className="grid lg:grid-cols-2 gap-8 animate-slideUp" style={{ animationDelay: '0.15s' }}>
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-8">
                <Settings className="w-5 h-5 text-cyber-400" />
                <h2 className="text-lg font-semibold text-white">Box Settings</h2>
              </div>
              
              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Box Title *
                  </label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="input-field"
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="input-field min-h-[100px] resize-none"
                    maxLength={500}
                  />
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    <Image className="w-4 h-4 inline mr-2 text-cyber-400" />
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={editData.logoUrl}
                    onChange={(e) => setEditData({ ...editData, logoUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-gray-500">
                    Enter a direct URL to an image (PNG, JPG, WebP)
                  </p>
                  {editData.logoUrl && (
                    <div className="mt-3">
                      <img 
                        src={editData.logoUrl} 
                        alt="Logo preview"
                        className="w-16 h-16 rounded-xl object-cover border border-dark-600/50"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Color */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    <Palette className="w-4 h-4 inline mr-2 text-cyber-400" />
                    Theme Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditData({ 
                          ...editData, 
                          theme: { ...editData.theme, primaryColor: color } 
                        })}
                        className={`w-9 h-9 rounded-lg transition-all duration-300 flex items-center justify-center hover:scale-110 ${
                          editData.theme?.primaryColor === color 
                            ? 'ring-2 ring-offset-2 ring-offset-dark-800 ring-white/50' 
                            : 'hover:ring-2 hover:ring-offset-2 hover:ring-offset-dark-800 hover:ring-white/20'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {editData.theme?.primaryColor === color && (
                          <Check className="w-4 h-4 text-white drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditData({ ...editData, isPublic: true, passkey: '' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        editData.isPublic 
                          ? 'border-cyber-500/70 bg-cyber-500/10' 
                          : 'border-dark-600/50 hover:border-dark-500'
                      }`}
                    >
                      <Eye className={`w-5 h-5 mb-2 ${editData.isPublic ? 'text-cyber-400' : 'text-gray-500'}`} />
                      <div className={`font-medium text-sm ${editData.isPublic ? 'text-cyber-400' : 'text-gray-400'}`}>
                        Public
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setEditData({ ...editData, isPublic: false })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        !editData.isPublic 
                          ? 'border-cyber-500/70 bg-cyber-500/10' 
                          : 'border-dark-600/50 hover:border-dark-500'
                      }`}
                    >
                      <EyeOff className={`w-5 h-5 mb-2 ${!editData.isPublic ? 'text-cyber-400' : 'text-gray-500'}`} />
                      <div className={`font-medium text-sm ${!editData.isPublic ? 'text-cyber-400' : 'text-gray-400'}`}>
                        Private
                      </div>
                    </button>
                  </div>
                </div>

                {/* Passkey */}
                {!editData.isPublic && (
                  <div className="animate-slideUp space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      <Lock className="w-4 h-4 inline mr-2 text-cyber-400" />
                      {box.isPublic ? 'Set Passkey *' : 'Update Passkey (leave empty to keep current)'}
                    </label>
                    <input
                      type="text"
                      value={editData.passkey}
                      onChange={(e) => setEditData({ ...editData, passkey: e.target.value })}
                      className="input-field"
                      placeholder={box.isPublic ? 'Enter passkey' : 'Enter new passkey'}
                    />
                  </div>
                )}

                <button
                  onClick={handleSaveSettings}
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
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <div className="glass-card p-6 border-red-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/30">
                    <Trash2 className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
                    <p className="text-sm text-gray-500">Destructive actions</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Deleting this box will permanently remove all suggestions and data. This action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteBox}
                  className="px-5 py-2.5 bg-red-500/10 text-red-400 font-medium rounded-xl border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete This Box
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBox;

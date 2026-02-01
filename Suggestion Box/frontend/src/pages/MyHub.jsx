import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boxAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Plus, Box, MessageSquare, Trash2, Eye, EyeOff, 
  Copy, ExternalLink, MoreVertical, 
  TrendingUp, ArrowUpRight, Clock, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard, format } from '../utils/helpers';

const MyHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    fetchMyBoxes();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMyBoxes = async () => {
    try {
      const response = await boxAPI.getMyBoxes();
      setBoxes(response.data.data);
    } catch (error) {
      toast.error('Failed to load your boxes');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (e, boxId) => {
    e.stopPropagation();
    const link = `${window.location.origin}/box/${boxId}`;
    const success = await copyToClipboard(link);
    if (success) {
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
    setActiveMenu(null);
  };

  const handleToggleActive = async (e, box) => {
    e.stopPropagation();
    try {
      await boxAPI.updateBox(box.boxId, { isActive: !box.isActive });
      toast.success(box.isActive ? 'Box deactivated' : 'Box activated');
      fetchMyBoxes();
    } catch (error) {
      toast.error('Failed to update box');
    }
    setActiveMenu(null);
  };

  const handleDeleteBox = async (e, box) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${box.title}"? This will also delete all suggestions.`)) {
      return;
    }
    try {
      await boxAPI.deleteBox(box.boxId);
      toast.success('Box deleted successfully');
      fetchMyBoxes();
    } catch (error) {
      toast.error('Failed to delete box');
    }
    setActiveMenu(null);
  };

  const handleBoxClick = (boxId) => {
    navigate(`/box/${boxId}/manage`);
  };

  const handleMenuToggle = (e, boxId) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === boxId ? null : boxId);
  };

  const filteredBoxes = boxes.filter(box => 
    box.title.toLowerCase().includes(search.toLowerCase()) ||
    box.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <LoadingSpinner text="Loading your hub..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 cyber-grid">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb w-96 h-96 -top-48 -left-48 opacity-20" />
        <div className="floating-orb w-80 h-80 top-1/3 -right-40 opacity-15" style={{ animationDelay: '2s' }} />
        <div className="floating-orb w-64 h-64 -bottom-32 left-1/4 opacity-10" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Hero Header */}
        <div className="glass-card p-8 mb-8 overflow-hidden relative animate-slideUp">
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-500/5 via-transparent to-purple-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-500/10 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                <span className="gradient-text">{user?.name}'s</span> Boxes
              </h1>
              <p className="text-gray-400 max-w-lg">
                Manage your suggestion boxes and track feedback
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/create-box" className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Box
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {boxes.length > 0 && (
          <div className="mb-6 animate-slideUp">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your boxes..."
                className="input-field pl-12 pr-4 w-full"
              />
            </div>
          </div>
        )}

        {/* Boxes Grid */}
        {filteredBoxes.length === 0 ? (
          <div className="text-center py-20 glass-card animate-slideUp">
            <div className="w-20 h-20 bg-dark-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Box className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              {search ? 'No boxes found' : 'No boxes yet'}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {search 
                ? 'Try adjusting your search terms'
                : 'Create your first suggestion box to start collecting ideas and feedback'
              }
            </p>
            {!search && (
              <Link to="/create-box" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Your First Box
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoxes.map((box, index) => (
              <div
                key={box.boxId}
                onClick={() => handleBoxClick(box.boxId)}
                className="glass-card p-6 cursor-pointer group hover:border-cyber-500/50 transition-all duration-300 animate-slideUp relative"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${box.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                  
                  {/* Menu Button */}
                  <button
                    onClick={(e) => handleMenuToggle(e, box.boxId)}
                    className="p-1.5 rounded-lg hover:bg-dark-700/50 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === box.boxId && (
                    <div
                      ref={menuRef}
                      className="absolute top-full right-0 mt-2 w-48 glass-card py-2 z-50 shadow-xl border border-cyber-500/20"
                    >
                      <button
                        onClick={(e) => handleCopyLink(e, box.boxId)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-dark-700/50 transition-colors flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/box/${box.boxId}`, '_blank');
                          setActiveMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-dark-700/50 transition-colors flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in New Tab
                      </button>
                      <button
                        onClick={(e) => handleToggleActive(e, box)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-dark-700/50 transition-colors flex items-center gap-2"
                      >
                        {box.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Activate
                          </>
                        )}
                      </button>
                      <div className="h-px bg-dark-700/50 my-2" />
                      <button
                        onClick={(e) => handleDeleteBox(e, box)}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Box
                      </button>
                    </div>
                  )}
                </div>

                {/* Box Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2 pr-12 group-hover:text-cyber-400 transition-colors">
                    {box.title}
                  </h3>
                  {box.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">{box.description}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{box.suggestionsCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    {box.isPublic ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Private</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-dark-700/50">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{format.date(box.createdAt)}</span>
                  </div>
                  <div className="text-xs text-cyber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Manage →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHub;

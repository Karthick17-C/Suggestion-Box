import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boxAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Plus, Box, MessageSquare, Eye, EyeOff, 
  Copy, ExternalLink, MoreVertical, Sparkles,
  TrendingUp, ArrowUpRight, Clock, Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard, format } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
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
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-500/5 via-transparent to-purple-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-500/10 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, <span className="gradient-text">{user?.name}</span>
              </h1>
              <p className="text-gray-400 max-w-lg">
                Your command center for managing idea hubs and tracking feedback insights
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - More Advanced */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              icon: Box, 
              label: 'Idea Hubs', 
              value: boxes.length, 
              subtext: boxes.filter(b => b.isActive).length + ' active',
              color: 'cyber',
              gradient: 'from-cyber-500/20 to-cyan-500/20'
            },
            { 
              icon: MessageSquare, 
              label: 'Total Ideas', 
              value: boxes.reduce((acc, box) => acc + (box.suggestionsCount || 0), 0), 
              subtext: 'Collected insights',
              color: 'green',
              gradient: 'from-green-500/20 to-emerald-500/20'
            },
            { 
              icon: Eye, 
              label: 'Public Hubs', 
              value: boxes.filter(b => b.isPublic).length, 
              subtext: boxes.filter(b => !b.isPublic).length + ' private',
              color: 'purple',
              gradient: 'from-purple-500/20 to-pink-500/20'
            },
            { 
              icon: TrendingUp, 
              label: 'Engagement', 
              value: boxes.length > 0 ? Math.round(boxes.reduce((acc, box) => acc + (box.suggestionsCount || 0), 0) / boxes.length) : 0, 
              subtext: 'Avg per hub',
              color: 'amber',
              gradient: 'from-amber-500/20 to-orange-500/20'
            }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="glass-card p-5 group hover:border-cyber-500/30 transition-all duration-500 animate-slideUp overflow-hidden relative"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110
                    ${stat.color === 'cyber' ? 'bg-cyber-500/20 text-cyber-400' : ''}
                    ${stat.color === 'green' ? 'bg-green-500/20 text-green-400' : ''}
                    ${stat.color === 'purple' ? 'bg-purple-500/20 text-purple-400' : ''}
                    ${stat.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : ''}
                  `}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                    ${stat.color === 'cyber' ? 'text-cyber-400' : ''}
                    ${stat.color === 'green' ? 'text-green-400' : ''}
                    ${stat.color === 'purple' ? 'text-purple-400' : ''}
                    ${stat.color === 'amber' ? 'text-amber-400' : ''}
                  `} />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Boxes Section Header */}
        <div className="flex items-center justify-between mb-6 animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-cyber-400" />
            <h2 className="text-xl font-semibold text-white">Your Idea Hubs</h2>
            <span className="px-3 py-1 bg-dark-800/60 rounded-full text-sm text-gray-400 border border-dark-600/50">
              {boxes.length} total
            </span>
          </div>
        </div>

        {/* Boxes List */}
        {boxes.length === 0 ? (
          <div className="glass-card text-center py-20 px-4 animate-slideUp" style={{ animationDelay: '0.5s' }}>
            <div className="w-24 h-24 bg-gradient-to-br from-cyber-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float border border-cyber-500/30">
              <Sparkles className="w-12 h-12 text-cyber-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Start Your Journey</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first idea hub and start collecting valuable feedback from your audience
            </p>
            <Link to="/create-box" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Your First Hub
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boxes.map((box, index) => (
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

export default Dashboard;

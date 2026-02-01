import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { suggestionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Inbox as InboxIcon, Mail, Clock, Reply, Box, Check, ArrowLeft, 
  Image, Sparkles, Zap, MessageCircle, Bell, CheckCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from '../utils/helpers';

const Inbox = () => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInbox();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const response = await suggestionAPI.getInbox();
      setMessages(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch inbox');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await suggestionAPI.markAsRead(id);
      setMessages(prev => prev.map(m => 
        m._id === id ? { ...m, reply: { ...m.reply, isRead: true } } : m
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadMessages = messages.filter(m => !m.reply?.isRead);
      await Promise.all(unreadMessages.map(m => suggestionAPI.markAsRead(m._id)));
      setMessages(prev => prev.map(m => ({ ...m, reply: { ...m.reply, isRead: true } })));
      setUnreadCount(0);
      toast.success('All messages marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-900 cyber-grid flex items-center justify-center p-4">
        {/* Floating Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb w-64 h-64 -top-32 -left-32 opacity-30" />
          <div className="floating-orb w-96 h-96 -bottom-48 -right-48 opacity-20" style={{ animationDelay: '2s' }} />
        </div>

        <div className="glass-card p-10 max-w-md w-full relative animate-slideUp">
          <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
            <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-cyber-500/50" />
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyber-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyber-500/30 animate-float">
              <InboxIcon className="w-10 h-10 text-cyber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Your <span className="gradient-text">Inbox</span>
            </h1>
            <p className="text-gray-400 mb-8">
              Sign in to view replies to your suggestions from box owners.
            </p>
            <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Sign In to Continue
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Don't have an account? <Link to="/register" className="text-cyber-400 hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 cyber-grid flex items-center justify-center">
        <LoadingSpinner text="Loading your inbox..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 cyber-grid">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb w-64 h-64 -top-32 -left-32 opacity-20" />
        <div className="floating-orb w-96 h-96 -bottom-48 -right-48 opacity-15" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-10 animate-slideUp">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="p-3 rounded-xl bg-dark-800/60 border border-dark-600/50 hover:border-cyber-500/50 hover:bg-dark-700/60 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-2 rounded-full bg-cyber-400 animate-pulse" />
                <span className="text-cyber-400 text-sm font-medium">Message Center</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <InboxIcon className="w-8 h-8 text-cyber-400" />
                Your <span className="gradient-text">Inbox</span>
                {unreadCount > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="text-center py-20 glass-card animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="w-24 h-24 bg-dark-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-dark-600/50">
              <MessageCircle className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No replies yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              When box owners reply to your suggestions, they'll appear here. Start sharing your ideas!
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Explore Boxes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={message._id} 
                className={`glass-card p-6 transition-all duration-300 hover:scale-[1.01] animate-slideUp group ${
                  !message.reply?.isRead 
                    ? 'border-cyber-500/50 shadow-neon' 
                    : ''
                }`}
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                {/* Box info */}
                <div className="flex items-center gap-4 mb-5">
                  {message.box?.logoUrl ? (
                    <img 
                      src={message.box.logoUrl} 
                      alt={message.box.title}
                      className="w-12 h-12 rounded-xl object-cover border border-dark-600/50"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center border border-dark-600/50"
                      style={{ backgroundColor: message.box?.theme?.primaryColor || '#00d4ff' }}
                    >
                      <Box className="w-6 h-6 text-white/70" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link 
                      to={`/box/${message.box?.boxId}`}
                      className="font-semibold text-white hover:text-cyber-400 transition-colors"
                    >
                      {message.box?.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      Reply from {message.box?.owner?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!message.reply?.isRead ? (
                      <span className="premium-badge flex items-center gap-1.5">
                        <Bell className="w-3 h-3" />
                        New
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5 text-green-400" />
                        Read
                      </span>
                    )}
                  </div>
                </div>

                {/* Original suggestion */}
                <div className="bg-dark-800/60 rounded-xl p-4 mb-4 border border-dark-600/50">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-gray-500" />
                    Your suggestion
                  </p>
                  <p className="text-sm text-gray-300">{message.content}</p>
                </div>

                {/* Reply */}
                <div className="bg-gradient-to-br from-cyber-500/10 to-purple-500/10 rounded-xl p-4 border border-cyber-500/30">
                  <div className="flex items-center gap-2 text-xs font-medium text-cyber-400 mb-2">
                    <Reply className="w-3.5 h-3.5" />
                    Reply
                  </div>
                  <p className="text-sm text-white">{message.reply?.message}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3">
                    <Clock className="w-3 h-3" />
                    {format.date(message.reply?.createdAt)}
                  </div>
                </div>

                {/* Mark as read button */}
                {!message.reply?.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(message._id)}
                    className="mt-4 text-xs text-cyber-400 hover:text-cyber-300 flex items-center gap-1.5 transition-colors group-hover:underline"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;

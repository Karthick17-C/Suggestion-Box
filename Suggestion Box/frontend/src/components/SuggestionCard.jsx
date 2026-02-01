import { useState } from 'react';
import { format } from '../utils/helpers';
import { Clock, Mail, User, Archive, Reply, Send, X, MessageSquare, Smile } from 'lucide-react';
import { suggestionAPI } from '../services/api';
import toast from 'react-hot-toast';

const REACTION_EMOJIS = ['👍', '❤️', '🎉', '🚀', '👀', '💡'];

const STATUS_CONFIG = {
  reacted: { label: 'Reacted', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/30', icon: MessageSquare },
  archived: { label: 'Archived', color: 'bg-gray-500/10 text-gray-400 border border-gray-500/30', icon: Archive },
  replied: { label: 'Replied', color: 'bg-green-500/10 text-green-400 border border-green-500/30', icon: Reply }
};

const SuggestionCard = ({ suggestion, isOwner, onUpdate, onDelete }) => {
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const statusConfig = STATUS_CONFIG[suggestion.status] || { label: '', color: '', icon: MessageSquare };
  const StatusIcon = statusConfig.icon;

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this suggestion?')) return;
    try {
      await suggestionAPI.update(suggestion._id, { status: 'archived' });
      toast.success('Moved to archive');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to archive');
    }
  };

  const handleUnarchive = async () => {
    if (!confirm('Are you sure you want to restore this suggestion?')) return;
    try {
      await suggestionAPI.update(suggestion._id, { status: 'pending' });
      toast.success('Restored from archive');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to restore');
    }
  };

  const handleReaction = async (emoji) => {
    try {
      await suggestionAPI.update(suggestion._id, { status: 'reacted', reaction: emoji });
      toast.success('Reaction added!');
      setShowReactions(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    if (!suggestion.authorEmail) {
      toast.error('Cannot reply: this suggestion was submitted anonymously');
      return;
    }
    
    setSending(true);
    try {
      await suggestionAPI.reply(suggestion._id, replyMessage.trim());
      toast.success('Reply sent successfully!');
      setShowReplyModal(false);
      setReplyMessage('');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="glass-card p-5 hover:border-cyber-500/30 transition-all duration-300">
        {/* List-style layout */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-11 h-11 bg-gradient-to-br from-cyber-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyber-500/30">
            <User className="w-5 h-5 text-cyber-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium text-white">
                {suggestion.isAnonymous ? 'Anonymous' : suggestion.authorName}
              </span>
              {suggestion.status === 'reacted' && suggestion.reaction ? (
                <span className="text-xl">{suggestion.reaction}</span>
              ) : statusConfig.label && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </span>
              )}
              <span className="text-xs text-gray-500 ml-auto font-mono">
                {format.date(suggestion.createdAt)}
              </span>
            </div>

            {isOwner && suggestion.authorEmail && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                <Mail className="w-3 h-3 text-cyber-400" />
                {suggestion.authorEmail}
              </div>
            )}

            <p className="text-gray-300 text-sm whitespace-pre-wrap mb-3 leading-relaxed">
              {suggestion.content}
            </p>

            {/* Reply display */}
            {suggestion.reply && (
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 mt-3 border border-green-500/30">
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-400 mb-2">
                  <Reply className="w-3.5 h-3.5" />
                  Reply from owner
                </div>
                <p className="text-sm text-white">{suggestion.reply.message}</p>
                <p className="text-xs text-gray-500 mt-2 font-mono">{format.date(suggestion.reply.createdAt)}</p>
              </div>
            )}

            {/* Actions for owner - inline buttons */}
            {isOwner && (
              <div className="flex items-center gap-2 mt-4">
                {suggestion.authorEmail && !suggestion.reply && (
                  <button
                    onClick={() => setShowReplyModal(true)}
                    className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    Reply
                  </button>
                )}
                
                {suggestion.status === 'archived' ? (
                  <button
                    onClick={handleUnarchive}
                    className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={handleArchive}
                    className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Smile className="w-3.5 h-3.5" />
                    React
                  </button>
                  {showReactions && (
                    <div className="absolute bottom-full left-0 mb-2 glass-card p-2 flex gap-1 z-20 animate-scaleIn">
                      {REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(emoji)}
                          className="text-xl hover:scale-125 transition-transform p-1 rounded hover:bg-dark-700/50"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-card max-w-2xl w-full animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-dark-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyber-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-cyber-500/30">
                  <Reply className="w-5 h-5 text-cyber-400" />
                </div>
                <h2 className="font-semibold text-white text-lg">Reply to Suggestion</h2>
              </div>
              <button 
                onClick={() => setShowReplyModal(false)}
                className="p-2 rounded-lg hover:bg-dark-700/50 border border-transparent hover:border-dark-600/50 transition-all duration-300"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-dark-800/60 rounded-xl p-4 mb-5 border border-dark-600/50">
                <p className="text-sm text-gray-500 mb-2">Original suggestion:</p>
                <p className="text-gray-300">{suggestion.content}</p>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-cyber-400" />
                  Will be sent to: <span className="text-gray-400">{suggestion.authorEmail}</span>
                </p>
              </div>

              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="input-field min-h-[120px] resize-none"
                placeholder="Write your reply..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-2 text-right font-mono">
                {replyMessage.length}/1000
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={sending || !replyMessage.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuggestionCard;
import { useState } from 'react';
import { X, Send, Mail, User, EyeOff, Image, Sparkles } from 'lucide-react';
import { suggestionAPI } from '../services/api';
import toast from 'react-hot-toast';

const SuggestionForm = ({ box, onClose, onSuccess, userId }) => {
  const [formData, setFormData] = useState({
    content: '',
    authorEmail: '',
    authorName: '',
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error('Please enter your suggestion');
      return;
    }
    if (!formData.isAnonymous && !formData.authorEmail.trim()) {
      toast.error('Email is required (or submit anonymously)');
      return;
    }

    setLoading(true);
    try {
      const submitData = { ...formData };
      if (userId) {
        submitData.userId = userId;
      }
      const response = await suggestionAPI.create(box.boxId, submitData);
      toast.success(response.data.message);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-card w-full max-w-lg animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-dark-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {box.logoUrl ? (
                <img 
                  src={box.logoUrl} 
                  alt={box.title}
                  className="w-14 h-14 rounded-xl object-cover border border-dark-600/50"
                />
              ) : (
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center border border-dark-600/50"
                  style={{ backgroundColor: box.theme?.primaryColor || '#00d4ff' }}
                >
                  <Image className="w-7 h-7 text-white/70" />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-white text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyber-400" />
                  Share Your Suggestion
                </h2>
                <p className="text-sm text-gray-500">{box.title}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-700/50 border border-transparent hover:border-dark-600/50 transition-all duration-300"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Your Suggestion *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input-field min-h-[120px] resize-none"
              placeholder="Share your ideas, feedback, or suggestions..."
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 text-right font-mono">
              {formData.content.length}/2000
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-dark-800/60 border border-dark-600/50 hover:border-cyber-500/30 transition-all duration-300">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked, authorName: '', authorEmail: '' })}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                formData.isAnonymous 
                  ? 'bg-cyber-500 border-cyber-500' 
                  : 'border-gray-600'
              }`}>
                {formData.isAnonymous && (
                  <svg className="w-3 h-3 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <EyeOff className="w-4 h-4" />
              Submit anonymously
            </div>
          </label>

          {!formData.isAnonymous && (
            <div className="space-y-5 animate-slideUp">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <Mail className="w-4 h-4 inline mr-2 text-cyber-400" />
                  Email *
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                  <input
                    type="email"
                    value={formData.authorEmail}
                    onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                    className="input-field pl-12"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <User className="w-4 h-4 inline mr-2 text-cyber-400" />
                  Your Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="input-field pl-12"
                    placeholder="John Doe (optional)"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestionForm;

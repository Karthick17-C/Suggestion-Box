import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boxAPI } from '../services/api';
import { 
  Box, ArrowLeft, Eye, EyeOff, Lock, Palette, 
  Check, AlertCircle, Sparkles, Image, Link as LinkIcon, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLOR_OPTIONS = [
  '#00d4ff', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', 
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

const CreateBox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [canCreate, setCanCreate] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    logoUrl: '',
    isPublic: true,
    passkey: '',
    theme: {
      primaryColor: '#00d4ff',
      backgroundColor: '#020617'
    }
  });

  useEffect(() => {
    checkLimit();
  }, []);

  const checkLimit = async () => {
    try {
      const response = await boxAPI.getMyBoxes();
      if (response.data.boxCount >= response.data.boxLimit) {
        setCanCreate(false);
        toast.error(`You've reached your box limit of ${response.data.boxLimit}`);
      }
    } catch (error) {
      console.error('Error checking limit:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a box title');
      return;
    }

    if (!formData.isPublic && !formData.passkey.trim()) {
      toast.error('Please enter a passkey for private box');
      return;
    }

    setLoading(true);
    try {
      const response = await boxAPI.createBox(formData);
      toast.success('Suggestion box created successfully!');
      navigate(`/box/${response.data.data.boxId}/manage`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create box');
    } finally {
      setLoading(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="min-h-screen bg-dark-900 cyber-grid flex items-center justify-center p-4">
        <div className="glass-card p-10 max-w-md w-full text-center animate-slideUp">
          <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
            <AlertCircle className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Box Limit Reached</h2>
          <p className="text-gray-400 mb-8">
            You've reached your maximum number of boxes. Delete an existing box or upgrade your account.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary w-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 cyber-grid">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-cyber-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-4 mb-10 animate-slideUp">
          <div className="w-14 h-14 bg-gradient-to-br from-cyber-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-cyber-500/30">
            <Sparkles className="w-7 h-7 text-cyber-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Create <span className="gradient-text">Suggestion Box</span>
            </h1>
            <p className="text-gray-500">Set up a new box to collect feedback</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="glass-card p-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Box Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Product Feedback, Team Ideas"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="What kind of suggestions are you looking for?"
                  maxLength={500}
                />
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <Image className="w-4 h-4 inline mr-2 text-cyber-400" />
                  Logo Image URL
                </label>
                <div className="relative group">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="input-field pl-11"
                    placeholder="https://example.com/your-logo.png"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter a URL to your organization/product logo (recommended: 200x200px)
                </p>
              </div>

              {/* Color Picker */}
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
                      onClick={() => setFormData({ 
                        ...formData, 
                        theme: { ...formData.theme, primaryColor: color } 
                      })}
                      className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center hover:scale-110 ${
                        formData.theme.primaryColor === color 
                          ? 'ring-2 ring-offset-2 ring-offset-dark-800 ring-white/50 scale-110' 
                          : 'hover:ring-2 hover:ring-offset-2 hover:ring-offset-dark-800 hover:ring-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {formData.theme.primaryColor === color && (
                        <Check className="w-5 h-5 text-white drop-shadow-lg" />
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
                    onClick={() => setFormData({ ...formData, isPublic: true, passkey: '' })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      formData.isPublic 
                        ? 'border-cyber-500/70 bg-cyber-500/10' 
                        : 'border-dark-600/50 hover:border-dark-500'
                    }`}
                  >
                    <Eye className={`w-5 h-5 mb-2 ${formData.isPublic ? 'text-cyber-400' : 'text-gray-500'}`} />
                    <div className={`font-medium ${formData.isPublic ? 'text-cyber-400' : 'text-gray-400'}`}>
                      Public
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Anyone can submit</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: false })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      !formData.isPublic 
                        ? 'border-cyber-500/70 bg-cyber-500/10' 
                        : 'border-dark-600/50 hover:border-dark-500'
                    }`}
                  >
                    <EyeOff className={`w-5 h-5 mb-2 ${!formData.isPublic ? 'text-cyber-400' : 'text-gray-500'}`} />
                    <div className={`font-medium ${!formData.isPublic ? 'text-cyber-400' : 'text-gray-400'}`}>
                      Private
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Requires passkey</div>
                  </button>
                </div>
              </div>

              {/* Passkey */}
              {!formData.isPublic && (
                <div className="animate-slideUp space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    <Lock className="w-4 h-4 inline mr-2 text-cyber-400" />
                    Passkey *
                  </label>
                  <input
                    type="text"
                    value={formData.passkey}
                    onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                    className="input-field"
                    placeholder="Enter a passkey for your box"
                  />
                  <p className="text-xs text-gray-500">
                    Share this passkey with people you want to submit suggestions
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-3 py-4 mt-8"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Box className="w-5 h-5" />
                    Create Suggestion Box
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-cyber-400" />
              <span className="text-sm font-medium text-gray-400">Live Preview</span>
            </div>
            <div className="glass-card overflow-hidden">
              <div 
                className="h-48 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: '#0a0f1a' }}
              >
                {/* Decorative Background */}
                <div className="absolute inset-0">
                  <div 
                    className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl" 
                    style={{ backgroundColor: formData.theme.primaryColor }} 
                  />
                  <div 
                    className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full opacity-15 blur-3xl" 
                    style={{ backgroundColor: formData.theme.primaryColor }} 
                  />
                </div>
                
                {formData.logoUrl ? (
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo preview" 
                    className="w-24 h-24 object-cover rounded-2xl shadow-lg relative z-10 border border-dark-600/50 animate-float"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div 
                    className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg relative z-10 border border-dark-600/50 animate-float"
                    style={{ 
                      backgroundColor: formData.theme.primaryColor,
                      boxShadow: `0 10px 40px -5px ${formData.theme.primaryColor}40`
                    }}
                  >
                    <Image className="w-12 h-12 text-white/70" />
                  </div>
                )}

                {!formData.isPublic && (
                  <div className="absolute top-4 right-4 bg-dark-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium text-amber-400 border border-amber-500/30">
                    <Lock className="w-3 h-3" />
                    Private
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-white text-xl mb-3">
                  {formData.title || 'Your Box Title'}
                </h3>
                <p className="text-gray-500">
                  {formData.description || 'Your box description will appear here'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBox;

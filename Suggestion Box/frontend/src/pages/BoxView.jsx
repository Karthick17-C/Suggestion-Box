import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boxAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SuggestionForm from '../components/SuggestionForm';
import { Lock, MessageSquare, Users, Send, ArrowLeft, CheckCircle, Image, AlertCircle, Sparkles, Zap, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const BoxView = () => {
  const { boxId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchBox();
  }, [boxId]);

  const fetchBox = async () => {
    try {
      const response = await boxAPI.getBox(boxId);
      setBox(response.data.data);
      if (response.data.data.isPublic) {
        setAccessGranted(true);
      }
      // Check if current user is the owner
      if (isAuthenticated && user && response.data.data.owner?._id === user.id) {
        setIsOwner(true);
      }
    } catch (error) {
      toast.error('Box not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPasskey = async (e) => {
    e.preventDefault();
    if (!passkeyInput.trim()) {
      toast.error('Please enter the passkey');
      return;
    }

    setVerifying(true);
    try {
      await boxAPI.verifyPasskey(boxId, passkeyInput);
      setAccessGranted(true);
      toast.success('Access granted!');
    } catch (error) {
      toast.error('Invalid passkey');
    } finally {
      setVerifying(false);
    }
  };

  const handleSuggestionSuccess = () => {
    setSubmitted(true);
    setShowSuggestionForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 cyber-grid flex items-center justify-center">
        <LoadingSpinner text="Loading suggestion box..." />
      </div>
    );
  }

  if (!box) {
    return null;
  }

  // Thank you screen after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-900 cyber-grid flex items-center justify-center p-4">
        {/* Floating Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb w-64 h-64 -top-32 -left-32 opacity-30" />
          <div className="floating-orb w-96 h-96 -bottom-48 -right-48 opacity-20" style={{ animationDelay: '2s' }} />
        </div>

        <div className="glass-card p-10 max-w-md w-full text-center animate-slideUp">
          <div 
            className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-dark-600/50 animate-float"
            style={{ 
              backgroundColor: box.theme?.primaryColor || '#00d4ff',
              boxShadow: `0 20px 40px -10px ${box.theme?.primaryColor || '#00d4ff'}40`
            }}
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Thank You! 🎉</h2>
          <p className="text-gray-400 mb-8">
            Your suggestion has been submitted to <span className="text-white font-medium">{box.title}</span>. 
            We appreciate your feedback!
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setSubmitted(false)}
              className="btn-secondary flex-1"
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-primary flex-1"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Passkey required screen
  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-dark-900 cyber-grid flex items-center justify-center p-4">
        {/* Floating Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb w-64 h-64 -top-32 -left-32 opacity-30" />
          <div className="floating-orb w-96 h-96 -bottom-48 -right-48 opacity-20" style={{ animationDelay: '2s' }} />
        </div>

        <div className="glass-card p-10 max-w-md w-full animate-slideUp">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-cyber-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-10">
            {box.logoUrl ? (
              <img 
                src={box.logoUrl} 
                alt={box.title}
                className="w-24 h-24 rounded-2xl object-cover mx-auto mb-6 border border-dark-600/50 animate-float"
              />
            ) : (
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-dark-600/50 animate-float"
                style={{ backgroundColor: box.theme?.primaryColor || '#00d4ff' }}
              >
                <Image className="w-12 h-12 text-white/70" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-white mb-4">{box.title}</h1>
            <div className="flex items-center justify-center gap-2 text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full inline-flex border border-amber-500/30">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Private Box</span>
            </div>
          </div>

          <p className="text-gray-400 text-center mb-8">
            This suggestion box requires a passkey to access. Enter the passkey to submit your suggestions.
          </p>

          <form onSubmit={handleVerifyPasskey}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter Passkey
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={verifying}
              className="btn-primary w-full flex items-center justify-center gap-3 py-4"
            >
              {verifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Unlock Box
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main box view
  return (
    <div className="min-h-screen bg-dark-900 cyber-grid">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl" 
            style={{ backgroundColor: box.theme?.primaryColor || '#00d4ff' }} 
          />
          <div 
            className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full opacity-15 blur-3xl" 
            style={{ backgroundColor: box.theme?.primaryColor || '#00d4ff' }} 
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16 relative">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-cyber-400 mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="text-center animate-slideUp">
            {/* Logo */}
            {box.logoUrl ? (
              <img 
                src={box.logoUrl} 
                alt={box.title}
                className="w-28 h-28 object-cover rounded-2xl mx-auto mb-8 border border-dark-600/50 animate-float"
                style={{ boxShadow: `0 20px 50px -10px ${box.theme?.primaryColor || '#00d4ff'}40` }}
              />
            ) : (
              <div 
                className="w-28 h-28 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-dark-600/50 animate-float"
                style={{ 
                  backgroundColor: box.theme?.primaryColor || '#00d4ff',
                  boxShadow: `0 20px 50px -10px ${box.theme?.primaryColor || '#00d4ff'}40`
                }}
              >
                <Image className="w-14 h-14 text-white/70" />
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{box.title}</h1>
            
            {box.description && (
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                {box.description}
              </p>
            )}

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-10">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyber-400" />
                <span>{box.suggestionsCount || 0} suggestions received</span>
              </div>
            </div>

            {isOwner ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">You own this box</span>
                </div>
                <p className="text-amber-400/70 text-sm mt-2">
                  Box owners cannot submit suggestions to their own boxes.
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowSuggestionForm(true)}
                className="inline-flex items-center gap-3 text-lg py-4 px-12 rounded-xl font-semibold text-dark-900 transition-all duration-300 hover:scale-105 hover:shadow-neon-strong"
                style={{ 
                  backgroundColor: box.theme?.primaryColor || '#00d4ff',
                  boxShadow: `0 10px 40px -5px ${box.theme?.primaryColor || '#00d4ff'}50`
                }}
              >
                <Send className="w-5 h-5" />
                Share Your Suggestion
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-card p-10 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-5 h-5 text-cyber-400" />
            <h2 className="text-xl font-semibold text-white">How it works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-dark-600/50"
                style={{ backgroundColor: `${box.theme?.primaryColor || '#00d4ff'}20` }}
              >
                <span className="font-bold" style={{ color: box.theme?.primaryColor || '#00d4ff' }}>1</span>
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Write your idea</h3>
                <p className="text-sm text-gray-500">Share your thoughts, feedback, or suggestions</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-dark-600/50"
                style={{ backgroundColor: `${box.theme?.primaryColor || '#00d4ff'}20` }}
              >
                <span className="font-bold" style={{ color: box.theme?.primaryColor || '#00d4ff' }}>2</span>
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Submit</h3>
                <p className="text-sm text-gray-500">Your suggestion is sent directly to the box owner</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-dark-600/50"
                style={{ backgroundColor: `${box.theme?.primaryColor || '#00d4ff'}20` }}
              >
                <span className="font-bold" style={{ color: box.theme?.primaryColor || '#00d4ff' }}>3</span>
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Make impact</h3>
                <p className="text-sm text-gray-500">Your ideas help improve products and services</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion Form Modal */}
      {showSuggestionForm && (
        <SuggestionForm 
          box={box} 
          onClose={() => setShowSuggestionForm(false)}
          onSuccess={handleSuggestionSuccess}
          userId={user?.id}
        />
      )}
    </div>
  );
};

export default BoxView;

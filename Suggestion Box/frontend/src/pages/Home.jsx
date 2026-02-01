import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { boxAPI } from '../services/api';
import BoxCard from '../components/BoxCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, ArrowRight } from 'lucide-react';

const Home = () => {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBoxes();
  }, []);

  const fetchBoxes = async (searchTerm = '') => {
    setLoading(true);
    try {
      const response = await boxAPI.getPublicBoxes({ search: searchTerm, limit: 12 });
      setBoxes(response.data.data);
    } catch (error) {
      console.error('Error fetching boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBoxes(search);
  };

  return (
    <div className="min-h-screen bg-dark-900 cyber-grid">
      {/* Hero Section - Centered and Simplified */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="floating-orb w-[600px] h-[600px] bg-cyber-500 -top-40 -left-40" />
          <div className="floating-orb w-[500px] h-[500px] bg-purple-600 -bottom-40 -right-40 animation-delay-2000" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-dark-900/80" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slideUp">
              <span className="gradient-text-premium">Ideas to reality</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-slideUp stagger-2">
              Browse suggestion boxes and share your thoughts with the community
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp stagger-3">
              <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-lg py-4 px-8">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent" />
      </section>

      {/* Features */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-8 group hover:border-cyber-500/50 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-cyber-500/20 text-cyber-400 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Privacy</h3>
              <p className="text-gray-400 leading-relaxed">Public or private boxes with optional passkey protection.</p>
            </div>
            <div className="glass-card p-8 group hover:border-cyber-500/50 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Share Thoughts</h3>
              <p className="text-gray-400 leading-relaxed">Submit suggestions anonymously or with your name.</p>
            </div>
            <div className="glass-card p-8 group hover:border-cyber-500/50 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Reactions</h3>
              <p className="text-gray-400 leading-relaxed">React to suggestions with emojis and reply to feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Boxes */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Explore <span className="gradient-text">Boxes</span>
              </h2>
              <p className="text-gray-400">Discover and contribute to suggestion boxes</p>
            </div>
            
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search boxes..."
                className="input-field pl-12 pr-4"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button type="submit" className="p-2 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading boxes..." />
          ) : boxes.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <h3 className="text-xl font-semibold text-white mb-3">No boxes found</h3>
              <p className="text-gray-400 mb-8">Be the first to create one!</p>
              <Link to="/my-hub" className="btn-primary inline-flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boxes.map((box, index) => (
                <div key={box.boxId} className="animate-slideUp" style={{ animationDelay: `${index * 0.05}s` }}>
                  <BoxCard box={box} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

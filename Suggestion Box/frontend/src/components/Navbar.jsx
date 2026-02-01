import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, LogOut, Menu, X, User, LayoutDashboard, Settings, ChevronDown, Boxes, Inbox, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-2xl border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center shadow-neon group-hover:shadow-neon-strong transition-all duration-300">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Suggest</span>
              <span className="gradient-text">Box</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link 
              to="/" 
              className={`btn-ghost flex items-center gap-2 ${location.pathname === '/' ? 'text-cyber-400 bg-cyber-500/10 border-cyber-500/30' : ''}`}
            >
              <Sparkles className="w-4 h-4" />
              Explore
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`btn-ghost flex items-center gap-2 ${location.pathname === '/dashboard' || location.pathname === '/my-hub' ? 'text-cyber-400 bg-cyber-500/10 border-cyber-500/30' : ''}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="relative ml-3 pl-3 border-l border-dark-600/50" ref={profileMenuRef}>
                  <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-dark-700/50 transition-all duration-300 border border-transparent hover:border-dark-600/50"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-500/20 to-purple-500/20 flex items-center justify-center border border-cyber-500/30">
                      <User className="w-4 h-4 text-cyber-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-300">{user?.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-dark-800 border border-dark-600 rounded-xl shadow-xl py-2 animate-scaleIn origin-top-right">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-dark-600">
                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                      </div>

                      {/* Navigation Links */}
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-cyber-400 transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-500" />
                          Dashboard
                        </Link>
                        <Link
                          to="/my-hub"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-cyber-400 transition-all"
                        >
                          <Boxes className="w-4 h-4 text-gray-500" />
                          My Boxes
                        </Link>
                        <Link
                          to="/inbox"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-cyber-400 transition-all"
                        >
                          <Inbox className="w-4 h-4 text-gray-500" />
                          Inbox
                        </Link>
                        <Link
                          to="/account"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-cyber-400 transition-all"
                        >
                          <User className="w-4 h-4 text-gray-500" />
                          Account
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-dark-600 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/register" className="btn-primary ml-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2.5 rounded-xl bg-dark-800/50 border border-dark-600/50 text-gray-400 hover:text-cyber-400 hover:border-cyber-500/30 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700/50 animate-slideUp">
            <div className="flex flex-col gap-2">
              <Link 
                to="/" 
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${location.pathname === '/' ? 'text-cyber-400 bg-cyber-500/10 border border-cyber-500/30' : 'text-gray-300 hover:bg-dark-700/50 hover:text-cyber-400'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sparkles className="w-4 h-4" />
                Explore
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${location.pathname === '/dashboard' || location.pathname === '/my-hub' ? 'text-cyber-400 bg-cyber-500/10 border border-cyber-500/30' : 'text-gray-300 hover:bg-dark-700/50 hover:text-cyber-400'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/inbox" 
                    className="px-4 py-3 rounded-xl text-gray-300 font-medium hover:bg-dark-700/50 hover:text-cyber-400 transition-all flex items-center gap-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Inbox className="w-4 h-4" />
                    Inbox
                  </Link>
                  <div className="px-4 py-4 flex items-center justify-between border-t border-dark-700/50 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-500/20 to-purple-500/20 flex items-center justify-center border border-cyber-500/30">
                        <User className="w-5 h-5 text-cyber-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">{user?.name}</span>
                    </div>
                    <button onClick={handleLogout} className="text-red-400 font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-3 border-t border-dark-700/50 mt-2">
                  <Link 
                    to="/login" 
                    className="px-4 py-3 rounded-xl text-gray-300 font-medium text-center hover:bg-dark-700/50 transition-all border border-dark-600/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyHub from './pages/MyHub';
import CreateBox from './pages/CreateBox';
import BoxView from './pages/BoxView';
import ManageBox from './pages/ManageBox';
import Settings from './pages/Settings';
import Account from './pages/Account';
import Inbox from './pages/Inbox';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Guest Route (redirect if authenticated)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/my-hub" replace />;
  }

  return children;
};

// Layout with Navbar
const MainLayout = ({ children, showNavbar = true }) => {
  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <MainLayout>
          <Home />
        </MainLayout>
      } />
      
      <Route path="/box/:boxId" element={
        <MainLayout>
          <BoxView />
        </MainLayout>
      } />

      <Route path="/inbox" element={
        <MainLayout>
          <Inbox />
        </MainLayout>
      } />

      {/* Guest Routes (redirect if logged in) */}
      <Route path="/login" element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      } />
      
      <Route path="/register" element={
        <GuestRoute>
          <Register />
        </GuestRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/my-hub" element={
        <ProtectedRoute>
          <MainLayout>
            <MyHub />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/create-box" element={
        <ProtectedRoute>
          <MainLayout>
            <CreateBox />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/box/:boxId/manage" element={
        <ProtectedRoute>
          <MainLayout>
            <ManageBox />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/account" element={
        <ProtectedRoute>
          <MainLayout>
            <Account />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <MainLayout>
          <div className="min-h-screen flex items-center justify-center bg-dark-900">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-500/5 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
            </div>
            <div className="text-center relative z-10">
              <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
              <p className="text-gray-400 mb-8 text-lg">Page not found</p>
              <a href="/" className="btn-primary inline-flex items-center gap-2">
                Go Home
              </a>
            </div>
          </div>
        </MainLayout>
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#00d4ff',
                secondary: '#020617',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

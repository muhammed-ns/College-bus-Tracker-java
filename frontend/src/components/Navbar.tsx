import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bus, MapPin, Shield, Navigation, LogOut, LogIn, UserCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Branding */}
          <Link to="/student" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                CampusBus <span className="text-blue-600 font-extrabold">LIVE</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Real-time Shuttle Tracking</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              to="/student"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === '/student' || location.pathname === '/'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Live Map</span>
            </Link>

            {isAuthenticated && user?.role === 'DRIVER' && (
              <Link
                to="/driver"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/driver'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>Driver Panel</span>
              </Link>
            )}

            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/admin'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </Link>
            )}

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</span>
                  <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">{user?.role}</span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

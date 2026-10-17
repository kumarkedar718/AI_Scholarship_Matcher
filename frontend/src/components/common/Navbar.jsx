import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  GraduationCap,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Bookmark,
  FileCheck,
  Bell,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const { user, isAuthenticated, isStudent, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (hash) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-none">
                AI Scholarship Matcher
              </span>
              <span className="text-[10px] font-semibold text-slate-500 block mt-1">
                Your Goals • Our AI • A Better Future
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link
              to="/"
              className={`relative py-1 transition hover:text-indigo-600 ${
                isActive('/') ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              Home
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-fade-in"></span>
              )}
            </Link>

            <Link
              to="/scholarships"
              className={`relative py-1 transition hover:text-indigo-600 ${
                isActive('/scholarships') ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              Scholarships
              {isActive('/scholarships') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-fade-in"></span>
              )}
            </Link>

            <Link
              to="/student/ai-search"
              className={`relative py-1 flex items-center gap-1.5 transition hover:text-indigo-600 ${
                isActive('/student/ai-search') ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              AI Search
              {isActive('/student/ai-search') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-fade-in"></span>
              )}
            </Link>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className="py-1 transition hover:text-indigo-600 cursor-pointer"
            >
              How It Works
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className="py-1 transition hover:text-indigo-600 cursor-pointer"
            >
              About
            </button>

            {isAuthenticated && isStudent && (
              <Link
                to="/student/recommendations"
                className={`transition hover:text-indigo-600 ${
                  isActive('/student/recommendations') ? 'text-indigo-600 font-bold' : ''
                }`}
              >
                Recommendations
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Portal
              </Link>
            )}
          </nav>

          {/* Desktop User Controls / Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 transition text-sm font-semibold text-slate-800 shadow-xs"
                  >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-fade-in"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                        {user?.role} Account
                      </span>
                    </div>

                    {isStudent && (
                      <>
                        <Link
                          to="/student/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                          Student Dashboard
                        </Link>
                        <Link
                          to="/student/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <User className="w-4 h-4 text-indigo-600" />
                          My Profile
                        </Link>
                        <Link
                          to="/student/saved"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Bookmark className="w-4 h-4 text-amber-500" />
                          Saved Scholarships
                        </Link>
                        <Link
                          to="/student/applications"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          Application Tracker
                        </Link>
                        <Link
                          to="/student/notifications"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Bell className="w-4 h-4 text-indigo-600" />
                          Notifications
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1.5"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 hover:text-indigo-600 transition shadow-xs"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition transform hover:-translate-y-0.5"
                >
                  <User className="w-3.5 h-3.5" />
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 py-2 border-b border-slate-100"
          >
            Home
          </Link>
          <Link
            to="/scholarships"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 py-2 border-b border-slate-100"
          >
            Scholarships
          </Link>
          <Link
            to="/student/ai-search"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-indigo-600 py-2 border-b border-slate-100 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> AI Natural Search
          </Link>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="block text-left w-full text-sm font-semibold text-slate-700 py-2 border-b border-slate-100"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="block text-left w-full text-sm font-semibold text-slate-700 py-2 border-b border-slate-100"
          >
            About
          </button>

          {isAuthenticated ? (
            <div className="pt-3 space-y-2">
              {isStudent && (
                <>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-slate-700 py-1.5"
                  >
                    Student Dashboard
                  </Link>
                  <Link
                    to="/student/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-slate-700 py-1.5"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/student/recommendations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-slate-700 py-1.5"
                  >
                    AI Recommendations
                  </Link>
                  <Link
                    to="/student/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-slate-700 py-1.5"
                  >
                    Application Tracker
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-bold text-purple-700 py-1.5"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left text-sm font-bold text-rose-600 pt-3 border-t border-slate-100"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-2xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-2xl shadow-md"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Sparkles,
  Search,
  Bookmark,
  FileCheck,
  Bell,
  ShieldCheck,
  Award,
  Users,
  BarChart3
} from 'lucide-react';

export const StudentSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const links = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/student/profile', icon: User },
    { label: 'AI Recommendations', path: '/student/recommendations', icon: Sparkles },
    { label: 'AI Natural Search', path: '/student/ai-search', icon: Search },
    { label: 'Saved Scholarships', path: '/student/saved', icon: Bookmark },
    { label: 'Application Tracker', path: '/student/applications', icon: FileCheck },
    { label: 'Notifications', path: '/student/notifications', icon: Bell }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Student Portal</p>
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition ${
                active
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export const AdminSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const links = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Analytics & Insights', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Scholarship Management', path: '/admin/scholarships', icon: Award },
    { label: 'Student Directory', path: '/admin/students', icon: Users }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 hidden md:block border-r border-slate-800">
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-3 mb-4 text-purple-400">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-extrabold text-sm uppercase tracking-wider">Admin Portal</span>
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition ${
                active
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-slate-500'}`} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Bell, Check, ExternalLink, Calendar, FileText, Award, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const NotificationBell = () => {
  const { isAuthenticated, isStudent } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !isStudent) return;
    try {
      const { data } = await API.get('/notifications/unread-count');
      if (data.success) {
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (err) {
      // Silently catch polling error
    }
  };

  const fetchRecentNotifications = async () => {
    if (!isAuthenticated || !isStudent) return;
    try {
      setLoading(true);
      const { data } = await API.get('/notifications?page=1&limit=5');
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isStudent) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Polling every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isStudent]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchRecentNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const { data } = await API.patch(`/notifications/${id}/read`);
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data } = await API.patch('/notifications/read-all');
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'StatusUpdate':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'DeadlineApproaching':
      case 'DeadlineToday':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'NewScholarship':
        return <Award className="w-4 h-4 text-indigo-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-purple-600" />;
    }
  };

  if (!isAuthenticated || !isStudent) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2.5 rounded-2xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-extrabold text-[10px] rounded-full ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-fade-in">
          {/* Header */}
          <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400 font-semibold">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Notifications</p>
                <p className="text-[11px] text-slate-400">You are all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3.5 hover:bg-slate-50 transition flex items-start justify-between gap-3 ${
                    !n.isRead ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-slate-900 text-xs line-clamp-1">{n.title}</h5>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                      <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {n.linkUrl && (
                      <Link
                        to={n.linkUrl}
                        onClick={() => {
                          setIsOpen(false);
                          if (!n.isRead) handleMarkAsRead(n._id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                        title="Go to details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(n._id, e)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition"
                        title="Mark read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 px-4 border-t border-slate-100 text-center">
            <Link
              to="/student/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition block py-1"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

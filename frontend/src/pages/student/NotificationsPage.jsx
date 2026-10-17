import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  FileText,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useNotification();

  const fetchNotifications = async (pageNum = page, tab = activeTab) => {
    try {
      setLoading(true);
      let query = `?page=${pageNum}&limit=10`;
      if (tab === 'Unread') query += '&unreadOnly=true';
      if (tab === 'Deadlines') query += '&type=DeadlineApproaching';
      if (tab === 'Status Updates') query += '&type=StatusUpdate';
      if (tab === 'New Aid') query += '&type=NewScholarship';

      const { data } = await API.get(`/notifications${query}`);
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
        setTotalPages(data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      addToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page, activeTab);
  }, [page, activeTab]);

  const handleMarkAsRead = async (id) => {
    try {
      const { data } = await API.patch(`/notifications/${id}/read`);
      if (data.success) {
        addToast('Marked as read', 'success');
        fetchNotifications(page, activeTab);
      }
    } catch (err) {
      addToast('Failed to mark as read', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data } = await API.patch('/notifications/read-all');
      if (data.success) {
        addToast(data.message || 'Marked all as read', 'success');
        fetchNotifications(page, activeTab);
      }
    } catch (err) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const { data } = await API.delete(`/notifications/${id}`);
      if (data.success) {
        addToast('Notification removed', 'success');
        fetchNotifications(page, activeTab);
      }
    } catch (err) {
      addToast('Failed to delete notification', 'error');
    }
  };

  const handleClearRead = async () => {
    try {
      const { data } = await API.delete('/notifications');
      if (data.success) {
        addToast(data.message || 'Cleared read notifications', 'success');
        fetchNotifications(1, activeTab);
      }
    } catch (err) {
      addToast('Failed to clear read notifications', 'error');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'StatusUpdate':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'DeadlineApproaching':
      case 'DeadlineToday':
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case 'NewScholarship':
        return <Award className="w-5 h-5 text-indigo-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-purple-600" />;
    }
  };

  const filterTabs = ['All', 'Unread', 'Deadlines', 'Status Updates', 'New Aid'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-indigo-600" />
            Notifications Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with your scholarship application milestones, deadlines, and financial aid news.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}

          <button
            onClick={handleClearRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            Clear Read
          </button>
        </div>
      </div>

      {/* Filter Tabs Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 mr-1" />
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <LoadingSpinner label="Fetching notifications..." />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-xl mb-2">No Notifications Found</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            You don't have any notifications in this filter view right now.
          </p>
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Browse Scholarships
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`bg-white rounded-2xl border p-5 transition flex items-start justify-between gap-4 shadow-xs ${
                !n.isRead ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-3 rounded-2xl bg-slate-100 flex-shrink-0 mt-0.5">
                  {getTypeIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] font-semibold text-slate-400 mt-2 block">
                    {new Date(n.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {n.linkUrl && (
                  <Link
                    to={n.linkUrl}
                    onClick={() => {
                      if (!n.isRead) handleMarkAsRead(n._id);
                    }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition font-bold text-xs flex items-center gap-1"
                    title="View related page"
                  >
                    View <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDeleteNotification(n._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

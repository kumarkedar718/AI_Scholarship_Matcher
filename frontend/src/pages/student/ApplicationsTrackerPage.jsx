import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import {
  FileCheck,
  ExternalLink,
  Calendar,
  Edit3,
  Trash2,
  Search,
  Filter,
  Bookmark,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  AlertTriangle,
  ArrowUpDown,
  PlusCircle,
  BookOpen
} from 'lucide-react';

export const ApplicationsTrackerPage = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    saved: 0,
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');

  // Notes Modal state
  const [editingNotesApp, setEditingNotesApp] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Delete Confirmation state
  const [deletingApp, setDeletingApp] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { addToast } = useNotification();

  const fetchTracker = async () => {
    try {
      setLoading(true);
      const [appsRes, statsRes] = await Promise.all([
        API.get('/applications'),
        API.get('/applications/stats')
      ]);

      if (appsRes.data.success) {
        setApplications(appsRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load application tracker:', err);
      addToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracker();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const { data } = await API.patch(`/applications/${appId}`, {
        status: newStatus
      });
      if (data.success) {
        addToast(`Status updated to "${data.data.status}"`, 'success');
        fetchTracker();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleOpenNotesModal = (app) => {
    setEditingNotesApp(app);
    setNotesText(app.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!editingNotesApp) return;
    try {
      setSavingNotes(true);
      const { data } = await API.patch(`/applications/${editingNotesApp._id}`, {
        notes: notesText
      });
      if (data.success) {
        addToast('Application notes saved', 'success');
        setEditingNotesApp(null);
        fetchTracker();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!deletingApp) return;
    try {
      setIsDeleting(true);
      const { data } = await API.delete(`/applications/${deletingApp._id}`);
      if (data.success) {
        addToast('Application removed from tracker', 'success');
        setDeletingApp(null);
        fetchTracker();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete application', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const allStatuses = [
    'Saved',
    'Applied',
    'Under Review',
    'Shortlisted',
    'Approved',
    'Rejected',
    'Withdrawn'
  ];

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Saved':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Shortlisted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDeadlineBadge = (deadlineDate) => {
    if (!deadlineDate) return null;
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
          <AlertTriangle className="w-3 h-3" /> Expired
        </span>
      );
    } else if (diffDays <= 7) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
          <Clock className="w-3 h-3" /> {diffDays === 0 ? 'Due Today' : `${diffDays} days left`}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
          <Calendar className="w-3 h-3" /> {deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      );
    }
  };

  // Filter & Sort applications
  const filteredApps = applications
    .filter((app) => {
      if (activeTab !== 'All' && app.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = app.scholarshipId?.title?.toLowerCase() || '';
        const provider = app.scholarshipId?.provider?.toLowerCase() || '';
        const notes = app.notes?.toLowerCase() || '';
        return title.includes(query) || provider.includes(query) || notes.includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        const dA = a.scholarshipId?.deadline ? new Date(a.scholarshipId.deadline) : new Date(8640000000000000);
        const dB = b.scholarshipId?.deadline ? new Date(b.scholarshipId.deadline) : new Date(8640000000000000);
        return dA - dB;
      }
      if (sortBy === 'title') {
        return (a.scholarshipId?.title || '').localeCompare(b.scholarshipId?.title || '');
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-indigo-600" />
            Scholarship Application Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, update, and track all your saved and submitted scholarship applications in one place.
          </p>
        </div>
        <Link
          to="/scholarships"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          Find More Scholarships
        </Link>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div
          onClick={() => setActiveTab('All')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition text-center ${
            activeTab === 'All' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-slate-200 hover:border-indigo-200'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'All' ? 'text-indigo-100' : 'text-slate-400'}`}>
            Total
          </span>
          <span className="text-xl font-black mt-0.5 block">{stats.total}</span>
        </div>

        <div
          onClick={() => setActiveTab('Saved')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition text-center ${
            activeTab === 'Saved' ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'Saved' ? 'text-amber-100' : 'text-amber-600'}`}>
            Saved
          </span>
          <span className={`text-xl font-black mt-0.5 block ${activeTab === 'Saved' ? 'text-white' : 'text-amber-700'}`}>
            {stats.saved}
          </span>
        </div>

        <div
          onClick={() => setActiveTab('Applied')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition text-center ${
            activeTab === 'Applied' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-200 hover:border-blue-200'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'Applied' ? 'text-blue-100' : 'text-blue-600'}`}>
            Applied
          </span>
          <span className={`text-xl font-black mt-0.5 block ${activeTab === 'Applied' ? 'text-white' : 'text-blue-700'}`}>
            {stats.applied}
          </span>
        </div>

        <div
          onClick={() => setActiveTab('Under Review')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition text-center ${
            activeTab === 'Under Review' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white border-slate-200 hover:border-purple-200'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'Under Review' ? 'text-purple-100' : 'text-purple-600'}`}>
            Under Review
          </span>
          <span className={`text-xl font-black mt-0.5 block ${activeTab === 'Under Review' ? 'text-white' : 'text-purple-700'}`}>
            {stats.underReview}
          </span>
        </div>

        <div
          onClick={() => setActiveTab('Shortlisted')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition text-center ${
            activeTab === 'Shortlisted' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-slate-200 hover:border-indigo-200'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'Shortlisted' ? 'text-indigo-100' : 'text-indigo-600'}`}>
            Shortlisted
          </span>
          <span className={`text-xl font-black mt-0.5 block ${activeTab === 'Shortlisted' ? 'text-white' : 'text-indigo-700'}`}>
            {stats.shortlisted}
          </span>
        </div>

        <div
          onClick={() => setActiveTab('Approved')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition text-center ${
            activeTab === 'Approved' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'Approved' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            Approved
          </span>
          <span className={`text-xl font-black mt-0.5 block ${activeTab === 'Approved' ? 'text-white' : 'text-emerald-700'}`}>
            {stats.approved}
          </span>
        </div>

        <div
          onClick={() => setActiveTab('Rejected')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition text-center ${
            activeTab === 'Rejected' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white border-slate-200 hover:border-rose-200'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'Rejected' ? 'text-rose-100' : 'text-rose-600'}`}>
            Rejected
          </span>
          <span className={`text-xl font-black mt-0.5 block ${activeTab === 'Rejected' ? 'text-white' : 'text-rose-700'}`}>
            {stats.rejected}
          </span>
        </div>

        <div
          onClick={() => setActiveTab('Withdrawn')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition text-center ${
            activeTab === 'Withdrawn' ? 'bg-slate-700 text-white border-slate-700 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'Withdrawn' ? 'text-slate-200' : 'text-slate-500'}`}>
            Withdrawn
          </span>
          <span className={`text-xl font-black mt-0.5 block ${activeTab === 'Withdrawn' ? 'text-white' : 'text-slate-700'}`}>
            {stats.withdrawn}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {['All', ...allStatuses].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracker..."
                className="w-full text-xs font-semibold pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50/50">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-xs font-bold text-slate-700"
              >
                <option value="updatedAt">Recently Updated</option>
                <option value="deadline">Upcoming Deadline</option>
                <option value="title">Scholarship Title</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner label="Fetching tracked applications..." />
      ) : applications.length === 0 ? (
        /* Empty state when user hasn't tracked ANY application */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-xl mb-2">
            No Tracked Applications
          </h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            You haven't tracked any scholarship applications yet. Save or track scholarships to monitor their deadlines and application stages.
          </p>
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            Browse Scholarships
          </Link>
        </div>
      ) : filteredApps.length === 0 ? (
        /* Empty state when filter matches no item */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-700 text-sm">No applications found</h4>
          <p className="text-xs text-slate-500 mt-1">No applications match the status filter or search criteria.</p>
        </div>
      ) : (
        /* Applications Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Scholarship</th>
                  <th className="py-4 px-6">Deadline & Status</th>
                  <th className="py-4 px-6">Current Status</th>
                  <th className="py-4 px-6">Notes</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredApps.map((app) => {
                  const scholarship = app.scholarshipId || {};
                  return (
                    <tr key={app._id} className="hover:bg-slate-50/60 transition">
                      {/* Scholarship details */}
                      <td className="py-4 px-6">
                        <Link
                          to={`/scholarships/${scholarship._id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition line-clamp-1"
                        >
                          {scholarship.title || 'Scholarship Title'}
                        </Link>
                        <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                          {scholarship.provider || 'Provider N/A'}
                        </span>
                      </td>

                      {/* Deadline & Application Date */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div>{getDeadlineBadge(scholarship.deadline)}</div>
                          {app.appliedDate && (
                            <span className="text-[11px] font-medium text-slate-500 block">
                              Applied: {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition ${getStatusBadgeStyle(
                            app.status
                          )}`}
                        >
                          {allStatuses.map((s) => (
                            <option key={s} value={s} className="bg-white text-slate-900 font-semibold">
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Notes Snippet */}
                      <td className="py-4 px-6 max-w-xs">
                        {app.notes ? (
                          <div
                            onClick={() => handleOpenNotesModal(app)}
                            className="text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl border border-slate-200/80 cursor-pointer line-clamp-2"
                            title="Click to view/edit full notes"
                          >
                            {app.notes}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenNotesModal(app)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-600 border border-dashed border-slate-300 hover:border-indigo-300 px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Add notes
                          </button>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenNotesModal(app)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                            title="Edit notes"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {scholarship.officialUrl && (
                            <a
                              href={scholarship.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                              title="Official Application Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            onClick={() => setDeletingApp(app)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Remove from tracker"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editable Notes Modal */}
      {editingNotesApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Application Notes
              </h3>
              <button
                onClick={() => setEditingNotesApp(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-500">
              {editingNotesApp.scholarshipId?.title}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Personal Application Notes (Max 1000 characters)
              </label>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Record reference numbers, application portal passwords, interview dates, submission checklists, or follow-up notes..."
                className="w-full text-xs text-slate-800 p-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 text-right block mt-1">
                {notesText.length} / 1000 characters
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingNotesApp(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Remove Application</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{deletingApp.scholarshipId?.title}</strong> from your tracker? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingApp(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApplication}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition"
              >
                {isDeleting ? 'Removing...' : 'Remove Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

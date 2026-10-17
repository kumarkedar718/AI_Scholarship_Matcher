import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ShieldCheck, Users, Award, FileText, Plus, Calendar, ArrowUpRight } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/admin/stats');
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner label="Loading admin analytics..." />;

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Admin Control Center
          </div>
          <h1 className="text-2xl font-extrabold text-white">System Dashboard Overview</h1>
        </div>

        <Link
          to="/admin/scholarships/new"
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Scholarship
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-3xl font-extrabold text-white">{stats?.totalStudents || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Registered student profiles</span>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Scholarships</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-3xl font-extrabold text-white">{stats?.totalScholarships || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">{stats?.activeScholarships || 0} Active listings</span>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Student Applications</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-extrabold text-white">{stats?.totalApplications || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Tracked across pipeline</span>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming Deadlines</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-extrabold text-white">{stats?.upcomingDeadlines?.length || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Expiring within 30 days</span>
        </div>
      </div>

      {/* Grid: Application Pipeline Counts + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Pipeline */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Application Tracker Breakdown</h3>
          <div className="space-y-3">
            {stats?.statusCounts && Object.entries(stats.statusCounts).map(([statusName, count]) => (
              <div key={statusName} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs">
                <span className="font-semibold text-slate-300">{statusName}</span>
                <span className="font-extrabold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/50">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Scholarships Closing Soon</h3>
          {stats?.upcomingDeadlines && stats.upcomingDeadlines.length === 0 ? (
            <p className="text-xs text-slate-400">No scholarships expiring in the next 30 days.</p>
          ) : (
            <div className="space-y-3">
              {stats?.upcomingDeadlines?.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs">
                  <div>
                    <strong className="text-slate-200 block text-sm">{item.title}</strong>
                    <span className="text-slate-400">{item.provider}</span>
                  </div>
                  <span className="text-amber-400 font-bold bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/50">
                    {new Date(item.deadline).toLocaleDateString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

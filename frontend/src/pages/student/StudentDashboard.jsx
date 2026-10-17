import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ScholarshipCard } from '../../components/scholarships/ScholarshipCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Sparkles,
  Calendar,
  Bookmark,
  FileCheck,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [trackedCount, setTrackedCount] = useState(0);
  const [trackedApps, setTrackedApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/eligibility/my-matches');
        if (data.success) {
          setMatches(data.data.eligible);
          setSummary(data.data.summary);
        }

        const savedRes = await API.get('/applications/saved');
        if (savedRes.data.success) {
          setSavedCount(savedRes.data.data.length);
        }

        const trackerRes = await API.get('/applications/tracker');
        if (trackerRes.data.success) {
          setTrackedCount(trackerRes.data.data.length);
          setTrackedApps(trackerRes.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner label="Evaluating student eligibility..." />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Student Dashboard
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, <span className="text-indigo-400">{user?.name}</span>!
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed font-normal">
            {user?.profile?.isProfileComplete
              ? `Your profile is complete! We found ${summary?.eligibleCount || 0} fully eligible scholarships tailored to your academic background.`
              : 'Your profile is missing parameters. Complete your CGPA, course, and domicile details for accurate AI matching.'}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/student/recommendations"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              View AI Recommendations
            </Link>
            <Link
              to="/student/profile"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-2xl text-xs backdrop-blur-md border border-white/20 transition"
            >
              Edit Profile Parameters
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Eligible Scholarships</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600">{summary?.eligibleCount || 0}</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">Ready for application</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Needs Verification</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600">{summary?.needsVerificationCount || 0}</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">Requires profile check</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Saved Scholarships</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-indigo-600">{savedCount}</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Bookmark className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">Bookmarked by you</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Tracked Applications</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-purple-600">{trackedCount}</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">In application pipeline</span>
        </div>
      </div>

      {/* Grid: Recommended Matches + Application Status Tracker Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Top Matched Scholarships */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Recommended Matched Scholarships
            </h2>
            <Link to="/scholarships" className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700">
              Browse Directory ({summary?.totalActive || 0}) →
            </Link>
          </div>

          {matches.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h3 className="font-extrabold text-slate-800 text-sm">No Fully Matched Scholarships Found</h3>
              <p className="text-xs text-slate-500 mt-1">Update your profile parameters or explore all open scholarships.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.slice(0, 4).map((item) => (
                <ScholarshipCard
                  key={item.scholarship._id}
                  scholarship={item.scholarship}
                  evaluation={item.evaluation}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Column: Ongoing Tracked Applications */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Active Application Pipeline
              </h3>
              <Link to="/student/applications" className="text-xs font-extrabold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>

            {trackedApps.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">
                No active tracked applications yet.
              </div>
            ) : (
              <div className="space-y-3">
                {trackedApps.map((app) => (
                  <div key={app._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[160px]">
                        {app.scholarshipId?.title || 'Scholarship'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full font-extrabold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{app.scholarshipId?.provider}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

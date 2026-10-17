import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  Award,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Calendar,
  PieChart,
  UserCheck,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeTrendRange, setActiveTrendRange] = useState('days30');
  const [demographicTab, setDemographicTab] = useState('gender');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/admin/analytics');
      if (res.data && res.data.success) {
        setAnalytics(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load analytics metrics.');
      }
    } catch (err) {
      console.error('Analytics API Error:', err);
      setError(err.response?.data?.message || 'Failed to communicate with analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner label="Loading real-time analytics data from MongoDB database..." />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-slate-800/80 border border-red-500/30 rounded-2xl text-center shadow-xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Analytics System Error</h2>
        <p className="text-slate-300 mb-6">{error || 'No analytics dataset available.'}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Fetching Analytics
        </button>
      </div>
    );
  }

  const { overview, applications, scholarships, students } = analytics;

  // Selected Trend Data
  const trendData = applications?.trends?.[activeTrendRange] || [];
  const maxTrendCount = Math.max(...trendData.map((t) => t.count), 1);

  // Demographic Tab Data Map
  const demographicDataMap = {
    gender: students?.genderDistribution || [],
    category: students?.categoryDistribution || [],
    education: students?.educationLevelDistribution || [],
    state: students?.stateDistribution || [],
    income: students?.incomeDistribution || []
  };
  const activeDemoData = demographicDataMap[demographicTab] || [];
  const totalDemoCount = activeDemoData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">System Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Admin Analytics & Insights
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time metric breakdown derived directly from MongoDB database records.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Metrics
        </button>
      </div>

      {/* TOP SUMMARY CARDS (6 Cards Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Total Students</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{overview.totalStudents}</div>
          <div className="text-xs text-slate-400 mt-1">Registered users</div>
        </div>

        {/* Card 2: Verified Students */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Verified</span>
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{overview.verifiedStudents}</div>
          <div className="text-xs text-slate-400 mt-1">{overview.unverifiedStudents} pending verification</div>
        </div>

        {/* Card 3: Active Scholarships */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Active Schemes</span>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">{overview.activeScholarships}</div>
          <div className="text-xs text-slate-400 mt-1">Out of {overview.totalScholarships} total schemes</div>
        </div>

        {/* Card 4: Total Applications */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Total Tracked</span>
            <FileCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{overview.totalApplications}</div>
          <div className="text-xs text-slate-400 mt-1">Applications tracked</div>
        </div>

        {/* Card 5: Approved Applications */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Approved</span>
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300">{overview.approvedApplications}</div>
          <div className="text-xs text-slate-400 mt-1">Grants sanctioned</div>
        </div>

        {/* Card 6: Approval Rate */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Approval Rate</span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{overview.approvalRate}%</div>
          <div className="text-xs text-slate-400 mt-1">Approved vs Rejected</div>
        </div>
      </div>

      {/* SECTION 1: APPLICATION STATUS DISTRIBUTION */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              SECTION 1: Application Status Distribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live breakdown of student application tracker statuses across all categories.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {applications?.statusDistribution?.map((item) => {
            const pct = overview.totalApplications > 0
              ? Math.round((item.count / overview.totalApplications) * 100)
              : 0;

            const colorStyles = {
              Saved: 'bg-slate-700 text-slate-200 border-slate-600',
              Applied: 'bg-blue-900/40 text-blue-300 border-blue-500/40',
              'Under Review': 'bg-amber-900/40 text-amber-300 border-amber-500/40',
              Shortlisted: 'bg-purple-900/40 text-purple-300 border-purple-500/40',
              Approved: 'bg-emerald-900/40 text-emerald-300 border-emerald-500/40',
              Rejected: 'bg-rose-900/40 text-rose-300 border-rose-500/40',
              Withdrawn: 'bg-zinc-800 text-zinc-400 border-zinc-700'
            };

            const barColors = {
              Saved: 'bg-slate-400',
              Applied: 'bg-blue-500',
              'Under Review': 'bg-amber-500',
              Shortlisted: 'bg-purple-500',
              Approved: 'bg-emerald-500',
              Rejected: 'bg-rose-500',
              Withdrawn: 'bg-zinc-500'
            };

            return (
              <div
                key={item.status}
                className={`p-4 rounded-xl border ${colorStyles[item.status] || 'bg-slate-700 border-slate-600'} transition hover:border-slate-500`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{item.status}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900/60">
                    {pct}%
                  </span>
                </div>
                <div className="text-2xl font-black mb-2">{item.count}</div>
                <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColors[item.status] || 'bg-purple-500'} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: APPLICATION TRENDS */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              SECTION 2: Application Activity Trends
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily application submission counts over selected historical window.
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTrendRange('days7')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTrendRange === 'days7'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setActiveTrendRange('days30')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTrendRange === 'days30'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setActiveTrendRange('days90')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTrendRange === 'days90'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* Visual Trend Chart */}
        {trendData.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-400">
            No application submissions recorded in this time period.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-2 bg-slate-900/60 rounded-xl border border-slate-700/50 overflow-x-auto">
              {trendData.map((item) => {
                const heightPct = Math.max(Math.round((item.count / maxTrendCount) * 100), 6);
                return (
                  <div
                    key={item.date}
                    className="flex-1 min-w-[12px] flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition absolute -top-9 z-10 bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded shadow border border-slate-700 whitespace-nowrap pointer-events-none">
                      {item.date}: {item.count} applications
                    </div>

                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t hover:from-purple-500 hover:to-indigo-300 transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span>{trendData[0]?.date}</span>
              <span>{trendData[Math.floor(trendData.length / 2)]?.date}</span>
              <span>{trendData[trendData.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3 & SECTION 5 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECTION 3: MOST POPULAR SCHOLARSHIPS (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              SECTION 3: Most Popular Scholarships
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Top scholarships ranked by student application interest count.
            </p>
          </div>

          {scholarships?.popularScholarships?.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-400">
              No applications recorded for any scholarship yet.
            </div>
          ) : (
            <div className="space-y-3">
              {scholarships.popularScholarships.map((item, idx) => (
                <div
                  key={item.scholarshipId || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/70 border border-slate-700/60 rounded-xl gap-3 hover:border-slate-600 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-sm flex items-center justify-center border border-amber-500/30 shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-snug">{item.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.provider}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-lg">
                      {item.applicationCount} Applicants
                    </span>
                    {item.officialUrl && (
                      <a
                        href={item.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        title="View Official Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: SCHOLARSHIP DEADLINE OVERVIEW (1 Col) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-400" />
              SECTION 5: Deadline Overview
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active scholarship timeline status distribution.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-300 font-medium">Total Active Schemes</span>
                <span className="font-bold text-white">{scholarships?.deadlineOverview?.totalActive || 0}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Ongoing / Open-ended
                </span>
                <span className="font-bold text-emerald-400">{scholarships?.deadlineOverview?.ongoing || 0}</span>
              </div>
              <p className="text-[11px] text-emerald-400/80 mt-1">Ongoing portal schemes with no fixed end date</p>
            </div>

            <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-blue-300 font-medium flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Fixed Deadline Schemes
                </span>
                <span className="font-bold text-blue-400">{scholarships?.deadlineOverview?.fixedDeadline || 0}</span>
              </div>
              <p className="text-[11px] text-blue-400/80 mt-1">Official verified deadline dates</p>
            </div>

            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-amber-300 font-medium">Closing in 7 Days</span>
                <span className="font-bold text-amber-400">{scholarships?.deadlineOverview?.closingWithin7Days || 0}</span>
              </div>
            </div>

            <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-purple-300 font-medium">Closing in 30 Days</span>
                <span className="font-bold text-purple-400">{scholarships?.deadlineOverview?.closingWithin30Days || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: STUDENT DEMOGRAPHICS */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              SECTION 4: Student Demographics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Demographic profile distribution aggregated across registered students.
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-700 overflow-x-auto">
            <button
              onClick={() => setDemographicTab('gender')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                demographicTab === 'gender' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gender
            </button>
            <button
              onClick={() => setDemographicTab('category')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                demographicTab === 'category' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Category
            </button>
            <button
              onClick={() => setDemographicTab('education')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                demographicTab === 'education' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Education Level
            </button>
            <button
              onClick={() => setDemographicTab('state')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                demographicTab === 'state' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              State Domicile
            </button>
            <button
              onClick={() => setDemographicTab('income')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                demographicTab === 'income' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Income Range
            </button>
          </div>
        </div>

        {activeDemoData.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-400">
            No demographic data available for this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDemoData.map((item) => {
              const pct = totalDemoCount > 0 ? Math.round((item.count / totalDemoCount) * 100) : 0;
              return (
                <div key={item.label} className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-200">
                    <span>{item.label}</span>
                    <span className="text-xs font-bold text-purple-300">
                      {item.count} students ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

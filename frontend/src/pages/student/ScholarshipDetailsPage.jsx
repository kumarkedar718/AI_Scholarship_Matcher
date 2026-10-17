import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { EligibilityBreakdown } from '../../components/scholarships/EligibilityBreakdown';
import { CategoryTag, EligibilityBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import {
  Building2,
  Calendar,
  IndianRupee,
  ExternalLink,
  Sparkles,
  FileText,
  Bookmark,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ScholarshipDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated, isStudent } = useAuth();
  const { addToast } = useNotification();

  const [scholarship, setScholarship] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [saved, setSaved] = useState(false);
  const [appStatus, setAppStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/scholarships/${id}`);
        if (data.success) {
          setScholarship(data.data);
          setAiSummary(data.data.summary || '');
        }

        // Fetch Rule Evaluation & Application Tracker if logged in student
        if (isAuthenticated && isStudent) {
          const evalRes = await API.get(`/eligibility/evaluate/${id}`);
          if (evalRes.data.success) {
            setEvaluation(evalRes.data.data.evaluation);
          }

          // Check if saved
          const savedRes = await API.get('/applications/saved');
          if (savedRes.data.success) {
            const isItemSaved = savedRes.data.data.some((s) => s.scholarship?._id === id);
            setSaved(isItemSaved);
          }

          // Check tracker status
          const appsRes = await API.get('/applications');
          if (appsRes.data.success) {
            const trackedApp = appsRes.data.data.find(
              (a) => (a.scholarshipId?._id || a.scholarshipId) === id
            );
            if (trackedApp) {
              setAppStatus(trackedApp.status);
            }
          }
        }
      } catch (err) {
        addToast('Failed to load scholarship details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, isStudent]);

  const handleFetchAIExplanation = async () => {
    try {
      setLoadingAI(true);
      const { data } = await API.get(`/ai/explain/${id}`);
      if (data.success) {
        setAiExplanation(data.data.aiExplanation);
      }
    } catch (err) {
      addToast('Failed to fetch AI explanation', 'error');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSaveToggle = async () => {
    try {
      const { data } = await API.post(`/applications/save/${id}`);
      if (data.success) {
        setSaved(data.data.isSaved);
        if (data.data.isSaved && !appStatus) setAppStatus('Saved');
        addToast(data.message, 'success');
      }
    } catch (err) {
      addToast('Failed to update bookmark', 'error');
    }
  };

  const handleTrackApplication = async (status) => {
    try {
      const { data } = await API.post('/applications', {
        scholarshipId: id,
        status
      });
      if (data.success) {
        setAppStatus(data.data.status);
        if (data.data.status !== 'Withdrawn') setSaved(true);
        addToast(`Application status updated to ${data.data.status}`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update application tracker', 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Loading scholarship details..." />;
  if (!scholarship) return <div className="p-8 text-center">Scholarship not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs relative">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <CategoryTag category={scholarship.categoryType} />
            {evaluation && <EligibilityBadge status={evaluation.status} score={evaluation.score} />}
          </div>

          {isStudent && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToggle}
                className={`px-4 py-2 rounded-xl border font-semibold text-xs transition flex items-center gap-1.5 ${
                  saved
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
                {saved ? 'Saved' : 'Save Scholarship'}
              </button>

              <select
                value={appStatus || ''}
                onChange={(e) => handleTrackApplication(e.target.value)}
                className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs outline-none cursor-pointer hover:bg-indigo-100 transition"
              >
                <option value="" disabled>Track Application Status</option>
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
          {scholarship.title}
        </h1>
        <p className="text-sm font-semibold text-slate-500 flex items-center gap-2 mb-6">
          <Building2 className="w-4 h-4 text-slate-400" />
          Provided by {scholarship.provider}
        </p>

        {/* Benefits & Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Financial Grant / Benefit</span>
            <span className="text-lg font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              {scholarship.amountText}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Application Deadline</span>
            <span className="text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-5 h-5 text-indigo-600" />
              {new Date(scholarship.deadline).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="sm:text-right flex items-center sm:justify-end">
            {scholarship.officialUrl && (
              <a
                href={scholarship.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                Apply Now on Official Portal
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Concise Summary Box */}
          {aiSummary && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Scholarship Summary
              </div>
              <div className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                {aiSummary}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-lg mb-3">Full Overview</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {scholarship.description}
            </p>
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Required Document Checklist
            </h3>
            <ul className="space-y-2.5">
              {scholarship.requiredDocuments && scholarship.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar: Rule Engine + AI Explanation */}
        <div className="space-y-6">
          {evaluation && <EligibilityBreakdown evaluation={evaluation} />}

          {/* AI Match Adviser Button & Rationale */}
          {isStudent && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-purple-900 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI Personal Adviser
              </div>
              <p className="text-xs text-purple-700 mb-4">
                Get an AI breakdown explaining why this scholarship matches your profile.
              </p>

              {aiExplanation ? (
                <div className="bg-white p-4 rounded-xl border border-purple-100 text-xs text-slate-700 leading-relaxed italic">
                  "{aiExplanation}"
                </div>
              ) : (
                <button
                  onClick={handleFetchAIExplanation}
                  disabled={loadingAI}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  {loadingAI ? 'Generating AI Analysis...' : 'Generate AI Match Rationale'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

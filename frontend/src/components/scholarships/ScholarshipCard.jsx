import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CategoryTag, EligibilityBadge } from '../common/Badge';
import { Calendar, IndianRupee, Bookmark, ExternalLink, ArrowRight, Building2, Tag } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';

export const ScholarshipCard = ({ scholarship, evaluation, initialSaved = false, onSaveToggle }) => {
  const { isAuthenticated, isStudent } = useAuth();
  const { addToast } = useNotification();
  const [saved, setSaved] = useState(initialSaved);
  const [loadingSave, setLoadingSave] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please login as a student to save scholarships', 'info');
      return;
    }
    try {
      setLoadingSave(true);
      const { data } = await API.post(`/applications/save/${scholarship._id}`);
      if (data.success) {
        setSaved(data.data.isSaved);
        addToast(data.message, 'success');
        if (onSaveToggle) onSaveToggle(data.data.isSaved);
      }
    } catch (err) {
      addToast('Failed to update saved status', 'error');
    } finally {
      setLoadingSave(false);
    }
  };

  const formattedDeadline = scholarship?.deadline
    ? new Date(scholarship.deadline).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'TBA';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-6 flex flex-col justify-between group">
      <div>
        {/* Header Badges & Bookmark Action */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryTag category={scholarship.categoryType} />
            {evaluation && (
              <EligibilityBadge status={evaluation.status} score={evaluation.score} />
            )}
          </div>

          {isStudent && (
            <button
              onClick={handleSave}
              disabled={loadingSave}
              className={`p-2.5 rounded-2xl border transition duration-200 cursor-pointer ${
                saved
                  ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={saved ? 'Unsave Scholarship' : 'Save Scholarship'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Title & Provider */}
        <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-indigo-600 transition duration-200 mb-1.5">
          <Link to={`/scholarships/${scholarship._id}`}>{scholarship.title}</Link>
        </h3>
        <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-4">
          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
          {scholarship.provider}
        </p>

        {/* Description / Summary snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-normal">
          {scholarship.summary || scholarship.description}
        </p>

        {/* Benefits & Deadline Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 px-4 bg-slate-50/80 rounded-2xl mb-4 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Financial Aid</span>
            <span className="font-black text-slate-900 flex items-center gap-0.5 mt-0.5 text-sm">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              {scholarship.amountText}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Deadline</span>
            <span className="font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              {formattedDeadline}
            </span>
          </div>
        </div>

        {/* Tags */}
        {scholarship.tags && scholarship.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {scholarship.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/scholarships/${scholarship._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 transition"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {scholarship.officialUrl && (
          <a
            href={scholarship.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition"
          >
            Portal <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};

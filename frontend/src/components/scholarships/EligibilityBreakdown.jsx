import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EligibilityBreakdown = ({ evaluation }) => {
  if (!evaluation) return null;

  const { status, matchedCriteria, unmatchedCriteria, missingCriteria } = evaluation;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h4 className="font-bold text-slate-900 text-base">Eligibility Rule Analysis</h4>
          <p className="text-xs text-slate-500">Evaluated deterministically by Rule Engine</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            status === 'Eligible'
              ? 'bg-emerald-100 text-emerald-800'
              : status === 'Needs Verification'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {status}
        </span>
      </div>

      {/* Matched Criteria */}
      {matchedCriteria && matchedCriteria.length > 0 && (
        <div className="mb-4">
          <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Matched Criteria ({matchedCriteria.length})
          </h5>
          <ul className="space-y-2">
            {matchedCriteria.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                <span className="font-semibold text-emerald-800 flex-shrink-0">{item.field}:</span>
                <span className="text-slate-600">{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Unmatched Criteria */}
      {unmatchedCriteria && unmatchedCriteria.length > 0 && (
        <div className="mb-4">
          <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            Unmatched Criteria ({unmatchedCriteria.length})
          </h5>
          <ul className="space-y-2">
            {unmatchedCriteria.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-rose-50/60 p-2.5 rounded-lg border border-rose-100">
                <span className="font-semibold text-rose-800 flex-shrink-0">{item.field}:</span>
                <span className="text-slate-600">{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Criteria */}
      {missingCriteria && missingCriteria.length > 0 && (
        <div className="mb-4">
          <h5 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Missing Profile Information ({missingCriteria.length})
          </h5>
          <ul className="space-y-2 mb-3">
            {missingCriteria.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                <span className="font-semibold text-amber-800 flex-shrink-0">{item.field}:</span>
                <span className="text-slate-600">{item.detail}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Update your profile details →
          </Link>
        </div>
      )}
    </div>
  );
};

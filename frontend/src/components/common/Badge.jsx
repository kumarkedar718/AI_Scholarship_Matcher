import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export const EligibilityBadge = ({ status, score }) => {
  if (status === 'Eligible') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        Eligible {score !== undefined && `(${score}%)`}
      </span>
    );
  }

  if (status === 'Needs Verification') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        Needs Verification
      </span>
    );
  }

  if (status === 'Not Eligible') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Not Eligible
      </span>
    );
  }

  return null;
};

export const CategoryTag = ({ category }) => {
  const getStyle = (type) => {
    switch (type) {
      case 'Government':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Private':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Merit-Based':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Need-Based':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-md border ${getStyle(category)}`}>
      {category}
    </span>
  );
};

export const AIMatchBadge = ({ score }) => {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm">
      <Sparkles className="w-3.5 h-3.5" />
      {score}% AI Match Score
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const getStyle = (st) => {
    switch (st) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Applied':
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Planning to Apply':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${getStyle(status)}`}>
      {status}
    </span>
  );
};

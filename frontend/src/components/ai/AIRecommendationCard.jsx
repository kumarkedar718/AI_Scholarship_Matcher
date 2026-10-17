import React from 'react';
import { Link } from 'react-router-dom';
import { AIMatchBadge, EligibilityBadge } from '../common/Badge';
import { Sparkles, Calendar, IndianRupee, ArrowRight, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

export const AIRecommendationCard = ({ recommendation, providerLabel = 'AI Recommendation' }) => {
  const { scholarship, matchPercentage, eligibilityStatus, matchedHighlights, importantConsiderations, recommendationReason } = recommendation;

  const isFallback = providerLabel.includes('Smart Rule');

  return (
    <div className="bg-white rounded-3xl border-2 border-indigo-100 p-6 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
      {/* Provider Label Pill */}
      <div className={`absolute top-0 right-0 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-bl-2xl shadow-xs flex items-center gap-1 ${
        isFallback ? 'bg-amber-600 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
      }`}>
        {isFallback ? <ShieldCheck className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
        {providerLabel}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3 mt-1">
          <AIMatchBadge score={matchPercentage} />
          <EligibilityBadge status={eligibilityStatus} />
        </div>

        <h3 className="font-extrabold text-slate-900 text-lg mb-1 leading-snug group-hover:text-indigo-600 transition">
          <Link to={`/scholarships/${scholarship._id}`}>{scholarship.title}</Link>
        </h3>
        <p className="text-xs text-slate-500 font-bold mb-4">{scholarship.provider}</p>

        {/* AI Rationale / Explanation Box */}
        <div className={`p-4 rounded-2xl border mb-4 ${
          isFallback ? 'bg-amber-50/80 border-amber-100' : 'bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border-indigo-100'
        }`}>
          <div className="flex items-center gap-1.5 text-xs font-extrabold mb-1 text-slate-900">
            {isFallback ? <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
            AI Recommendation Rationale:
          </div>
          <p className="text-xs text-slate-700 leading-relaxed italic">
            "{recommendationReason}"
          </p>
        </div>

        {/* Verified Matched Highlights */}
        {matchedHighlights && matchedHighlights.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
              Verified Matches:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {matchedHighlights.map((m, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {m.field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Important Considerations (Missing criteria warning if any) */}
        {importantConsiderations && importantConsiderations.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block mb-1.5">
              Verification Needed:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {importantConsiderations.map((c, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  {c.field}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Details & Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-2">
        <div className="text-xs">
          <span className="text-slate-400 block font-bold text-[10px] uppercase">Financial Benefit</span>
          <span className="font-black text-slate-900 flex items-center gap-0.5">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
            {scholarship.amountText}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {scholarship.officialUrl && (
            <a
              href={scholarship.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-400 hover:text-slate-700 p-2 transition"
              title="Official Application Portal"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <Link
            to={`/scholarships/${scholarship._id}`}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-2xl transition shadow-md shadow-indigo-600/20"
          >
            View Breakdown
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

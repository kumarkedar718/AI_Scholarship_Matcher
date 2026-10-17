import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { AIRecommendationCard } from '../../components/ai/AIRecommendationCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Sparkles, ShieldCheck, AlertCircle, Info, Award } from 'lucide-react';

export const AIRecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [needsVerificationList, setNeedsVerificationList] = useState([]);
  const [aiStatus, setAiStatus] = useState({ isLiveAI: false, label: 'Smart Rule-Based Recommendation' });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/ai/recommendations');
        if (data.success) {
          setRecommendations(data.data.recommendations || []);
          setNeedsVerificationList(data.data.needsVerificationRecommendations || []);
          setAiStatus(data.data.aiStatus || { isLiveAI: false, label: 'Smart Rule-Based Recommendation' });
          setSummary(data.data.summary);
        }
      } catch (err) {
        console.error('Failed to load AI recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header & Mode Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI Advisory Engine
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Recommended Scholarships For You</h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalized, rule-verified scholarship matches ranked specifically for your academic and financial profile.
          </p>
        </div>

        {/* Honest Provider Status Indicator Badge */}
        <div className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 self-start md:self-auto ${
          aiStatus.isLiveAI
            ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          {aiStatus.isLiveAI ? (
            <Sparkles className="w-4 h-4 text-indigo-600" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          )}
          <div>
            <span className="block font-extrabold">{aiStatus.label} Mode</span>
            <span className="text-[10px] font-normal text-slate-500">
              {aiStatus.isLiveAI ? 'Powered by Google Gemini AI' : 'Using Smart Rule-Based Engine (Offline Ready)'}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="AI Advisory Engine is analyzing eligible scholarships..." />
      ) : recommendations.length === 0 && needsVerificationList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-lg">No Eligible Recommendations Found</h3>
          <p className="text-xs text-slate-500 mt-1">Check your profile parameters or complete missing information.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Primary Recommended List (Eligible Matches) */}
          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Top Eligible Matches ({recommendations.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <AIRecommendationCard
                    key={rec.scholarship._id}
                    recommendation={rec}
                    providerLabel={aiStatus.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Needs Verification Section */}
          {needsVerificationList.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-extrabold">Needs Profile Verification ({needsVerificationList.length})</h2>
              </div>
              <p className="text-xs text-slate-500">
                These scholarships match your profile requirements, but need additional profile fields verified before confirmation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {needsVerificationList.map((rec) => (
                  <AIRecommendationCard
                    key={rec.scholarship._id}
                    recommendation={rec}
                    providerLabel={aiStatus.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

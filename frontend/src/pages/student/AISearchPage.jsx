import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../services/api';
import { AISearchBar } from '../../components/ai/AISearchBar';
import { ScholarshipCard } from '../../components/scholarships/ScholarshipCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Code, Search, AlertCircle, Info, Sparkles } from 'lucide-react';

export const AISearchPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [parsedCriteria, setParsedCriteria] = useState(null);
  const [activeQuery, setActiveQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAISearch = async (queryText) => {
    if (!queryText || queryText.trim() === '') return;
    const cleanQuery = queryText.trim();
    setActiveQuery(cleanQuery);
    setErrorMessage('');

    try {
      setLoading(true);
      let response;
      try {
        response = await API.post('/scholarships/natural-search', { query: cleanQuery });
      } catch (firstErr) {
        // Fallback to /ai/natural-search if /scholarships/natural-search route unavailable
        response = await API.post('/ai/natural-search', { query: cleanQuery });
      }

      const { data } = response;
      if (data.success) {
        const results = data.data.scholarships || data.data.results || [];
        setSearchResults(results);
        setParsedCriteria(data.data.parsedFilters || data.data.parsedCriteria || {});
        if (data.message && data.message.startsWith('Sorry')) {
          setErrorMessage(data.message);
        }
      }
    } catch (err) {
      console.error('AI Natural Search failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to process natural language search';
      setErrorMessage(msg);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.query) {
      handleAISearch(location.state.query);
    }
  }, [location.state]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* AI Prompt Hero */}
      <AISearchBar onSearch={handleAISearch} loading={loading} />

      {/* ERROR / FEEDBACK NOTICE */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-semibold text-amber-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* RESULTS SECTION */}
      {loading ? (
        <LoadingSpinner label="AI is extracting query criteria & evaluating MongoDB database records..." />
      ) : searchResults !== null ? (
        <div className="space-y-6">
          {/* Extracted Structured JSON Criteria Viewer */}
          {parsedCriteria && Object.values(parsedCriteria).some((val) => val !== null && val !== undefined) && (
            <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 border border-slate-800 text-xs shadow-xl space-y-3">
              <div className="flex items-center gap-2 font-black text-emerald-400">
                <Code className="w-4 h-4" />
                Extracted Structured Filters (AI Query Parser):
              </div>
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(parsedCriteria).map(
                  ([key, val]) =>
                    val !== null &&
                    val !== undefined && (
                      <span
                        key={key}
                        className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 font-mono"
                      >
                        <strong className="text-indigo-400">{key}:</strong> {String(val)}
                      </span>
                    )
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Matched Scholarships ({searchResults.length})
            </h3>
            {activeQuery && (
              <span className="text-xs text-slate-500 font-medium">
                Query: "{activeQuery}"
              </span>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-extrabold text-slate-800">
                No Scholarships Found Matching Criteria
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Try describing your search using different terms, e.g., degree (B.Tech, B.Sc), state (Odisha, Bihar), family income, or social category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((item) => (
                <div key={item.scholarship._id} className="space-y-2">
                  <ScholarshipCard
                    scholarship={item.scholarship}
                    evaluation={{
                      status: item.eligibilityStatus,
                      score: item.matchScore
                    }}
                  />
                  {/* Result Transparency: Matched because... */}
                  {item.matchedBecause && (
                    <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 text-xs text-indigo-900 flex items-start gap-2">
                      <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <p className="font-medium leading-relaxed">
                        <strong className="font-extrabold text-indigo-700">Transparency Notice: </strong>
                        {item.matchedBecause}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 text-sm font-medium">
          Describe the scholarship you are looking for in normal human language above to search MongoDB records!
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Sparkles, Search, ArrowRight } from 'lucide-react';

export const AISearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');

  const exampleSuggestions = [
    "Scholarships for B.Tech students in Odisha",
    "Scholarships for female engineering students",
    "Scholarships for students with family income below 5 lakh"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <div className="relative z-10 max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          AI Natural Language Search
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Find Scholarships using Natural Language
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          Describe your academic degree, state of domicile, family income, and category in normal human language. Our AI extracts structured criteria and matches real MongoDB records!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the scholarship you're looking for..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm backdrop-blur-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Searching...</span>
            ) : (
              <>
                <span>Find Scholarships</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Example Suggestions */}
        <div className="pt-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
            Try these example queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {exampleSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 px-3 py-1.5 rounded-xl transition text-left cursor-pointer"
              >
                "{suggestion}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

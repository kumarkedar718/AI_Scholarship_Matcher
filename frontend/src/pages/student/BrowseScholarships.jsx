import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { ScholarshipCard } from '../../components/scholarships/ScholarshipCard';
import { ScholarshipFilter } from '../../components/scholarships/ScholarshipFilter';
import { AISearchBar } from '../../components/ai/AISearchBar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { Award, ArrowUpDown } from 'lucide-react';

export const BrowseScholarships = () => {
  const { isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [evaluationsMap, setEvaluationsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('deadline');
  const [sortOrder] = useState('asc');

  const [filters, setFilters] = useState({
    search: '',
    categoryType: 'All',
    educationLevel: 'All',
    state: 'All',
    category: 'All',
    maxIncome: ''
  });

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryType !== 'All') params.append('categoryType', filters.categoryType);
      if (filters.educationLevel !== 'All') params.append('educationLevel', filters.educationLevel);
      if (filters.state !== 'All') params.append('state', filters.state);
      if (filters.category !== 'All') params.append('category', filters.category);
      if (filters.maxIncome) params.append('maxIncome', filters.maxIncome);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const { data } = await API.get(`/scholarships?${params.toString()}`);
      if (data.success) {
        setScholarships(data.data.scholarships);
      }

      // If logged in student, batch evaluate eligibility
      if (isAuthenticated && isStudent) {
        const evalRes = await API.get('/eligibility/my-matches');
        if (evalRes.data && evalRes.data.success) {
          const map = {};
          const allLists = [
            ...(evalRes.data.data.eligible || []),
            ...(evalRes.data.data.needsVerification || []),
            ...(evalRes.data.data.notEligible || [])
          ];
          allLists.forEach((item) => {
            map[item.scholarship._id] = item.evaluation;
          });
          setEvaluationsMap(map);
        }
      }
    } catch (err) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [filters, sortBy, sortOrder]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      categoryType: 'All',
      educationLevel: 'All',
      state: 'All',
      category: 'All',
      maxIncome: ''
    });
  };

  const handleAISearchTrigger = (queryText) => {
    navigate('/student/ai-search', { state: { query: queryText } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Natural Language AI Search Section */}
      <AISearchBar onSearch={handleAISearchTrigger} loading={false} />

      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" />
            Scholarship Discovery Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse active scholarships using manual filters or natural language search
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer"
          >
            <option value="deadline">Upcoming Deadline</option>
            <option value="amount">Benefit Amount</option>
            <option value="title">Alphabetical Title</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Manual Filter Sidebar */}
        <div className="lg:col-span-1">
          <ScholarshipFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>

        {/* Scholarship Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner label="Evaluating live eligibility rules..." />
          ) : scholarships.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-lg">No Scholarships Match Your Criteria</h3>
              <p className="text-xs text-slate-400 mt-1">Try broadening your search or resetting filters.</p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scholarships.map((s) => (
                <ScholarshipCard
                  key={s._id}
                  scholarship={s}
                  evaluation={evaluationsMap[s._id]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const ScholarshipFilter = ({ filters, onFilterChange, onReset }) => {
  const categories = ['All', 'Merit-Based', 'Need-Based', 'Merit-cum-Means', 'Government', 'Private'];
  const educationLevels = ['All', 'Undergraduate', 'Postgraduate', 'Diploma', 'School'];
  const states = ['All', 'Bihar', 'Uttar Pradesh', 'Delhi', 'Maharashtra', 'Karnataka', 'West Bengal', 'Tamil Nadu', 'Rajasthan', 'Punjab'];
  const socialCategories = ['All', 'General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          Filter Scholarships
        </h4>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keyword Search</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by title, provider..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Category Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Scholarship Type</label>
        <select
          value={filters.categoryType}
          onChange={(e) => onFilterChange('categoryType', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Education Level */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Education Level</label>
        <select
          value={filters.educationLevel}
          onChange={(e) => onFilterChange('educationLevel', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
        >
          {educationLevels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* State Domicile */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">State of Domicile</label>
        <select
          value={filters.state}
          onChange={(e) => onFilterChange('state', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
        >
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Social Category */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Social Category</label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
        >
          {socialCategories.map((sc) => (
            <option key={sc} value={sc}>{sc}</option>
          ))}
        </select>
      </div>

      {/* Income Cap Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Family Annual Income Limit</label>
        <select
          value={filters.maxIncome}
          onChange={(e) => onFilterChange('maxIncome', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
        >
          <option value="">Any Income Limit</option>
          <option value="250000">Up to ₹2.5 Lakhs</option>
          <option value="450000">Up to ₹4.5 Lakhs</option>
          <option value="800000">Up to ₹8.0 Lakhs</option>
        </select>
      </div>
    </div>
  );
};

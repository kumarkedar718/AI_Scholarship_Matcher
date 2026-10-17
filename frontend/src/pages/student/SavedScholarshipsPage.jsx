import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { ScholarshipCard } from '../../components/scholarships/ScholarshipCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Bookmark } from 'lucide-react';

export const SavedScholarshipsPage = () => {
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/applications/saved');
      if (data.success) {
        setSavedList(data.data);
      }
    } catch (err) {
      console.error('Failed to load saved scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
          Bookmarked & Saved Scholarships
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Easily access your saved scholarships to monitor deadlines and prepare documentation
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching saved bookmarks..." />
      ) : savedList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-lg">No Saved Scholarships Yet</h3>
          <p className="text-xs text-slate-500 mt-1">Click the bookmark icon on any scholarship card to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedList
            .filter((item) => Boolean(item && item.scholarship))
            .map((item) => (
              <ScholarshipCard
                key={item.scholarship._id}
                scholarship={item.scholarship}
                initialSaved={true}
                onSaveToggle={fetchSaved}
              />
            ))}
        </div>
      )}
    </div>
  );
};

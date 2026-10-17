import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { Award, Plus, Edit2, Trash2, Power, ExternalLink } from 'lucide-react';

export const ManageScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/scholarships?includeInactive=true&limit=100');
      if (data.success) {
        setScholarships(data.data.scholarships);
      }
    } catch (err) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await API.patch(`/scholarships/${id}/toggle`);
      if (data.success) {
        addToast(data.message, 'success');
        fetchScholarships();
      }
    } catch (err) {
      addToast('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) return;
    try {
      const { data } = await API.delete(`/scholarships/${id}`);
      if (data.success) {
        addToast('Scholarship deleted successfully', 'success');
        fetchScholarships();
      }
    } catch (err) {
      addToast('Failed to delete scholarship', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" />
            Scholarship Management Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, edit, toggle active status, or remove scholarships and eligibility rules
          </p>
        </div>

        <Link
          to="/admin/scholarships/new"
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Scholarship
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching scholarship records..." />
      ) : (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Scholarship Title</th>
                  <th className="py-4 px-6">Provider</th>
                  <th className="py-4 px-6">Benefit Amount</th>
                  <th className="py-4 px-6">Deadline</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {scholarships.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-700/30 transition">
                    <td className="py-4 px-6 font-bold text-white max-w-xs truncate">
                      {s.title}
                    </td>
                    <td className="py-4 px-6 text-slate-300 text-xs font-medium">
                      {s.provider}
                    </td>
                    <td className="py-4 px-6 text-emerald-400 text-xs font-bold">
                      {s.amountText}
                    </td>
                    <td className="py-4 px-6 text-slate-300 text-xs">
                      {new Date(s.deadline).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(s._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${
                          s.isActive
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950/60 text-rose-300 border-rose-800'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {s.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        to={`/admin/scholarships/edit/${s._id}`}
                        className="inline-flex items-center p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs transition"
                        title="Edit Scholarship"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="inline-flex items-center p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs border border-rose-800 transition"
                        title="Delete Scholarship"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

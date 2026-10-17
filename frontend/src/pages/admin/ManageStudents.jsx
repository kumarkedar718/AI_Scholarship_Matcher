import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, Search, CheckCircle, AlertTriangle } from 'lucide-react';

export const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', '50');

      const { data } = await API.get(`/admin/students?${params.toString()}`);
      if (data.success) {
        setStudents(data.data.students);
      }
    } catch (err) {
      console.error('Failed to load students directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Registered Student Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View student profiles, academic courses, CGPA, state of domicile, and category details
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching student records..." />
      ) : students.length === 0 ? (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-12 text-center text-slate-400">
          No students registered matching query.
        </div>
      ) : (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Course & Branch</th>
                  <th className="py-4 px-6">CGPA / Income</th>
                  <th className="py-4 px-6">State / Category</th>
                  <th className="py-4 px-6">Profile Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-700/30 transition">
                    <td className="py-4 px-6 font-bold text-white">
                      {st.name}
                    </td>
                    <td className="py-4 px-6 text-slate-300 text-xs font-medium">
                      {st.email}
                    </td>
                    <td className="py-4 px-6 text-slate-300 text-xs">
                      {st.profile?.course ? `${st.profile.course} (${st.profile.branch || 'N/A'})` : 'Not Specified'}
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <span className="font-bold text-emerald-400 block">
                        CGPA: {st.profile?.cgpaOrPercentage || 0}
                      </span>
                      <span className="text-slate-400">
                        Income: ₹{st.profile?.familyIncomeAnnual ? Number(st.profile.familyIncomeAnnual).toLocaleString('en-IN') : 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      <div>{st.profile?.stateOfDomicile || 'N/A'}</div>
                      <span className="text-purple-300 font-semibold">{st.profile?.category || 'General'}</span>
                    </td>
                    <td className="py-4 px-6">
                      {st.profile?.isProfileComplete ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Incomplete
                        </span>
                      )}
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

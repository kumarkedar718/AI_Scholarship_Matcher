import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Save, ArrowLeft, Award, CheckSquare } from 'lucide-react';

export const ScholarshipEditorPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    description: '',
    summary: '',
    amountText: '',
    amountNumeric: 0,
    categoryType: 'Merit-cum-Means',
    deadline: '',
    officialUrl: '',
    isActive: true,
    isFeatured: false,
    eligibilityCriteria: {
      allowedEducationLevels: [],
      allowedCourses: [],
      minCgpa: 0,
      maxFamilyIncome: '',
      allowedStates: [],
      allowedCategories: [],
      allowedGenders: ['Any'],
      requiresDisability: false,
      requiresSingleGirlChild: false
    },
    requiredDocuments: ['Class 10th & 12th Marksheet', 'Income Certificate', 'Domicile Certificate', 'Bank Passbook']
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchScholarship = async () => {
        try {
          setLoading(true);
          const { data } = await API.get(`/scholarships/${id}`);
          if (data.success) {
            const s = data.data;
            setFormData({
              ...s,
              deadline: s.deadline ? s.deadline.split('T')[0] : '',
              eligibilityCriteria: {
                ...s.eligibilityCriteria,
                maxFamilyIncome: s.eligibilityCriteria?.maxFamilyIncome ?? ''
              }
            });
          }
        } catch (err) {
          addToast('Failed to load scholarship details', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchScholarship();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCriteriaChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      eligibilityCriteria: {
        ...prev.eligibilityCriteria,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleArrayCriteriaToggle = (field, item) => {
    setFormData((prev) => {
      const currentList = prev.eligibilityCriteria[field] || [];
      const updated = currentList.includes(item)
        ? currentList.filter((i) => i !== item)
        : [...currentList, item];
      return {
        ...prev,
        eligibilityCriteria: {
          ...prev.eligibilityCriteria,
          [field]: updated
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.provider || !formData.description || !formData.amountText || !formData.deadline || !formData.officialUrl) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        eligibilityCriteria: {
          ...formData.eligibilityCriteria,
          minCgpa: Number(formData.eligibilityCriteria.minCgpa || 0),
          maxFamilyIncome: formData.eligibilityCriteria.maxFamilyIncome === '' ? null : Number(formData.eligibilityCriteria.maxFamilyIncome)
        }
      };

      if (isEditMode) {
        await API.put(`/scholarships/${id}`, payload);
        addToast('Scholarship updated successfully', 'success');
      } else {
        await API.post('/scholarships', payload);
        addToast('Scholarship created successfully', 'success');
      }
      navigate('/admin/scholarships');
    } catch (err) {
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const educationLevels = ['Undergraduate', 'Postgraduate', 'Diploma', 'PhD', 'School'];
  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];
  const states = ['Bihar', 'Uttar Pradesh', 'Delhi', 'Maharashtra', 'Karnataka', 'West Bengal', 'Tamil Nadu', 'Rajasthan', 'Punjab'];

  if (loading && isEditMode) return <LoadingSpinner label="Loading editor..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/scholarships')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>

        <h1 className="text-xl font-extrabold text-white">
          {isEditMode ? 'Edit Scholarship' : 'Create New Scholarship'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800/80 rounded-3xl border border-slate-700 p-8 shadow-xl space-y-8 text-slate-200">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-700 pb-2">1. Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Scholarship Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Provider / Ministry *</label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount Text (e.g. ₹50,000 / year) *</label>
              <input
                type="text"
                name="amountText"
                value={formData.amountText}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category Type *</label>
              <select
                name="categoryType"
                value={formData.categoryType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500"
              >
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Merit-Based">Merit-Based</option>
                <option value="Need-Based">Need-Based</option>
                <option value="Merit-cum-Means">Merit-cum-Means</option>
                <option value="Special">Special Scheme</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Application Deadline *</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Application URL *</label>
              <input
                type="url"
                name="officialUrl"
                value={formData.officialUrl}
                onChange={handleChange}
                required
                placeholder="https://scholarships.gov.in"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Description *</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Hard Rule Eligibility Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h3 className="font-bold text-white text-base border-b border-slate-700 pb-2">2. Deterministic Rule Engine Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Minimum Required CGPA / Marks</label>
              <input
                type="number"
                step="0.1"
                name="minCgpa"
                value={formData.eligibilityCriteria.minCgpa}
                onChange={handleCriteriaChange}
                placeholder="e.g. 7.5"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Maximum Family Income Cap (INR)</label>
              <input
                type="number"
                name="maxFamilyIncome"
                value={formData.eligibilityCriteria.maxFamilyIncome}
                onChange={handleCriteriaChange}
                placeholder="Leave blank for no upper income limit"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>
          </div>

          {/* Education Level checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Allowed Education Levels (Empty = Any)</label>
            <div className="flex flex-wrap gap-3">
              {educationLevels.map((lvl) => {
                const checked = formData.eligibilityCriteria.allowedEducationLevels?.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleArrayCriteriaToggle('allowedEducationLevels', lvl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      checked ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Domicile State checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Allowed Domicile States (Empty = All India)</label>
            <div className="flex flex-wrap gap-2">
              {states.map((st) => {
                const checked = formData.eligibilityCriteria.allowedStates?.includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleArrayCriteriaToggle('allowedStates', st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      checked ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Category checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Allowed Social Categories (Empty = All)</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const checked = formData.eligibilityCriteria.allowedCategories?.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleArrayCriteriaToggle('allowedCategories', cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      checked ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : isEditMode ? 'Update Scholarship' : 'Publish Scholarship'}
        </button>
      </form>
    </div>
  );
};

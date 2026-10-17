import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  User,
  GraduationCap,
  IndianRupee,
  MapPin,
  CheckCircle2,
  Save,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  FileText,
  Upload,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  FileCheck
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateStudentProfile } = useAuth();
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const [incomeCert, setIncomeCert] = useState({
    uploaded: false,
    originalName: '',
    mimeType: '',
    size: 0,
    uploadedAt: null
  });
  const [certFile, setCertFile] = useState(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [deletingCert, setDeletingCert] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    educationLevel: 'Undergraduate',
    course: '',
    branch: '',
    currentYear: 1,
    currentSemester: 1,
    cgpaOrPercentage: 0,
    familyIncomeAnnual: 0,
    stateOfDomicile: '',
    category: 'General',
    gender: 'Male',
    isDisability: false,
    disabilityPercentage: 0,
    isSingleGirlChild: false
  });

  const fetchIncomeCert = async () => {
    try {
      const { data } = await API.get('/student/income-certificate');
      if (data.success && data.data) {
        setIncomeCert({
          uploaded: data.data.uploaded || false,
          originalName: data.data.parentIncomeCertificate?.originalName || '',
          mimeType: data.data.parentIncomeCertificate?.mimeType || '',
          size: data.data.parentIncomeCertificate?.size || 0,
          uploadedAt: data.data.parentIncomeCertificate?.uploadedAt || null
        });
      }
    } catch (err) {
      console.error('Failed to fetch income certificate info:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/student/profile');
      if (data.success) {
        const p = data.data.profile || {};
        setFormData({
          name: data.data.name || user?.name || '',
          email: data.data.email || user?.email || '',
          phone: p.phone || '',
          educationLevel: p.educationLevel || 'Undergraduate',
          course: p.course || '',
          branch: p.branch || '',
          currentYear: p.currentYear || 1,
          currentSemester: p.currentSemester || 1,
          cgpaOrPercentage: p.cgpaOrPercentage ?? 0,
          familyIncomeAnnual: p.familyIncomeAnnual ?? 0,
          stateOfDomicile: p.stateOfDomicile || '',
          category: p.category || 'General',
          gender: p.gender || 'Male',
          isDisability: p.isDisability || false,
          disabilityPercentage: p.disabilityPercentage || 0,
          isSingleGirlChild: p.isSingleGirlChild || false
        });
        setCompletionPercentage(data.data.completionPercentage || 0);

        if (p.parentIncomeCertificate && p.parentIncomeCertificate.url) {
          setIncomeCert({
            uploaded: true,
            originalName: p.parentIncomeCertificate.originalName || '',
            mimeType: p.parentIncomeCertificate.mimeType || '',
            size: p.parentIncomeCertificate.size || 0,
            uploadedAt: p.parentIncomeCertificate.uploadedAt || null
          });
        }
      }
      await fetchIncomeCert();
    } catch (err) {
      console.error('Failed to load profile:', err);
      addToast('Failed to fetch student profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCertSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('File size exceeds maximum limit of 5 MB.', 'error');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/pjpeg'];
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      addToast('Invalid file format. Only PDF, JPG, JPEG, and PNG are allowed.', 'error');
      e.target.value = '';
      return;
    }

    setCertFile(file);
  };

  const handleCertUpload = async (selectedFile) => {
    const targetFile = selectedFile || certFile;
    if (!targetFile) {
      addToast('Please select a file to upload', 'error');
      return;
    }

    try {
      setUploadingCert(true);
      const formDataUpload = new FormData();
      formDataUpload.append('incomeCertificate', targetFile);

      const { data } = await API.post('/student/income-certificate', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        addToast('Parent/Guardian Income Certificate uploaded successfully!', 'success');
        setCertFile(null);
        await fetchIncomeCert();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload income certificate', 'error');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleCertViewOrDownload = async (isDownload = false) => {
    try {
      const response = await API.get(`/student/income-certificate/file${isDownload ? '?download=true' : ''}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: incomeCert.mimeType || 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      if (isDownload) {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', incomeCert.originalName || 'Income_Certificate');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        window.open(blobUrl, '_blank');
      }
    } catch (err) {
      addToast('Failed to view or download certificate.', 'error');
    }
  };

  const handleCertDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your uploaded income certificate?')) {
      return;
    }

    try {
      setDeletingCert(true);
      const { data } = await API.delete('/student/income-certificate');
      if (data.success) {
        addToast('Income certificate deleted successfully.', 'success');
        setCertFile(null);
        setIncomeCert({
          uploaded: false,
          originalName: '',
          mimeType: '',
          size: 0,
          uploadedAt: null
        });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete income certificate', 'error');
    } finally {
      setDeletingCert(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Full Name is required';
    }
    const cgpa = Number(formData.cgpaOrPercentage);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 100) {
      errors.cgpaOrPercentage = 'CGPA / Marks must be between 0 and 100';
    }
    const income = Number(formData.familyIncomeAnnual);
    if (isNaN(income) || income < 0) {
      errors.familyIncomeAnnual = 'Annual income must be a valid non-negative number';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Please correct validation errors before saving', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await updateStudentProfile(formData);
      addToast('Profile saved successfully! Eligibility scores updated.', 'success');
      fetchProfile();
    } catch (err) {
      addToast(err.message || 'Failed to update student profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const states = ['Bihar', 'Uttar Pradesh', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Kerala', 'Gujarat'];
  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];

  if (loading) return <LoadingSpinner label="Loading student profile details..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner with Profile Completion Progress */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">Verification Profile</span>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
              <User className="w-6 h-6 text-indigo-600" />
              Student Eligibility Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Your profile parameters determine deterministic rule evaluation and AI recommendation scores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Completion Score:</span>
            <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-200">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
              {validationErrors.name && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                  <Lock className="w-3 h-3" /> Read-Only
                </span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full pl-10 pr-4 py-3 text-sm font-medium bg-slate-100/80 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Academic Details & Marks
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Education Level</label>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
              >
                <option value="Undergraduate">Undergraduate (UG)</option>
                <option value="Postgraduate">Postgraduate (PG)</option>
                <option value="Diploma">Diploma</option>
                <option value="PhD">PhD</option>
                <option value="School">School Level</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Degree / Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g. B.Tech"
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Branch / Discipline</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic CGPA / Percentage (0 - 100)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="cgpaOrPercentage"
                value={formData.cgpaOrPercentage}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
              {validationErrors.cgpaOrPercentage && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{validationErrors.cgpaOrPercentage}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Academic Year</label>
              <select
                name="currentYear"
                value={formData.currentYear}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Semester</label>
              <select
                name="currentSemester"
                value={formData.currentSemester}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Financial & Category Criteria Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            Financial & Social Category Criteria
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Annual Family Income (INR)</label>
              <input
                type="number"
                name="familyIncomeAnnual"
                value={formData.familyIncomeAnnual}
                onChange={handleChange}
                placeholder="250000"
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
              {validationErrors.familyIncomeAnnual && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{validationErrors.familyIncomeAnnual}</p>
              )}
              <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
                ₹{Number(formData.familyIncomeAnnual || 0).toLocaleString('en-IN')} per annum
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">State of Domicile</label>
              <select
                name="stateOfDomicile"
                value={formData.stateOfDomicile}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
              >
                <option value="">Select Domicile State</option>
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Social Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-extrabold text-slate-700">
              <input
                type="checkbox"
                name="isDisability"
                checked={formData.isDisability}
                onChange={handleChange}
                className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              Person with Disability (PWD)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-extrabold text-slate-700">
              <input
                type="checkbox"
                name="isSingleGirlChild"
                checked={formData.isSingleGirlChild}
                onChange={handleChange}
                className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              Single Girl Child
            </label>
          </div>
        </div>

        {/* Parent/Guardian Income Certificate Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Parent/Guardian Income Certificate
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-normal">
                Upload your parent/guardian income certificate. This document may be required as proof of family income for scholarship applications.
              </p>
            </div>
            {incomeCert.uploaded ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Uploaded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black text-amber-700 bg-amber-50 rounded-full border border-amber-200 shrink-0">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Not Uploaded
              </span>
            )}
          </div>

          {incomeCert.uploaded ? (
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {incomeCert.originalName}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{(incomeCert.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>
                        Uploaded {incomeCert.uploadedAt ? new Date(incomeCert.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleCertViewOrDownload(false)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCertViewOrDownload(true)}
                    className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    Download
                  </button>

                  <label className="px-3.5 py-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    Replace
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={(e) => {
                        handleCertSelect(e);
                        if (e.target.files[0]) {
                          handleCertUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={deletingCert}
                    onClick={handleCertDelete}
                    className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    {deletingCert ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 transition text-center bg-slate-50/50 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {certFile ? certFile.name : 'Select or drag your Parent/Guardian Income Certificate'}
                </p>
                <p className="text-xs text-slate-400">
                  Supported formats: PDF, JPG, PNG (Max file size: 5 MB)
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <label className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition shadow-xs">
                  Browse File
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={handleCertSelect}
                    className="hidden"
                  />
                </label>

                {certFile && (
                  <button
                    type="button"
                    disabled={uploadingCert}
                    onClick={() => handleCertUpload()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingCert ? 'Uploading...' : 'Upload Certificate'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {submitting ? 'Saving Changes...' : 'Save Profile Parameters'}
        </button>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { ScholarshipCard } from '../../components/scholarships/ScholarshipCard';
import { useAuth } from '../../hooks/useAuth';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Search,
  ShieldCheck,
  ArrowRight,
  Target,
  FileCheck,
  Award,
  User,
  Play,
  Rocket,
  ChevronRight,
  FileText
} from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredScholarships, setFeaturedScholarships] = useState([]);
  const [loadingScholarships, setLoadingScholarships] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setLoadingScholarships(true);
        const { data } = await API.get('/scholarships?limit=4');
        if (data.success) {
          setFeaturedScholarships(data.data.scholarships || []);
        }
      } catch (err) {
        console.error('Failed to load featured scholarships:', err);
      } finally {
        setLoadingScholarships(false);
      }
    };
    loadFeatured();
  }, []);

  const handlePromptSearch = (promptText) => {
    navigate('/student/ai-search', { state: { query: promptText } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handlePromptSearch(searchQuery.trim());
    }
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Feature Card Click Handlers with Authentication Check
  const handleFeatureClick = (featureKey) => {
    switch (featureKey) {
      case 'smart-matching':
        if (isAuthenticated) {
          navigate('/student/recommendations');
        } else {
          navigate('/login', { state: { from: '/student/recommendations' } });
        }
        break;
      case 'check-eligibility':
        navigate('/scholarships');
        break;
      case 'easy-application':
        if (isAuthenticated) {
          navigate('/student/applications');
        } else {
          navigate('/login', { state: { from: '/student/applications' } });
        }
        break;
      case 'natural-search':
        navigate('/student/ai-search');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. FULL-WIDTH FULL-BLEED HERO SECTION */}
      <section className="relative w-full overflow-hidden min-h-[480px] md:min-h-[540px] flex items-center bg-slate-900">
        {/* Full-Bleed Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-right md:bg-center z-0 transition-all duration-700"
          style={{
            backgroundImage: "url('/images/hero-scholarship.png')",
          }}
        ></div>

        {/* Subtle Gradient Overlays for Text Contrast (Lighter on Left, Transparent on Right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent z-10"></div>

        {/* Hero Content Layered Above Background */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full pt-12 pb-24 md:pt-16 md:pb-28">
          <div className="max-w-2xl space-y-6 text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50/90 border border-purple-200 shadow-xs text-xs font-bold text-purple-700 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>✦ AI Powered Scholarship Finder</span>
            </div>

            {/* Main Heading with Gradient Highlight */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Find the Perfect{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
                Scholarship
              </span>{' '}
              for Your Future
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              AI-driven platform that matches your profile with the best scholarships, helps you check eligibility and supports you at every step of your academic journey.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/scholarships"
                className="px-7 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Find Scholarships
              </Link>

              <button
                onClick={scrollToHowItWorks}
                className="px-7 py-3.5 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white border border-slate-200/90 text-slate-800 font-extrabold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                How It Works
              </button>
            </div>

            {/* 3 Trust Badges */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>AI-Powered Matching</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>Personalized Results</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Smart Eligibility Check</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OVERLAPPING KEY FEATURES SECTION */}
      <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Smart Matching */}
          <div
            onClick={() => handleFeatureClick('smart-matching')}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition duration-300 group cursor-pointer relative flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-indigo-600 flex items-center justify-center shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                <Target className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition">
                Smart Matching
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Our AI analyzes your profile and finds scholarships that best match your academic and career goals.
              </p>
            </div>
          </div>

          {/* Card 2: Check Eligibility */}
          <div
            onClick={() => handleFeatureClick('check-eligibility')}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition duration-300 group cursor-pointer relative flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition">
                Check Eligibility
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Quickly understand which scholarships you qualify for with explicit criteria breakdowns.
              </p>
            </div>
          </div>

          {/* Card 3: Easy Application */}
          <div
            onClick={() => handleFeatureClick('easy-application')}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition duration-300 group cursor-pointer relative flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs group-hover:bg-purple-600 group-hover:text-white transition duration-300">
                <FileText className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition">
                Easy Application
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Track scholarship applications, manage deadlines, and stay organized throughout the process.
              </p>
            </div>
          </div>

          {/* Card 4: Natural Language Search */}
          <div
            onClick={() => handleFeatureClick('natural-search')}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition duration-300 group cursor-pointer relative flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs group-hover:bg-amber-600 group-hover:text-white transition duration-300">
                <Search className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition">
                Natural Language Search
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Ask for scholarships in your own words and let AI find relevant opportunities instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-slate-50/70 rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold">
              Simple Steps
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-sm text-slate-600">
              Get matched with the right scholarships in just a few simple steps.
            </p>
          </div>

          {/* 4-Step Horizontal Process with Connecting Arrows */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative items-start">
            {/* Step 01 */}
            <div className="relative space-y-4 text-center md:text-left bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-indigo-700 font-extrabold text-xs">
                  01
                </span>
                <div className="w-10 h-10 rounded-full bg-sky-50 text-indigo-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">Create Your Profile</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tell us about your education, interests and goals.
                </p>
              </div>
              {/* Arrow Indicator for Desktop */}
              <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 z-20">
                <ArrowRight className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            {/* Step 02 */}
            <div className="relative space-y-4 text-center md:text-left bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 font-extrabold text-xs">
                  02
                </span>
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">Get Matched</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our AI finds the best scholarships for you.
                </p>
              </div>
              {/* Arrow Indicator for Desktop */}
              <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 z-20">
                <ArrowRight className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            {/* Step 03 */}
            <div className="relative space-y-4 text-center md:text-left bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold text-xs">
                  03
                </span>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">Check Eligibility</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Confirm your eligibility and view details.
                </p>
              </div>
              {/* Arrow Indicator for Desktop */}
              <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 z-20">
                <ArrowRight className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            {/* Step 04 */}
            <div className="relative space-y-4 text-center md:text-left bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 font-extrabold text-xs">
                  04
                </span>
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Rocket className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">Apply & Grow</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submit your application and take a step closer to your dreams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI SEARCH PROMOTIONAL SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-50/90 via-indigo-50/90 to-purple-50/90 rounded-3xl p-8 sm:p-12 border border-indigo-100 shadow-xs relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Search</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Search{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Scholarships
              </span>{' '}
              Like You Talk
            </h2>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-indigo-500 absolute left-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find scholarships for computer science students with financial need..."
                  className="w-full pl-11 pr-28 py-3.5 text-xs sm:text-sm font-medium bg-white border border-indigo-200 rounded-full shadow-md focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search
                </button>
              </div>
            </form>

            {/* Suggestion Chips */}
            <div className="pt-1">
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handlePromptSearch('Scholarships for engineering students')}
                  className="px-3.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Search className="w-3 h-3 text-indigo-500" />
                  Scholarships for engineering students
                </button>
                <button
                  onClick={() => handlePromptSearch('Scholarships without income restriction')}
                  className="px-3.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Search className="w-3 h-3 text-indigo-500" />
                  Scholarships without income restriction
                </button>
                <button
                  onClick={() => handlePromptSearch('Scholarships for first-year students')}
                  className="px-3.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Search className="w-3 h-3 text-indigo-500" />
                  Scholarships for first-year students
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SCHOLARSHIP DISCOVERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold mb-1">
              Featured Directory
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Scholarship Opportunities</h2>
          </div>
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 transition"
          >
            View All Directory <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingScholarships ? (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold">
            Loading active scholarship opportunities...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredScholarships.map((s) => (
              <ScholarshipCard key={s._id} scholarship={s} />
            ))}
          </div>
        )}
      </section>

      {/* 6. CTA BANNER / ABOUT SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to Find Scholarships You Qualify For?
            </h2>
            <p className="text-sm text-indigo-100 max-w-xl">
              Create your student profile in under 2 minutes. Get instant rule verification, AI match reasons, and status tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="px-7 py-3 bg-white hover:bg-slate-100 text-indigo-700 font-extrabold text-xs rounded-full shadow-md transition transform hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-indigo-800/60 hover:bg-indigo-800 text-white font-extrabold text-xs rounded-full border border-indigo-400/40 transition"
            >
              Student Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

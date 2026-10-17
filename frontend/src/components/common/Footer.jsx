import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, Sparkles, ShieldCheck, Award, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Scholar<span className="text-indigo-400">Match</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              An intelligent, rule-verified and AI-powered scholarship discovery platform helping students match opportunities, verify eligibility parameters, and track applications effortlessly.
            </p>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI-Powered
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Rule-Verified
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/scholarships" className="hover:text-white transition">Scholarships Directory</Link></li>
              <li><Link to="/student/ai-search" className="hover:text-white transition">AI Natural Search</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Create Student Profile</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link to="/scholarships?categoryType=Government" className="hover:text-white transition">Government Schemes</Link></li>
              <li><Link to="/scholarships?categoryType=Private" className="hover:text-white transition">Private Foundations</Link></li>
              <li><Link to="/scholarships?categoryType=Merit-Based" className="hover:text-white transition">Merit-Based Grants</Link></li>
              <li><Link to="/scholarships?categoryType=Need-Based" className="hover:text-white transition">Need-Based Financial Support</Link></li>
            </ul>
          </div>

          {/* Academic Info */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider mb-4">Project Information</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              <strong className="text-slate-200 block mb-1 font-bold">Academic Project</strong>
              Engineered for transparent scholarship matching, deterministic rule evaluation, and AI match rationale generation.
            </p>
            <a
              href="https://scholarships.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
            >
              National Scholarship Portal <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 AI Scholarship Matcher. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Higher Education
          </p>
        </div>
      </div>
    </footer>
  );
};

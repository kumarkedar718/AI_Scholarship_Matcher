import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { GraduationCap, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { forgotPassword } = useAuth();
  const { addToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address', 'error');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
      addToast('Password reset link sent to your email!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-10 text-center">
        <div className="flex justify-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>
        </div>

        <h2 className="text-2xl font-black text-slate-900">Forgot Password?</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
          Enter your registered email address and we'll send you instructions to reset your password.
        </p>

        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Check Your Inbox</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 text-xs font-bold text-indigo-600 hover:underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending Link...
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link to="/login" className="text-xs font-bold text-indigo-600 hover:underline">
                Remember your password? Log In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

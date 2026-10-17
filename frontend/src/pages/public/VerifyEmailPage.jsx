import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
  GraduationCap,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'already_verified'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { verifyEmail, resendVerification } = useAuth();
  const { addToast } = useNotification();
  const verificationAttempted = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (verificationAttempted.current) {
        return;
      }
      verificationAttempted.current = true;

      if (!token) {
        if (isMounted) {
          setStatus('error');
          setMessage('Verification link is invalid or expired.');
        }
        return;
      }

      try {
        const res = await verifyEmail(token);
        if (isMounted) {
          if (res.alreadyVerified || res.data?.alreadyVerified) {
            setStatus('already_verified');
            setMessage('Your email address has already been verified.');
          } else {
            setStatus('success');
            setMessage('Your email address has been verified. You can now log in.');
            addToast('Email Verified Successfully!', 'success');
          }
        }
      } catch (err) {
        if (isMounted) {
          const errMsg = err.message || '';
          if (errMsg.toLowerCase().includes('already been verified')) {
            setStatus('already_verified');
            setMessage('Your email address has already been verified.');
          } else {
            setStatus('error');
            setMessage('Verification link is invalid or expired.');
          }
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResendSubmit = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      addToast('Please enter your registered email address', 'error');
      return;
    }

    try {
      setResending(true);
      const res = await resendVerification(resendEmail.trim().toLowerCase());
      if (res.emailSent !== false) {
        setResendSuccess(true);
        addToast('Verification email sent successfully. Please check your inbox and Spam folder.', 'success');
      } else {
        addToast('Unable to send verification email. Please try again later.', 'error');
      }
    } catch (err) {
      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('already been verified')) {
        setStatus('already_verified');
        setMessage('Your email address has already been verified.');
        addToast('Your email address has already been verified.', 'info');
      } else {
        addToast('Unable to send verification email. Please try again later.', 'error');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-10 text-center">
        {/* Brand Header */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>
        </div>

        {/* LOADING STATE */}
        {status === 'loading' && (
          <div className="space-y-4 py-6">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Verifying your email...</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Please wait while we validate your token with our servers.
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Email Verified Successfully!</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {message || 'Your email address has been verified. You can now log in.'}
              </p>
            </div>
            <Link
              to="/login"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
            >
              Proceed to Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ALREADY VERIFIED STATE */}
        {status === 'already_verified' && (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Email Already Verified</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Your email address has already been verified.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
            >
              Proceed to Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <XCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Email Verification Failed</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {message || 'Verification link is invalid or expired.'}
              </p>
            </div>

            {/* Resend Verification Form */}
            {!resendSuccess ? (
              <form onSubmit={handleResendSubmit} className="space-y-3 pt-2 text-left">
                <p className="text-xs font-bold text-slate-700">
                  Didn't receive a valid verification link?
                </p>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Resend Verification Email
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium">
                ✅ Verification email sent successfully. Please check your inbox and Spam folder.
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/login"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Return to Login Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

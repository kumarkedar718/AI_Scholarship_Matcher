import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import heroImg from '../../assets/hero.png';

export const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Unverified email handling & polling state
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [verificationSessionId, setVerificationSessionId] = useState('');
  const [isAutoVerified, setIsAutoVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { login, resendVerification, checkVerificationStatus } = useAuth();
  const { addToast } = useNotification();

  // Cooldown timer effect for Resend button
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // Handle location state passed during auto-navigation from RegisterPage
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.verified) {
      setIsAutoVerified(true);
      setUnverifiedEmail(location.state.email || '');
    }
  }, [location.state]);

  // Automatic Polling to detect Email Verification from Phone/Email Link
  useEffect(() => {
    let intervalId;
    if (unverifiedEmail && verificationSessionId && !isAutoVerified) {
      intervalId = setInterval(async () => {
        try {
          const res = await checkVerificationStatus(verificationSessionId);
          if (res && res.isEmailVerified) {
            setIsAutoVerified(true);
            clearInterval(intervalId);
            addToast('✓ Email verified successfully!', 'success');
          }
        } catch (err) {
          // Silent polling check
        }
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [unverifiedEmail, verificationSessionId, isAutoVerified, checkVerificationStatus, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResendSuccess(false);

    if (!email || !password) {
      addToast('Please fill in both email and password', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim().toLowerCase(), password);
      addToast(`Welcome back, ${res.name}!`, 'success');
      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      if (err.isEmailVerified === false) {
        setUnverifiedEmail(err.email || email.trim().toLowerCase());
        setVerificationSessionId(err.verificationSessionId || '');
        setIsAutoVerified(false);
        addToast('Please verify your email address before logging in.', 'error');
      } else {
        addToast(err.message || 'Invalid credentials', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;

    const targetEmail = unverifiedEmail || email.trim().toLowerCase();
    if (!targetEmail) {
      addToast('Please enter your email address', 'error');
      return;
    }

    try {
      setResending(true);
      const res = await resendVerification(targetEmail);
      setResendSuccess(true);
      const sessionToken = res.data?.verificationSessionId || res.verificationSessionId || '';
      if (sessionToken) {
        setVerificationSessionId(sessionToken);
      }
      addToast(res.message || 'Verification email sent successfully. Please check your inbox.', 'success');
      setResendCooldown(60); // 60-second cooldown
    } catch (err) {
      addToast(err.message || 'Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN: Visual Graphic Banner */}
        <div className="lg:col-span-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-8 sm:p-12 text-white relative flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10"></div>
          <img
            src={heroImg}
            alt="University Campus Students"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />

          <div className="relative z-20 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Scholar<span className="text-indigo-400">Match</span>
              </span>
            </Link>

            <div className="pt-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> AI Advisory Engine
              </span>
              <h3 className="text-3xl font-black leading-tight text-white">
                Empowering Students with Financial Aid
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Deterministic rule evaluation ensures zero false matches. Log in to monitor your applications and AI match scores.
              </p>
            </div>
          </div>

          <div className="relative z-20 pt-8 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Rule-Based Match Percentage</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Personalized Gemini AI Recommendation Reasons</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Login Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Welcome Back</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Continue your journey toward the right scholarship.
              </p>
            </div>

            {/* UNVERIFIED / VERIFIED EMAIL ALERT BANNER */}
            {unverifiedEmail && (
              isAutoVerified ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Email Verified Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Your email address (<strong>{unverifiedEmail}</strong>) has been verified. Enter your password to log in below.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Email Verification Required</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Please verify your email address (<strong>{unverifiedEmail}</strong>) before logging in.
                  </p>
                  <div className="inline-flex items-center gap-2 py-1 px-2.5 bg-amber-100/80 rounded-lg text-amber-800 text-[11px] font-bold">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                    <span>Waiting for email verification...</span>
                  </div>
                  {!resendSuccess ? (
                    <div>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending || resendCooldown > 0}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer disabled:opacity-50 pt-1"
                      >
                        {resending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending link...
                          </>
                        ) : resendCooldown > 0 ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" /> Resend Verification Email ({resendCooldown}s)
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" /> Resend Verification Email
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-emerald-700">
                      ✅ New verification link sent! Please check your inbox.
                    </p>
                  )}
                </div>
              )
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-extrabold text-indigo-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Signing in...' : 'Log In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-extrabold text-indigo-600 hover:text-indigo-700">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

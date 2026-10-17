import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import heroImg from '../../assets/hero.png';

// Frontend email format check matching backend rules
const isValidEmailFormat = (email) => {
  if (!email) return false;
  const trimmed = email.trim();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || local.length === 0) return false;
  if (!domain || domain.length === 0) return false;

  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;

  const mainDomain = domainParts[0];
  const tld = domainParts[domainParts.length - 1];

  if (!mainDomain || mainDomain.length === 0) return false;
  if (!tld || tld.length < 2) return false;

  return true;
};

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Post-registration verification state
  const [isRegistered, setIsRegistered] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSessionId, setVerificationSessionId] = useState('');
  const [isAutoVerified, setIsAutoVerified] = useState(false);

  const { register, resendVerification, checkVerificationStatus } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

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

  // Automatic Polling: Detects Email Verification on Phone and IMMEDIATELY opens Login page
  useEffect(() => {
    let intervalId;
    const activeSessionId = verificationSessionId || sessionStorage.getItem('pending_verification_session_id');
    const activeEmail = email || sessionStorage.getItem('pending_verification_email') || '';
    const activeRole = role || sessionStorage.getItem('pending_verification_role') || 'student';

    if ((isRegistered || activeSessionId) && activeSessionId && !isAutoVerified) {
      intervalId = setInterval(async () => {
        try {
          const res = await checkVerificationStatus(activeSessionId);
          if (res && res.isEmailVerified) {
            setIsAutoVerified(true);
            if (intervalId) clearInterval(intervalId);
            sessionStorage.removeItem('pending_verification_session_id');
            sessionStorage.removeItem('pending_verification_email');
            sessionStorage.removeItem('pending_verification_role');
            addToast('✓ Email verified successfully!', 'success');
            // Automatically open the Login page with email pre-filled
            navigate('/login', { state: { email: activeEmail, verified: true, role: activeRole } });
          }
        } catch (err) {
          // Silent polling check
        }
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRegistered, verificationSessionId, isAutoVerified, email, role, navigate, checkVerificationStatus, addToast]);

  const handleEmailChange = (val) => {
    setEmail(val);
    if (val && !isValidEmailFormat(val)) {
      setEmailError('Please enter a valid email address with a domain (e.g., user@example.com)');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) {
      addToast('Full name is required', 'error');
      return;
    }
    if (!cleanEmail || !isValidEmailFormat(cleanEmail)) {
      setEmailError('Please enter a valid email address');
      addToast('Invalid email address format', 'error');
      return;
    }
    if (!password || password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await register(name.trim(), cleanEmail, password, role);
      setIsRegistered(true);
      const wasEmailSent = res.emailSent !== false && res.data?.emailSent !== false;
      setEmailSentStatus(wasEmailSent);

      const sessionToken = res.data?.verificationSessionId || res.verificationSessionId || '';
      if (sessionToken) {
        setVerificationSessionId(sessionToken);
        sessionStorage.setItem('pending_verification_session_id', sessionToken);
        sessionStorage.setItem('pending_verification_email', cleanEmail);
        sessionStorage.setItem('pending_verification_role', role);
      }

      if (wasEmailSent) {
        addToast('Registration successful! Please check your email to verify your account.', 'success');
      } else {
        addToast('Account created, but verification email could not be sent. Please use Resend Verification Email.', 'warning');
      }
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;

    try {
      setResending(true);
      const targetEmail = email.trim().toLowerCase() || sessionStorage.getItem('pending_verification_email') || '';
      const res = await resendVerification(targetEmail);
      setEmailSentStatus(true);
      const sessionToken = res.data?.verificationSessionId || res.verificationSessionId || '';
      if (sessionToken) {
        setVerificationSessionId(sessionToken);
        sessionStorage.setItem('pending_verification_session_id', sessionToken);
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
                <Sparkles className="w-3.5 h-3.5" /> Start Free Today
              </span>
              <h3 className="text-3xl font-black leading-tight text-white">
                Start Your Scholarship Journey
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Join thousands of students matching with verified national, state, and private scholarships using our intelligent rule engine.
              </p>
            </div>
          </div>

          <div className="relative z-20 pt-8 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant Verification of CGPA & Income Caps</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Free Application Tracking & Document Checklist</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Registration Form OR Verification Waiting Screen */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full space-y-6">
            {isRegistered || sessionStorage.getItem('pending_verification_session_id') ? (
              /* POST-REGISTRATION VERIFICATION WAITING NOTICE */
              <div className="text-center space-y-6 py-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                  emailSentStatus ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <Mail className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Registration Successful!</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    We've sent a verification link to your email:
                    <br />
                    <span className="font-bold text-indigo-600">
                      {email || sessionStorage.getItem('pending_verification_email')}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Please open Gmail on your phone or browser and tap <strong>Verify Email</strong>.
                  </p>
                </div>

                {/* Polling status badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Waiting for email verification...</span>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs text-amber-800 space-y-1.5">
                  <p className="font-extrabold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Didn't receive the email?
                  </p>
                  <p>Check your spam folder, or click below to resend the verification link.</p>
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Resending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RefreshCw className="w-4 h-4" /> Resend Verification Email ({resendCooldown}s)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" /> Resend Verification Email
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-slate-100 text-xs">
                  Already verified?{' '}
                  <Link to="/login" className="font-extrabold text-indigo-600 hover:underline">
                    Proceed to Login
                  </Link>
                </div>
              </div>
            ) : (
              /* REGISTRATION FORM */
              <>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Start Your Journey</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Create your account to match with verified scholarships.
                  </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl text-xs font-semibold text-indigo-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Student Account Registration</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="w-full pl-10 pr-4 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className={`w-full pl-10 pr-4 py-3 text-sm font-medium border ${
                          emailError ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
                        } rounded-2xl outline-none transition`}
                      />
                    </div>
                    {emailError && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {emailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        minLength={6}
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
                    disabled={loading || !!emailError}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Creating Account...' : 'Create Student Account'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                  Already registered?{' '}
                  <Link to="/login" className="font-extrabold text-indigo-600 hover:text-indigo-700">
                    Log In here
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

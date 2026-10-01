import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';
import { User as UserType } from '../../types';

interface AuthPageProps {
  onLoginSuccess: (user: UserType) => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password' | 'verify_email';

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Password reset state
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'submit'>('request');

  // Email verification state
  const [pendingUser, setPendingUser] = useState<UserType | null>(null);
  const [verificationCode, setVerificationCode] = useState('4281');

  // 1. Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = storageService.login(email.trim(), password);
      showToast(`Welcome back, ${user.name}! Accessing ${user.role.toUpperCase()} portal...`, 'success');
      onLoginSuccess(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Customer Registration (Self-Registration strictly for customers only)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setLoading(true);
    try {
      const newUser = storageService.registerCustomer(name, email, phone, password);
      setPendingUser(newUser);
      setMode('verify_email');
      showToast('Verification code dispatched to your email!', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Email Verification
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    if (verificationCode.trim() !== '4281' && verificationCode.trim().length < 4) {
      showToast('Please enter the 4-digit code sent to your email.', 'error');
      return;
    }

    setLoading(true);
    try {
      storageService.verifyEmail(pendingUser.id);
      showToast('🎉 Email verified! Your student/customer account is active.', 'success');
      const updatedUser = storageService.getUsers().find((u) => u.id === pendingUser.id) || pendingUser;
      onLoginSuccess(updatedUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Forgot Password
  const handleRequestPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your account email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = storageService.requestPasswordReset(email.trim());
      setResetToken(token);
      setResetStep('submit');
      showToast('Password reset token generated! Please enter your new password.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to request reset';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    setLoading(true);
    try {
      storageService.resetPasswordWithToken(resetToken, newPassword);
      showToast('Password updated! You can now log in with your new password.', 'success');
      setPassword(newPassword);
      setMode('login');
      setResetStep('request');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper quick fill for demo evaluation
  const handleFillDemoCreds = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('canteen123');
  };

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF7A00] to-[#FFB36B] text-white shadow-xl shadow-orange-500/25">
          <UtensilsCrossed className="w-8 h-8" />
        </div>

        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#25282D] tracking-tight">
            Smart<span className="text-[#FF7A00]">Canteen</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pre-Order & Digital Queue Management Platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80">
          {/* LOGIN VIEW */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2 className="font-heading font-bold text-lg text-slate-900">Sign in to your account</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your credentials to access your dedicated role portal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@canteen.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setResetStep('request');
                    }}
                    className="text-xs text-[#FF7A00] hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs sm:text-sm transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  New student or campus employee?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="font-bold text-[#FF7A00] hover:underline ml-1 cursor-pointer"
                  >
                    Create Customer Account
                  </button>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  (Staff, Manager & Admin accounts are provisioned by management)
                </p>
              </div>

              {/* Demo Evaluation Quick Credentials Hint */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" /> Demo Evaluation Accounts
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">pw: canteen123</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleFillDemoCreds('student@canteen.edu')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-left hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                  >
                    <span className="font-bold text-slate-800 block">Customer</span>
                    <span className="text-[10px] text-slate-500 truncate block">student@canteen.edu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemoCreds('kitchen@canteen.edu')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-left hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                  >
                    <span className="font-bold text-slate-800 block">Kitchen Staff</span>
                    <span className="text-[10px] text-slate-500 truncate block">kitchen@canteen.edu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemoCreds('manager@canteen.edu')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-left hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                  >
                    <span className="font-bold text-slate-800 block">Manager</span>
                    <span className="text-[10px] text-slate-500 truncate block">manager@canteen.edu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemoCreds('admin@canteen.edu')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-left hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                  >
                    <span className="font-bold text-slate-800 block">Admin</span>
                    <span className="text-[10px] text-slate-500 truncate block">admin@canteen.edu</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* CUSTOMER REGISTRATION VIEW */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h2 className="font-heading font-bold text-lg text-slate-900">Create Customer Account</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign up to pre-order food, skip long lines, and collect meals with digital tokens.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ali Khan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus / Corporate Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ali.khan@campus.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (for SMS Token Alert)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs sm:text-sm transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Registering...' : 'Create Account & Verify Email'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Already have an account? <span className="text-[#FF7A00] font-bold">Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* EMAIL VERIFICATION VIEW */}
          {mode === 'verify_email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF7A00] flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>

              <div>
                <h2 className="font-heading font-bold text-lg text-slate-900">Verify Your Email</h2>
                <p className="text-xs text-slate-500 mt-1">
                  We've sent a 4-digit verification code to{' '}
                  <strong className="text-slate-800">{pendingUser?.email || email}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Enter 4-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-40 mx-auto text-center font-mono font-bold text-2xl tracking-widest py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF7A00]"
                />
                <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Demo code <strong>4281</strong> ready to verify
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs sm:text-sm transition-all shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Activating...' : 'Verify & Enter Canteen'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-500 hover:text-slate-700 block mx-auto"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {mode === 'forgot_password' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading font-bold text-lg text-slate-900">Reset Your Password</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive a signed one-time reset link or token to restore access.
                </p>
              </div>

              {resetStep === 'request' ? (
                <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@canteen.edu"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? 'Generating...' : 'Send Reset Link / Token'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmitNewPassword} className="space-y-4">
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-[11px] text-orange-800 flex items-start gap-2">
                    <KeyRound className="w-4 h-4 shrink-0 text-[#FF7A00] mt-0.5" />
                    <span>Reset token verified for {email}. Please enter your new password.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

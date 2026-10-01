import React, { useState } from 'react';
import { UtensilsCrossed, Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { User as UserType } from '../../types';
import { useToast } from '../common/Toast';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup fields (Customer only)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Password reset fields
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    try {
      const user = storageService.login(email, password);
      showToast(`Welcome back, ${user.name}! Redirecting to ${user.role} portal...`, 'success');
      onLoginSuccess(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      showToast(msg, 'error');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !signupPassword) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (signupPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      const user = storageService.registerCustomer(name, email, phone, signupPassword);
      showToast(`Account registered! Verification link sent to ${user.email}.`, 'success');
      onLoginSuccess(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      showToast(msg, 'error');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your registered email address.', 'error');
      return;
    }
    try {
      const token = storageService.requestPasswordReset(email);
      setResetToken(token);
      setGeneratedLink(`https://smartcanteen.campus/reset?token=${token}`);
      setMode('reset');
      showToast('Single-use password reset link dispatched.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed.';
      showToast(msg, 'error');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    try {
      storageService.resetPasswordWithToken(resetToken, newPassword);
      showToast('Password reset successfully! Please login with your new password.', 'success');
      setPassword(newPassword);
      setMode('login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed.';
      showToast(msg, 'error');
    }
  };

  const fillQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('canteen123');
  };

  const strength = getPasswordStrength(signupPassword);

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#FF7A00] to-[#FFB36B] items-center justify-center text-white shadow-xl shadow-orange-500/20 mb-2">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#25282D] tracking-tight">
          Smart<span className="text-[#FF7A00]">Canteen</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
          Pre-Order & Digital Queue Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-slate-200/80 space-y-6">
          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-slate-900">Sign In to Your Account</h2>
                <p className="text-xs text-slate-500">Access your role-specific canteen portal</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@canteen.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-semibold text-[#FF7A00] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00] focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#FF7A00] focus:ring-[#FF7A00]"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] active:scale-98 text-white font-heading font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
                New student or employee?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-[#FF7A00] hover:underline"
                >
                  Create Customer Account
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP FORM (Customer Only) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-slate-900">Create Customer Account</h2>
                <p className="text-xs text-slate-500">Student & employee registration with email verification</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ali Khan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@canteen.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (PKR)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]"
                    required
                  />
                </div>

                {/* Password strength meter */}
                {signupPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1.5">
                      <div className={`flex-1 rounded-full ${strength >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${strength >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${strength >= 3 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${strength >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Strength: {strength <= 1 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-sm shadow-lg shadow-orange-500/25 transition-all"
              >
                Create Account
              </button>

              <div className="text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#FF7A00] hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-slate-900">Forgot Password</h2>
                <p className="text-xs text-slate-500">
                  Enter your email address and we'll generate a secure single-use reset link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@canteen.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-sm transition-all shadow-md shadow-orange-500/20"
              >
                Send Password Reset Link
              </button>

              <div className="text-center text-xs">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-slate-600 hover:text-slate-900 font-semibold"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-slate-900">Set New Password</h2>
                <p className="text-xs text-slate-500">Reset token verified for {email}</p>
              </div>

              {generatedLink && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-[11px] text-slate-700 space-y-1">
                  <span className="font-bold text-[#FF7A00]">Simulated Email Reset Link:</span>
                  <p className="font-mono text-[10px] break-all text-slate-500">{generatedLink}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7A00]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-sm transition-all shadow-md"
              >
                Save New Password & Login
              </button>
            </form>
          )}

          {/* Test credentials helper card for testers */}
          <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
              <span>Demo Testing Credentials (password: canteen123)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => fillQuickDemo('student@canteen.edu')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-orange-50 hover:border-orange-300 border border-slate-200/80 text-left transition-colors"
              >
                <span className="font-bold text-slate-800 block">Customer</span>
                <span className="text-[10px] text-slate-400">student@canteen.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('kitchen@canteen.edu')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-orange-50 hover:border-orange-300 border border-slate-200/80 text-left transition-colors"
              >
                <span className="font-bold text-slate-800 block">Kitchen Staff</span>
                <span className="text-[10px] text-slate-400">kitchen@canteen.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('manager@canteen.edu')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-orange-50 hover:border-orange-300 border border-slate-200/80 text-left transition-colors"
              >
                <span className="font-bold text-slate-800 block">Manager</span>
                <span className="text-[10px] text-slate-400">manager@canteen.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('admin@canteen.edu')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-orange-50 hover:border-orange-300 border border-slate-200/80 text-left transition-colors"
              >
                <span className="font-bold text-slate-800 block">Administrator</span>
                <span className="text-[10px] text-slate-400">admin@canteen.edu</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

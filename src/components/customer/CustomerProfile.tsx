import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, KeyRound, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface CustomerProfileProps {
  currentUser: UserType;
  onUpdateUser: (updated: Partial<UserType>) => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  currentUser,
  onUpdateUser,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Verification cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    const updated = {
      id: currentUser.id,
      name,
      phone,
      avatar: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    };
    storageService.updateUserProfile(updated);
    onUpdateUser(updated);
    showToast('Profile updated successfully!', 'success');
  };

  const handleResendVerification = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate sending email
    showToast(`Verification link sent to ${currentUser.email}. Click "Simulate Verify" to activate.`, 'info');
  };

  const handleSimulateEmailClick = () => {
    storageService.verifyEmail(currentUser.id);
    onUpdateUser({ emailVerified: true, accountStatus: 'active' });
    showToast('🎉 Email successfully verified! Account is now Active.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    showToast('Password changed successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setShowPasswordSection(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#FFB36B] text-white flex items-center justify-center font-heading font-extrabold text-2xl shadow-md shadow-orange-500/20">
          {currentUser.avatar || currentUser.name.slice(0, 2)}
        </div>
        <div>
          <h2 className="font-heading font-extrabold text-xl text-slate-900">{currentUser.name}</h2>
          <p className="text-xs text-slate-500">{currentUser.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                currentUser.accountStatus === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              ● {currentUser.accountStatus}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
              Role: {currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Email Verification Box */}
      {!currentUser.emailVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-amber-900">
                Action Required: Verify Your Campus Email
              </h4>
              <p className="text-xs text-amber-700 mt-1">
                Your account is currently in <strong>pending</strong> status. Verify your email to ensure receipts, token ready alerts, and notifications reach your inbox.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleResendVerification}
              disabled={resendCooldown > 0}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
            </button>

            <button
              onClick={handleSimulateEmailClick}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Simulate Click Link (Activate Now)
            </button>
          </div>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Personal Information
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Contact canteen admin to modify registered email.</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Phone (PKR)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
        >
          Save Profile Changes
        </button>
      </form>

      {/* Security & Password */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900">Security & Credentials</h3>
            <p className="text-xs text-slate-500">Update your account login password</p>
          </div>
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="text-xs font-bold text-[#FF7A00] hover:underline"
          >
            {showPasswordSection ? 'Hide' : 'Change Password'}
          </button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handleChangePassword} className="space-y-3 pt-3 border-t border-slate-100 text-xs animate-fade-in">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password (min 6 chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

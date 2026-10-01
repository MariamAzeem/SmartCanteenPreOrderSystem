import React, { useState } from 'react';
import { Users, Plus, ChefHat, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface ManagerStaffManagementProps {
  currentUser: User;
  users: User[];
}

export const ManagerStaffManagement: React.FC<ManagerStaffManagementProps> = ({ currentUser, users }) => {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('canteen123');

  const staffUsers = users.filter((u) => u.role === 'staff');

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Please enter staff name and email', 'error');
      return;
    }

    try {
      storageService.createStaffOrManagerAccount(currentUser, {
        name,
        email,
        phone,
        role: 'staff',
        password,
      });
      showToast(`Kitchen staff account created for ${name}!`, 'success');
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPhone('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cannot create staff account';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-lg text-slate-900">
              Kitchen Staff Account Management
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#FF7A00]">
              {staffUsers.length} STAFF MEMBERS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create and supervise chef and kitchen counter personnel logins.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs shadow-md shadow-orange-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Kitchen Staff
        </button>
      </div>

      {/* Staff members list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffUsers.map((staff) => (
          <div
            key={staff.id}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#25282D] text-white flex items-center justify-center font-bold text-sm">
                <ChefHat className="w-6 h-6 text-[#FF7A00]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900">{staff.name}</h3>
                <p className="text-xs text-slate-400">{staff.email}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{staff.phone || 'No phone'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                {staff.accountStatus.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateStaff}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-scale-in"
          >
            <h3 className="font-heading font-bold text-base text-slate-900">
              Create New Kitchen Staff Account
            </h3>
            <p className="text-xs text-slate-500">
              Staff will log in via the main login page and access the Kitchen Display System (KDS).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Member Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Mehmood"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Canteen Email</label>
                <input
                  type="email"
                  placeholder="tariq.kitchen@canteen.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+92 321 0000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] text-white text-xs font-bold shadow-md shadow-orange-500/20"
              >
                Create Staff Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

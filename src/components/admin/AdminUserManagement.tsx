import React, { useState } from 'react';
import { Users, Shield, UserCheck, UserX, Search, Mail, Phone, Calendar } from 'lucide-react';
import { User, Role, AccountStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminUserManagementProps {
  users: User[];
  currentUserId: string;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users, currentUserId }) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleStatus = (targetUser: User) => {
    if (targetUser.id === currentUserId) {
      showToast('You cannot suspend your own administrative account.', 'error');
      return;
    }
    const newStatus: AccountStatus = targetUser.accountStatus === 'suspended' ? 'active' : 'suspended';
    storageService.updateUserProfile({ id: targetUser.id, accountStatus: newStatus });
    storageService.addLog(
      'USER_STATUS_CHANGE',
      'Administrator',
      'admin',
      `Changed user ${targetUser.name} status to ${newStatus}`
    );
    showToast(`Account status updated to ${newStatus.toUpperCase()}`, 'info');
  };

  const handleChangeRole = (targetUser: User, newRole: Role) => {
    if (targetUser.id === currentUserId && newRole !== 'admin') {
      showToast('You cannot revoke your own admin permissions.', 'error');
      return;
    }
    storageService.updateUserProfile({ id: targetUser.id, role: newRole });
    storageService.addLog(
      'USER_ROLE_CHANGE',
      'Administrator',
      'admin',
      `Changed role for ${targetUser.name} to ${newRole}`
    );
    showToast(`Role updated to ${newRole.toUpperCase()}`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-xl text-slate-900">
              User Access Control & Security Permissions
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
              RBAC ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervise accounts, configure kitchen staff permissions, and manage suspension flags.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-[#FF7A00]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Filter Role:</span>
          {['all', 'customer', 'staff', 'manager', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-all ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Email Status</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {user.avatar || user.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-400">{user.email}</p>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user, e.target.value as Role)}
                      className="p-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
                    >
                      <option value="customer">Customer</option>
                      <option value="staff">Staff (Kitchen)</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{user.phone}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.emailVerified
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {user.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.accountStatus === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : user.accountStatus === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {user.accountStatus.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        user.accountStatus === 'suspended'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {user.accountStatus === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

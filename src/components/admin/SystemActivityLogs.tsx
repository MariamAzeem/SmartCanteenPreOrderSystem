import React, { useState } from 'react';
import { Shield, Clock, Search, Filter, Layers, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { ActivityLog } from '../../types';

interface SystemActivityLogsProps {
  logs: ActivityLog[];
}

export const SystemActivityLogs: React.FC<SystemActivityLogsProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = logs.filter((l) => {
    if (roleFilter !== 'all' && l.actorRole !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.action.toLowerCase().includes(q) ||
        l.actorName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        (l.tokenNumber && l.tokenNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-xl text-slate-900">
              System Audit Trail & Staff Activity Logs
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
              IMMUTABLE AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track token lifecycle transitions, chef acceptances, cancellations, and duplicate prevention alerts.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by Token (e.g. C-021), action, or actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-[#FF7A00]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Actor Role:</span>
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

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const dateStr = new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                const isWarning = log.action.includes('DELAY') || log.action.includes('DUPLICATE') || log.action.includes('CANCEL');
                const isReady = log.action.includes('READY') || log.action.includes('COLLECT');

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {dateStr}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          isWarning
                            ? 'bg-rose-100 text-rose-800'
                            : isReady
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-heading font-bold text-xs text-[#FF7A00]">
                      {log.tokenNumber || '—'}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{log.actorName}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {log.actorRole}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

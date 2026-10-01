import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  UserCheck,
  Server,
  Download,
} from 'lucide-react';
import { useToast } from '../common/Toast';

const REPORT_TABS = [
  { id: '1', name: '1. User Growth' },
  { id: '2', name: '2. Users by Role/Status' },
  { id: '3', name: '3. Email Verification' },
  { id: '4', name: '4. Security & Logins' },
  { id: '5', name: '5. Order Volume' },
  { id: '6', name: '6. Cancellations & Rejections' },
  { id: '7', name: '7. Staff Activity Log' },
  { id: '8', name: '8. System & Error Logs' },
  { id: '9', name: '9. Notification Delivery' },
  { id: '10', name: '10. Categories Status' },
  { id: '11', name: '11. Peak System Load' },
  { id: '12', name: '12. Token & Collection Integrity' },
];

export const AdminReportsView: React.FC = () => {
  const { showToast } = useToast();
  const [activeReport, setActiveReport] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  // Report 1: User Growth
  const report1Chart = [
    { period: 'Mon', signups: 12 },
    { period: 'Tue', signups: 18 },
    { period: 'Wed', signups: 25 },
    { period: 'Thu', signups: 32 },
    { period: 'Fri', signups: 45 },
    { period: 'Sat', signups: 38 },
    { period: 'Sun', signups: 54 },
  ];
  const report1Table = [
    { date: '2026-09-25', newUsers: 12, students: 10, staff: 2 },
    { date: '2026-09-26', newUsers: 18, students: 16, staff: 2 },
    { date: '2026-09-27', newUsers: 25, students: 22, staff: 3 },
    { date: '2026-09-28', newUsers: 32, students: 29, staff: 3 },
    { date: '2026-09-29', newUsers: 45, students: 41, staff: 4 },
    { date: '2026-09-30', newUsers: 38, students: 35, staff: 3 },
    { date: '2026-10-01', newUsers: 54, students: 50, staff: 4 },
  ];

  // Report 2: Users by Role and Status
  const report2Chart = [
    { role: 'Customer', count: 185 },
    { role: 'Staff', count: 8 },
    { role: 'Manager', count: 4 },
    { role: 'Admin', count: 2 },
  ];
  const report2Table = [
    { role: 'Customer', active: 185, pending: 22, suspended: 3, total: 210 },
    { role: 'Kitchen Staff', active: 8, pending: 1, suspended: 0, total: 9 },
    { role: 'Manager', active: 4, pending: 0, suspended: 0, total: 4 },
    { role: 'Admin', active: 2, pending: 0, suspended: 0, total: 2 },
  ];

  // Report 3: Email Verification
  const report3Chart = [
    { name: 'Verified', value: 199, fill: '#10B981' },
    { name: 'Pending', value: 23, fill: '#F59E0B' },
    { name: 'Expired', value: 3, fill: '#EF4444' },
  ];
  const report3Table = [
    { domain: '@student.university.edu', verified: 182, pending: 19, status: 'Healthy' },
    { domain: '@faculty.university.edu', verified: 17, pending: 4, status: 'Healthy' },
    { domain: '@admin.university.edu', verified: 6, pending: 0, status: '100% Verified' },
  ];

  // Report 4: Security Events and Logins
  const report4Chart = [
    { hour: '08:00', successful: 42, failed: 1 },
    { hour: '10:00', successful: 68, failed: 3 },
    { hour: '12:00', successful: 145, failed: 4 },
    { hour: '14:00', successful: 88, failed: 2 },
    { hour: '16:00', successful: 32, failed: 0 },
  ];
  const report4Table = [
    { event: 'User Login Success', count: 375, securityStatus: 'Normal' },
    { event: 'Password Failure (Invalid hash)', count: 10, securityStatus: 'Monitored' },
    { event: 'Rate Limiter Triggered (IP throttle)', count: 2, securityStatus: 'Blocked (15m)' },
    { event: 'Expired Session Re-Authentication', count: 48, securityStatus: 'Normal' },
  ];

  // Report 5: Order Volume Summary (Counts only, NO revenue)
  const report5Chart = [
    { status: 'Completed', count: 153, fill: '#10B981' },
    { status: 'Active Queue', count: 18, fill: '#FF7A00' },
    { status: 'Cancelled', count: 12, fill: '#EF4444' },
    { status: 'Rejected', count: 3, fill: '#F59E0B' },
    { status: 'Not Collected', count: 0, fill: '#64748B' },
  ];
  const report5Table = [
    { metric: 'Total Orders Processed', count: 186, notes: 'Today count across canteen' },
    { metric: 'Successfully Completed & Handed Over', count: 153, notes: '82.3% throughput' },
    { metric: 'Active In-Progress Tickets', count: 18, notes: 'Live on kitchen stations' },
    { metric: 'Customer Cancelled (Pre-prep)', count: 12, notes: 'Before cooking started' },
    { metric: 'Kitchen Rejected (Out of stock)', count: 3, notes: 'Refused by chef' },
    { metric: 'Not Collected / Abandoned', count: 0, notes: '100% collection compliance' },
  ];

  // Report 6: Cancellations and Rejections by Reason & Role (Counts only)
  const report6Chart = [
    { reason: 'Class reschedule', count: 6 },
    { reason: 'Changed mind', count: 4 },
    { reason: 'Wait time', count: 2 },
    { reason: 'Kitchen depleted', count: 3 },
  ];
  const report6Table = [
    { role: 'Customer', reason: 'Class or lecture reschedule', count: 6, resolution: 'Immediate refund' },
    { role: 'Customer', reason: 'Changed mind on menu choice', count: 4, resolution: 'Immediate refund' },
    { role: 'Customer', reason: 'Estimated wait time too long', count: 2, resolution: 'Immediate refund' },
    { role: 'Kitchen Staff', reason: 'Fresh ingredients depleted', count: 3, resolution: 'Immediate refund' },
  ];

  // Report 7: Staff Activity Log
  const report7Chart = [
    { staff: 'Chef Bilal', actions: 84 },
    { staff: 'Counter #1', actions: 92 },
    { staff: 'Tariq (Prep)', actions: 45 },
  ];
  const report7Table = [
    { staff: 'Chef Bilal', role: 'Head Chef', action: 'Moved Token C-021 to Preparing', time: '12:45 PM' },
    { staff: 'Counter #1', role: 'Cashier', action: 'Verified QR Token C-019 & Released Food', time: '12:42 PM' },
    { staff: 'Chef Bilal', role: 'Head Chef', action: 'Marked Token C-020 Ready', time: '12:40 PM' },
    { staff: 'Counter #1', role: 'Cashier', action: 'Blocked duplicate collection C-018', time: '12:31 PM' },
    { staff: 'Tariq (Prep)', role: 'Kitchen Assistant', action: 'Assembled 30 burger boxes', time: '12:20 PM' },
  ];

  // Report 8: System Logs and Error Log
  const report8Chart = [
    { type: 'Failed Orders', count: 0 },
    { type: 'Payment Retries', count: 3 },
    { type: 'Failed Notifications', count: 1 },
    { type: 'DB Locks', count: 0 },
  ];
  const report8Table = [
    { severity: 'INFO', subsystem: 'Token Engine', message: 'Monotonic sequence counter active at C-026', timestamp: '12:50 PM' },
    { severity: 'WARN', subsystem: 'Payment Module', message: 'Luhn validation failed on invalid test card', timestamp: '12:35 PM' },
    { severity: 'WARN', subsystem: 'SMTP Gateway', message: 'Connection timeout on secondary mail node', timestamp: '12:12 PM' },
    { severity: 'INFO', subsystem: 'Queue Engine', message: 'Background queue delay evaluation passed', timestamp: '12:00 PM' },
  ];

  // Report 9: Notification Delivery
  const report9Chart = [
    { channel: 'In-App Toast', count: 186 },
    { channel: 'Audio Chime', count: 174 },
    { channel: 'Email Alerts', count: 153 },
  ];
  const report9Table = [
    { type: 'Order Placed Confirmation', sent: 186, deliveryRate: '100%' },
    { type: 'Kitchen Cooking Progression', sent: 165, deliveryRate: '99.4%' },
    { type: 'Counter Ready Pick-up Chime', sent: 153, deliveryRate: '100%' },
    { type: 'Auto-Delay Escalation Notice', sent: 8, deliveryRate: '100%' },
  ];

  // Report 10: Category Report
  const report10Chart = [
    { category: 'Burgers', count: 5 },
    { category: 'Rice & Desi', count: 4 },
    { category: 'Fries & Sides', count: 4 },
    { category: 'Drinks', count: 4 },
    { category: 'Desserts', count: 4 },
  ];
  const report10Table = [
    { category: 'Burgers', itemsCount: 5, enabled: 'Yes (5)', disabled: '0', status: 'Active' },
    { category: 'Rice & Desi', itemsCount: 4, enabled: 'Yes (4)', disabled: '0', status: 'Active' },
    { category: 'Fries & Sides', itemsCount: 4, enabled: 'Yes (4)', disabled: '0', status: 'Active' },
    { category: 'Drinks', itemsCount: 4, enabled: 'Yes (4)', disabled: '0', status: 'Active' },
    { category: 'Desserts', itemsCount: 4, enabled: 'Yes (3)', disabled: '1', status: 'Active (1 paused)' },
  ];

  // Report 11: Peak System Usage Hours (Requests/Active users, NOT sales)
  const report11Chart = [
    { hour: '09 AM', rpm: 45, users: 24 },
    { hour: '11 AM', rpm: 98, users: 56 },
    { hour: '12 PM', rpm: 240, users: 142 },
    { hour: '01 PM', rpm: 380, users: 210 },
    { hour: '02 PM', rpm: 190, users: 115 },
    { hour: '03 PM', rpm: 65, users: 38 },
  ];
  const report11Table = [
    { window: '12:45 PM - 01:15 PM', avgRpm: 380, peakUsers: 210, serverLatency: '42ms' },
    { window: '01:15 PM - 01:45 PM', avgRpm: 295, peakUsers: 165, serverLatency: '38ms' },
    { window: '11:45 AM - 12:15 PM', avgRpm: 180, peakUsers: 95, serverLatency: '31ms' },
    { window: '02:00 PM - 02:30 PM', avgRpm: 120, peakUsers: 62, serverLatency: '29ms' },
  ];

  // Report 12: Token & Collection Integrity Report
  const report12Chart = [
    { name: 'Legitimate Handover', value: 153, fill: '#10B981' },
    { name: 'Duplicate Blocked', value: 4, fill: '#EF4444' },
    { name: 'Void Tokens Blocked', value: 2, fill: '#F59E0B' },
  ];
  const report12Table = [
    { check: 'Duplicate Collection Attempts Blocked', count: 4, auditResult: 'Passed (Double release prevented)' },
    { check: 'Void/Cancelled Tokens Rejected', count: 2, auditResult: 'Passed (Immediate staff alert raised)' },
    { check: 'Authentic First-time Collections', count: 153, auditResult: 'Passed (Timestamps & actor recorded)' },
    { check: 'Unclaimed Orders at Close', count: 0, auditResult: 'Zero unclaimed trays' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Banner (Strictly View-Only) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-xl text-slate-900">
              System Administration Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
              <Eye className="w-3 h-3" /> VIEW-ONLY AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            General operational telemetry, user security logs, and token integrity. Sales & revenue restricted to Manager role.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            {['today', '7d', '30d'].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  dateRange === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 12 Report Tab Buttons */}
      <div className="bg-white p-2 rounded-3xl border border-slate-200/90 shadow-sm overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeReport === tab.id
                ? 'bg-[#25282D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* REPORT CONTENT VIEW: TABLE + ACCOMPANYING CHART */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        {/* REPORT 1: USER GROWTH */}
        {activeReport === '1' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                1. User Growth Over Time
              </h2>
              <p className="text-xs text-slate-500">Student and staff registrations over the selected timeframe.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report1Chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="period" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="signups" name="New Sign-Ups" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Total New Users</th>
                      <th className="py-2.5 px-3">Students</th>
                      <th className="py-2.5 px-3">Staff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report1Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono">{row.date}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.newUsers}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.students}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.staff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 2: USERS BY ROLE & STATUS */}
        {activeReport === '2' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                2. Users by Role & Account Status
              </h2>
              <p className="text-xs text-slate-500">Distribution of active, pending, and suspended user accounts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report2Chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="role" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="count" name="Active Accounts" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Active</th>
                      <th className="py-2.5 px-3">Pending</th>
                      <th className="py-2.5 px-3">Suspended</th>
                      <th className="py-2.5 px-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report2Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.role}</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-semibold">{row.active}</td>
                        <td className="py-2.5 px-3 text-amber-600">{row.pending}</td>
                        <td className="py-2.5 px-3 text-rose-600">{row.suspended}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 3: EMAIL VERIFICATION */}
        {activeReport === '3' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                3. Email Verification Report
              </h2>
              <p className="text-xs text-slate-500">Audit of verified vs pending university email addresses.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={report3Chart} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {report3Chart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Domain</th>
                      <th className="py-2.5 px-3">Verified</th>
                      <th className="py-2.5 px-3">Pending</th>
                      <th className="py-2.5 px-3">Domain Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report3Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono">{row.domain}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600">{row.verified}</td>
                        <td className="py-2.5 px-3 text-amber-600">{row.pending}</td>
                        <td className="py-2.5 px-3 text-slate-700">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 4: SECURITY & LOGINS */}
        {activeReport === '4' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                4. Login Activity & Security Events
              </h2>
              <p className="text-xs text-slate-500">Authentication success vs failed security events.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report4Chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="successful" stroke="#10B981" strokeWidth={2} name="Successful" />
                    <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} name="Failed" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Event Type</th>
                      <th className="py-2.5 px-3">Count</th>
                      <th className="py-2.5 px-3">Security Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report4Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{row.event}</td>
                        <td className="py-2.5 px-3 font-bold">{row.count}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {row.securityStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 5: ORDER VOLUME SUMMARY (COUNTS ONLY, NO REVENUE) */}
        {activeReport === '5' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                5. Order Volume Summary (Counts Only)
              </h2>
              <p className="text-xs text-slate-500">Order ticket quantities without monetary revenue figures.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report5Chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="status" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="count" name="Tickets" fill="#FF7A00" radius={[6, 6, 0, 0]}>
                      {report5Chart.map((entry, index) => (
                        <Cell key={`vol-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Metric Category</th>
                      <th className="py-2.5 px-3">Order Count</th>
                      <th className="py-2.5 px-3">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report5Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{row.metric}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.count}</td>
                        <td className="py-2.5 px-3 text-slate-500">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 6: CANCELLATION & REJECTION COUNT BY ROLE/REASON */}
        {activeReport === '6' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                6. Cancellation & Rejection Counts by Role/Reason
              </h2>
              <p className="text-xs text-slate-500">Quantities terminated by customers or rejected by kitchen staff.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report6Chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="reason" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="count" name="Cancelled Orders" fill="#EF4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Count</th>
                      <th className="py-2.5 px-3">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report6Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{row.role}</td>
                        <td className="py-2.5 px-3 text-slate-700">{row.reason}</td>
                        <td className="py-2.5 px-3 font-bold text-rose-600">{row.count}</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-semibold">{row.resolution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 7: STAFF ACTIVITY LOG */}
        {activeReport === '7' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                7. Staff Operational Activity Log
              </h2>
              <p className="text-xs text-slate-500">Record of chef transitions, counter handovers, and actions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report7Chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="staff" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="actions" name="Logged Actions" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Staff</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report7Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.staff}</td>
                        <td className="py-2.5 px-3 text-slate-700">{row.action}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 8: SYSTEM LOGS & ERROR LOG */}
        {activeReport === '8' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                8. System Logs & Error Log
              </h2>
              <p className="text-xs text-slate-500">Failed orders, payment retries, and subsystem status.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report8Chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="type" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="count" name="Errors/Warnings" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Level</th>
                      <th className="py-2.5 px-3">Subsystem</th>
                      <th className="py-2.5 px-3">Message</th>
                      <th className="py-2.5 px-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report8Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${row.severity === 'WARN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                            {row.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{row.subsystem}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.message}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{row.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 9: NOTIFICATION & EMAIL DELIVERY */}
        {activeReport === '9' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                9. Notification & Email Delivery Report
              </h2>
              <p className="text-xs text-slate-500">Audit of student push alerts, audio chimes, and receipt emails.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report9Chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="channel" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="count" name="Alerts Dispatched" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Alert Trigger</th>
                      <th className="py-2.5 px-3">Dispatched</th>
                      <th className="py-2.5 px-3">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report9Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{row.type}</td>
                        <td className="py-2.5 px-3 font-bold">{row.sent}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600">{row.deliveryRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 10: CATEGORY REPORT */}
        {activeReport === '10' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                10. Category Report (Item Counts & Active Status)
              </h2>
              <p className="text-xs text-slate-500">Distribution of items per culinary category and availability.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report10Chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="category" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="count" name="Items Count" fill="#FF7A00" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Total Items</th>
                      <th className="py-2.5 px-3">Enabled</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report10Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.category}</td>
                        <td className="py-2.5 px-3 font-bold">{row.itemsCount}</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-semibold">{row.enabled}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 11: PEAK SYSTEM USAGE HOURS (NOT SALES) */}
        {activeReport === '11' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                11. Peak System Usage Hours (Requests & Active Sessions)
              </h2>
              <p className="text-xs text-slate-500">Server capacity telemetry and concurrent web requests.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report11Chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="rpm" name="Requests/Min" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Time Window</th>
                      <th className="py-2.5 px-3">Avg RPM</th>
                      <th className="py-2.5 px-3">Concurrent Users</th>
                      <th className="py-2.5 px-3">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report11Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{row.window}</td>
                        <td className="py-2.5 px-3 font-bold text-blue-600">{row.avgRpm}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{row.peakUsers}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-600 font-semibold">{row.serverLatency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 12: TOKEN & COLLECTION INTEGRITY */}
        {activeReport === '12' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                12. Token & Collection Integrity Report
              </h2>
              <p className="text-xs text-slate-500">Security audit of duplicate collection prevention and void token rejections.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={report12Chart} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {report12Chart.map((entry, index) => (
                        <Cell key={`integrity-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Integrity Check Event</th>
                      <th className="py-2.5 px-3">Incidents</th>
                      <th className="py-2.5 px-3">Audit Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report12Table.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{row.check}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{row.count}</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">{row.auditResult}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

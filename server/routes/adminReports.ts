import { Router, Request, Response } from 'express';

const router = Router();

// Middleware: Strictly reject any write attempts on Admin Reports
router.use((req: Request, res: Response, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.status(403).json({
      error: '403 Forbidden: Admin Reports are strictly VIEW-ONLY. Write and mutate operations are rejected.',
    });
    return;
  }
  next();
});

/**
 * 12 General View-Only Admin Reports Data Provider
 */
router.get('/', (req: Request, res: Response) => {
  const { dateRange, reportId } = req.query;

  const reportsData = {
    // 1. User growth over time (new sign-ups per day/week)
    userGrowth: {
      title: 'User Growth Over Time',
      description: 'Account sign-ups registered across student and staff cohorts.',
      chartType: 'area',
      data: [
        { period: 'Day 1', signups: 12, cumulative: 12 },
        { period: 'Day 2', signups: 18, cumulative: 30 },
        { period: 'Day 3', signups: 25, cumulative: 55 },
        { period: 'Day 4', signups: 32, cumulative: 87 },
        { period: 'Day 5', signups: 45, cumulative: 132 },
        { period: 'Day 6', signups: 38, cumulative: 170 },
        { period: 'Day 7', signups: 54, cumulative: 224 },
      ],
      table: [
        { date: '2026-09-25', newUsers: 12, studentSignups: 10, staffSignups: 2 },
        { date: '2026-09-26', newUsers: 18, studentSignups: 16, staffSignups: 2 },
        { date: '2026-09-27', newUsers: 25, studentSignups: 22, staffSignups: 3 },
        { date: '2026-09-28', newUsers: 32, studentSignups: 29, staffSignups: 3 },
        { date: '2026-09-29', newUsers: 45, studentSignups: 41, staffSignups: 4 },
        { date: '2026-09-30', newUsers: 38, studentSignups: 35, staffSignups: 3 },
        { date: '2026-10-01', newUsers: 54, studentSignups: 50, staffSignups: 4 },
      ],
    },

    // 2. Users by role and by account status (active, pending, suspended)
    usersByRoleAndStatus: {
      title: 'Users by Role & Account Status',
      description: 'Breakdown of active, pending verification, and suspended accounts.',
      chartType: 'bar',
      data: [
        { role: 'Customer', active: 185, pending: 22, suspended: 3 },
        { role: 'Kitchen Staff', active: 8, pending: 1, suspended: 0 },
        { role: 'Manager', active: 4, pending: 0, suspended: 0 },
        { role: 'Admin', active: 2, pending: 0, suspended: 0 },
      ],
      table: [
        { role: 'Customer', activeCount: 185, pendingCount: 22, suspendedCount: 3, total: 210 },
        { role: 'Kitchen Staff', activeCount: 8, pendingCount: 1, suspendedCount: 0, total: 9 },
        { role: 'Manager', activeCount: 4, pendingCount: 0, suspendedCount: 0, total: 4 },
        { role: 'Admin', activeCount: 2, pendingCount: 0, suspendedCount: 0, total: 2 },
      ],
    },

    // 3. Email verification report (verified vs pending)
    emailVerification: {
      title: 'Email Verification Status',
      description: 'Audit of verified student university domains vs pending confirmations.',
      chartType: 'pie',
      data: [
        { status: 'Verified', count: 199, fill: '#10B981' },
        { status: 'Pending Verification', count: 23, fill: '#F59E0B' },
        { status: 'Expired Token', count: 3, fill: '#EF4444' },
      ],
      table: [
        { category: 'Instant Verification (<5m)', count: 165, percentage: '73.3%' },
        { category: 'Delayed Verification (>1h)', count: 34, percentage: '15.1%' },
        { category: 'Pending Action in Inbox', count: 23, percentage: '10.2%' },
        { category: 'Expired Verification Link', count: 3, percentage: '1.4%' },
      ],
    },

    // 4. Login activity and failed login attempts / security events
    securityAndLogins: {
      title: 'Login Activity & Security Events',
      description: 'Authentication success rates and rate-limited invalid attempts.',
      chartType: 'line',
      data: [
        { hour: '08:00', successfulLogins: 42, failedAttempts: 1 },
        { hour: '10:00', successfulLogins: 68, failedAttempts: 3 },
        { hour: '12:00', successfulLogins: 145, failedAttempts: 4 },
        { hour: '14:00', successfulLogins: 88, failedAttempts: 2 },
        { hour: '16:00', successfulLogins: 32, failedAttempts: 0 },
      ],
      table: [
        { eventType: 'Password Sign-In Success', count: 340, securityStatus: 'Normal' },
        { eventType: 'Failed Password (Wrong credential)', count: 10, securityStatus: 'Monitored' },
        { eventType: 'Rate-Limit Throttled IP', count: 2, securityStatus: 'Blocked (15m)' },
        { eventType: 'Session Expired Re-auth', count: 45, securityStatus: 'Normal' },
      ],
    },

    // 5. Order volume summary (counts only: total, completed, cancelled, rejected, not collected; NO revenue)
    orderVolumeSummary: {
      title: 'Order Volume Summary (Counts Only)',
      description: 'Strictly order unit lifecycle metrics without monetary sales figures.',
      chartType: 'bar',
      data: [
        { status: 'Completed', count: 153 },
        { status: 'Active (Prep/Ready)', count: 18 },
        { status: 'Cancelled', count: 12 },
        { status: 'Rejected', count: 3 },
        { status: 'Not Collected', count: 0 },
      ],
      table: [
        { metric: 'Total Orders Registered', count: 186, notes: 'Today campus volume' },
        { metric: 'Successfully Handed Over & Completed', count: 153, notes: '82.3% throughput' },
        { metric: 'In Progress (Placed/Preparing/Ready)', count: 18, notes: 'Live active queue' },
        { metric: 'Customer Cancelled (Pre-prep)', count: 12, notes: 'Cancelled within rules' },
        { metric: 'Kitchen Rejected (Out of stock)', count: 3, notes: 'Chef Bilal rejected' },
        { metric: 'Abandoned / Not Collected', count: 0, notes: 'Zero food left uncollected' },
      ],
    },

    // 6. Cancellation and rejection count by role/reason (counts only)
    cancellationsAndRejections: {
      title: 'Cancellations & Rejections by Reason & Role',
      description: 'Categorized reasons for order termination across customer and kitchen staff.',
      chartType: 'pie',
      data: [
        { reason: 'Class/Meeting schedule change', count: 6, fill: '#FF7A00' },
        { reason: 'Changed mind on meal choice', count: 4, fill: '#3B82F6' },
        { reason: 'Estimated wait time too long', count: 2, fill: '#F59E0B' },
        { reason: 'Kitchen: Out of fresh ingredients', count: 3, fill: '#EF4444' },
      ],
      table: [
        { role: 'Customer', reason: 'Class/Meeting schedule change', count: 6, actionTaken: 'Refund initiated' },
        { role: 'Customer', reason: 'Changed mind on meal choice', count: 4, actionTaken: 'Refund initiated' },
        { role: 'Customer', reason: 'Estimated wait time too long', count: 2, actionTaken: 'Refund initiated' },
        { role: 'Staff (Kitchen)', reason: 'Fresh ingredients depleted', count: 3, actionTaken: 'Restocked/Refunded' },
      ],
    },

    // 7. Staff activity log (who did what, when)
    staffActivityLog: {
      title: 'Staff Operational Activity Log',
      description: 'Chef station actions, status transitions, and pickup verification events.',
      chartType: 'bar',
      data: [
        { staff: 'Chef Bilal', ticketsHandled: 84 },
        { staff: 'Counter Staff #1', handoversVerified: 92 },
        { staff: 'Kitchen Assistant Tariq', prepActions: 45 },
      ],
      table: [
        { staffMember: 'Chef Bilal', role: 'Head Chef', action: 'Advanced Token C-021 to Preparing', timestamp: '12:45 PM' },
        { staffMember: 'Counter Staff #1', role: 'Counter Cashier', action: 'Verified QR Token C-019 & Handed Over', timestamp: '12:42 PM' },
        { staffMember: 'Chef Bilal', role: 'Head Chef', action: 'Marked Token C-020 Ready', timestamp: '12:40 PM' },
        { staffMember: 'Chef Bilal', role: 'Head Chef', action: 'Toggled Fries to Limited Stock', timestamp: '12:35 PM' },
        { staffMember: 'Counter Staff #1', role: 'Counter Cashier', action: 'Blocked duplicate collection C-018', timestamp: '12:31 PM' },
      ],
    },

    // 8. System logs and error log (failed orders, failed payments count, failed emails)
    systemErrorsAndLogs: {
      title: 'System Health & Error Log',
      description: 'System error telemetry including transient network exceptions and payment errors.',
      chartType: 'bar',
      data: [
        { category: 'Order Errors', count: 0 },
        { category: 'Payment Retries', count: 3 },
        { category: 'Failed SMS/Email', count: 1 },
        { category: 'Database Timeouts', count: 0 },
      ],
      table: [
        { severity: 'INFO', subsystem: 'Order Engine', message: 'Atomic sequence initialized at C-026', occurrences: 1 },
        { severity: 'WARN', subsystem: 'Payment Gateway', message: 'Luhn validation failed on test card', occurrences: 3 },
        { severity: 'WARN', subsystem: 'Email SMTP', message: 'Student mailbox quota full on domain', occurrences: 1 },
        { severity: 'INFO', subsystem: 'Queue Engine', message: 'Delay scan auto-evaluated 18 active tickets', occurrences: 142 },
      ],
    },

    // 9. Notification and email delivery report
    notificationDelivery: {
      title: 'Notification & Email Delivery Report',
      description: 'Real-time websocket dispatch and in-app alert receipt metrics.',
      chartType: 'pie',
      data: [
        { channel: 'In-App Live Toast', delivered: 186, fill: '#FF7A00' },
        { channel: 'Web Audio Chime', delivered: 174, fill: '#10B981' },
        { channel: 'Email Notification', delivered: 153, fill: '#3B82F6' },
      ],
      table: [
        { notificationType: 'Order Placed & Token Assigned', delivered: 186, deliveryRate: '100%' },
        { notificationType: 'Order Preparing on Cook Line', delivered: 165, deliveryRate: '99.4%' },
        { notificationType: 'Order Ready for Pickup Chime', delivered: 153, deliveryRate: '100%' },
        { notificationType: 'Order Delay Auto-Alert', delivered: 8, deliveryRate: '100%' },
      ],
    },

    // 10. Category report (number of items per category, enabled/disabled)
    categoryReport: {
      title: 'Food Category Status & Item Distribution',
      description: 'Inventory distribution of active and paused canteen culinary categories.',
      chartType: 'bar',
      data: [
        { category: 'Burgers', activeItems: 5, pausedItems: 0 },
        { category: 'Rice & Desi', activeItems: 4, pausedItems: 0 },
        { category: 'Fries & Sides', activeItems: 4, pausedItems: 0 },
        { category: 'Drinks', activeItems: 4, pausedItems: 0 },
        { category: 'Desserts', activeItems: 3, pausedItems: 1 },
      ],
      table: [
        { categoryName: 'Burgers', totalItems: 5, enabledStatus: 'Active', popularLeader: 'Zinger Crunch Burger' },
        { categoryName: 'Rice & Desi', totalItems: 4, enabledStatus: 'Active', popularLeader: 'Special Chicken Biryani' },
        { categoryName: 'Fries & Sides', totalItems: 4, enabledStatus: 'Active', popularLeader: 'Masala Crispy Fries' },
        { categoryName: 'Drinks', totalItems: 4, enabledStatus: 'Active', popularLeader: 'Karak Doodh Patti Chai' },
        { categoryName: 'Desserts', totalItems: 4, enabledStatus: 'Active (1 Paused)', popularLeader: 'Warm Chocolate Brownie' },
      ],
    },

    // 11. Peak system usage hours (requests/active users, not sales)
    systemUsageHours: {
      title: 'Peak System Load & API Usage Hours',
      description: 'Server requests per minute and active user connections (non-financial).',
      chartType: 'line',
      data: [
        { hour: '09:00', requestsPerMin: 45, activeSessions: 24 },
        { hour: '11:00', requestsPerMin: 98, activeSessions: 56 },
        { hour: '12:00', requestsPerMin: 240, activeSessions: 142 },
        { hour: '13:00', requestsPerMin: 380, activeSessions: 210 },
        { hour: '14:00', requestsPerMin: 190, activeSessions: 115 },
        { hour: '15:00', requestsPerMin: 65, activeSessions: 38 },
      ],
      table: [
        { timeSlot: '12:45 PM - 01:15 PM', avgRpm: 380, peakConcurrentUsers: 210, serverLatency: '42ms' },
        { timeSlot: '01:15 PM - 01:45 PM', avgRpm: 295, peakConcurrentUsers: 165, serverLatency: '38ms' },
        { timeSlot: '11:45 AM - 12:15 PM', avgRpm: 180, peakConcurrentUsers: 95, serverLatency: '31ms' },
        { timeSlot: '02:00 PM - 02:30 PM', avgRpm: 120, peakConcurrentUsers: 62, serverLatency: '29ms' },
      ],
    },

    // 12. Token and collection integrity report (duplicate-collection attempts blocked, void tokens, not-collected count)
    tokenIntegrityReport: {
      title: 'Token & Counter Collection Integrity Report',
      description: 'Audit of duplicate handover attempts prevented, voided tokens, and unclaimed orders.',
      chartType: 'pie',
      data: [
        { category: 'Legitimate Handover Verified', count: 153, fill: '#10B981' },
        { category: 'Duplicate Collection Blocked', count: 4, fill: '#EF4444' },
        { category: 'Void/Cancelled Tokens Blocked', count: 2, fill: '#F59E0B' },
        { category: 'Unclaimed Orders', count: 0, fill: '#6B7280' },
      ],
      table: [
        { eventCheck: 'Duplicate Collection Attempts Blocked', count: 4, auditResult: 'Food preserved; alert sounded' },
        { eventCheck: 'Void/Cancelled Tokens Attempted at Counter', count: 2, auditResult: 'Rejected at scanner immediately' },
        { eventCheck: 'Correct Single Collection Rate', count: 153, auditResult: '100% verified with timestamp' },
        { eventCheck: 'Uncollected Food at Closing', count: 0, auditResult: 'Zero wastage recorded' },
      ],
    },
  };

  res.json({
    success: true,
    viewOnly: true,
    generatedAt: new Date().toISOString(),
    reports: reportsData,
  });
});

export default router;

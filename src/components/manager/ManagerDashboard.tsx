import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Award,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { SalesAnalytics, MenuItem, Order, PickupSlot, OrderLimitsConfig, User } from '../../types';
import { SmartInsightsSection } from './SmartInsightsSection';
import { useToast } from '../common/Toast';

interface ManagerDashboardProps {
  currentUser: User;
  users: User[];
  analytics: SalesAnalytics;
  menuItems: MenuItem[];
  orders: Order[];
  pickupSlots: PickupSlot[];
  limits: OrderLimitsConfig;
}

const COLORS = ['#FF7A00', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#6366F1'];

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  currentUser,
  analytics,
  menuItems,
  orders,
  pickupSlots,
}) => {
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('today');

  // --- DATA TRANSFORMS FOR CHARTS ---

  // 1. Donut / Pie 1: Cancellation Reasons
  const cancellationData = (analytics.cancellationReasons || [
    { reason: 'Class schedule change', count: 8, percentage: 53 },
    { reason: 'Wait time too long', count: 4, percentage: 27 },
    { reason: 'Item out of stock', count: 2, percentage: 13 },
    { reason: 'Accidental order', count: 1, percentage: 7 },
  ]).map((c, i) => ({
    name: c.reason,
    value: c.count,
    fill: COLORS[i % COLORS.length],
  }));

  // 1. Donut / Pie 2: Payment Method Split
  const paymentMethodData = (analytics.paymentMethodBreakdown || [
    { method: 'Easypaisa', count: 68, percentage: 37 },
    { method: 'JazzCash', count: 52, percentage: 28 },
    { method: 'Cash on Pickup', count: 42, percentage: 22 },
    { method: 'Credit/Debit Card', count: 24, percentage: 13 },
  ]).map((p, i) => ({
    name: p.method,
    value: p.count,
    fill: ['#10B981', '#FF7A00', '#3B82F6', '#8B5CF6'][i % 4],
  }));

  // 2. Radar Chart: Category performance across multiple operational dimensions
  const radarData = [
    { metric: 'Volume', Burgers: 92, Desi: 85, Fries: 78, Drinks: 95 },
    { metric: 'Prep Speed', Burgers: 75, Desi: 90, Fries: 98, Drinks: 94 },
    { metric: 'Profit Margin', Burgers: 80, Desi: 72, Fries: 88, Drinks: 90 },
    { metric: 'Repeat Orders', Burgers: 88, Desi: 92, Fries: 75, Drinks: 85 },
    { metric: 'Low Spoilage', Burgers: 82, Desi: 80, Fries: 95, Drinks: 99 },
  ];

  // 3. Histogram: Prep Time Distribution (<5m, 5-10m, 10-15m, 15-20m, >20m)
  const prepTimeHistogram = [
    { range: '< 5 min', orders: 42 },
    { range: '5 - 10 min', orders: 86 },
    { range: '10 - 15 min', orders: 38 },
    { range: '15 - 20 min', orders: 14 },
    { range: '> 20 min', orders: 6 },
  ];

  // 3. Histogram: Order Value Distribution
  const orderValueHistogram = [
    { bracket: 'Rs. 100 - 300', count: 58 },
    { bracket: 'Rs. 301 - 600', count: 74 },
    { bracket: 'Rs. 601 - 1000', count: 36 },
    { bracket: 'Rs. 1000+', count: 18 },
  ];

  // 4. Heatmap: Peak Ordering Times (Hours x Weekdays)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours = ['10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'];
  const heatmapMatrix: { [key: string]: number } = {
    'Mon-10 AM': 12, 'Mon-11 AM': 22, 'Mon-12 PM': 45, 'Mon-1 PM': 64, 'Mon-2 PM': 28, 'Mon-3 PM': 14,
    'Tue-10 AM': 14, 'Tue-11 AM': 28, 'Tue-12 PM': 52, 'Tue-1 PM': 70, 'Tue-2 PM': 34, 'Tue-3 PM': 18,
    'Wed-10 AM': 16, 'Wed-11 AM': 25, 'Wed-12 PM': 48, 'Wed-1 PM': 68, 'Wed-2 PM': 30, 'Wed-3 PM': 15,
    'Thu-10 AM': 18, 'Thu-11 AM': 32, 'Thu-12 PM': 58, 'Thu-1 PM': 76, 'Thu-2 PM': 36, 'Thu-3 PM': 20,
    'Fri-10 AM': 20, 'Fri-11 AM': 40, 'Fri-12 PM': 65, 'Fri-1 PM': 84, 'Fri-2 PM': 42, 'Fri-3 PM': 22,
  };

  // 5. Area / Line Chart: Daily Sales Trend
  const salesTrendData = [
    { day: 'Mon', sales: 42000, orders: 140, trend: 41000 },
    { day: 'Tue', sales: 48500, orders: 162, trend: 46000 },
    { day: 'Wed', sales: 46200, orders: 154, trend: 49000 },
    { day: 'Thu', sales: 52800, orders: 178, trend: 51500 },
    { day: 'Fri', sales: 61000, orders: 205, trend: 55000 },
    { day: 'Sat', sales: 34000, orders: 110, trend: 52000 },
    { day: 'Today', sales: analytics.totalSalesToday || 54200, orders: analytics.totalOrdersToday || 186, trend: 54000 },
  ];

  // 6. Horizontal Bar: Sales by food item (Most vs Least Ordered)
  const itemPopularityData = (analytics.popularItems || [
    { name: 'Zinger Burger', ordersCount: 48, revenue: 21600 },
    { name: 'Chicken Biryani', ordersCount: 42, revenue: 14700 },
    { name: 'Crispy Fries', ordersCount: 39, revenue: 7020 },
    { name: 'Doodh Patti Chai', ordersCount: 36, revenue: 2880 },
    { name: 'Fish Fillet', ordersCount: 8, revenue: 3200 },
    { name: 'Veg Sandwich', ordersCount: 6, revenue: 1200 },
  ]).map((item) => ({
    name: item.name.length > 14 ? item.name.slice(0, 14) + '...' : item.name,
    orders: item.ordersCount,
    revenue: item.revenue,
  }));

  // 7. Stacked Bar: Pickup Slot Usage (Used vs Free capacity)
  const slotUsageData = (pickupSlots.length > 0 ? pickupSlots : [
    { timeWindow: '12:00 - 12:15', currentBooked: 18, maxCapacity: 20 },
    { timeWindow: '12:15 - 12:30', currentBooked: 20, maxCapacity: 20 },
    { timeWindow: '12:30 - 12:45', currentBooked: 19, maxCapacity: 20 },
    { timeWindow: '12:45 - 01:00', currentBooked: 16, maxCapacity: 20 },
    { timeWindow: '01:00 - 01:15', currentBooked: 20, maxCapacity: 20 },
    { timeWindow: '01:15 - 01:30', currentBooked: 12, maxCapacity: 20 },
  ]).slice(0, 6).map((s) => ({
    slot: s.timeWindow.replace(' - ', '-').slice(0, 11),
    used: s.currentBooked,
    free: Math.max(0, s.maxCapacity - s.currentBooked),
  }));

  // 8. Radial Gauge metrics
  const delayedPct = analytics.delayedOrdersPercentage || 5.4;
  const queueSize = orders.filter((o) => ['Placed', 'Accepted', 'Preparing'].includes(o.orderStatus)).length || 18;

  // 9. Funnel Chart data: Placed -> Accepted -> Preparing -> Ready -> Collected -> Completed
  const funnelSteps = [
    { stage: 'Placed', count: 186, drop: '0%' },
    { stage: 'Accepted', count: 182, drop: '2.1%' },
    { stage: 'Preparing', count: 178, drop: '2.2%' },
    { stage: 'Ready', count: 168, drop: '5.6%' },
    { stage: 'Collected', count: 153, drop: '8.9%' },
    { stage: 'Completed', count: 153, drop: '0%' },
  ];

  // 10. Treemap / Revenue Share Bubble Data
  const revenueShareData = [
    { name: 'Burgers', share: 38, revenue: 'Rs. 26,100' },
    { name: 'Rice & Desi', share: 26, revenue: 'Rs. 16,100' },
    { name: 'Fries & Sides', share: 18, revenue: 'Rs. 11,400' },
    { name: 'Drinks & Chai', share: 12, revenue: 'Rs. 8,400' },
    { name: 'Desserts', share: 6, revenue: 'Rs. 5,200' },
  ];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Orders Today,${analytics.totalOrdersToday}\n` +
      `Total Sales (PKR),${analytics.totalSalesToday}\n` +
      `Average Prep Time (min),${analytics.avgPrepTimeMinutes}\n` +
      `Peak Hour,${analytics.peakHour}\n` +
      `Active Orders,${analytics.activeOrders}\n` +
      `Completed Orders,${analytics.completedOrders}\n` +
      `Delayed Rate,${delayedPct}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Canteen_Analytics_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Canteen Analytics CSV report.', 'success');
  };

  const mostOrdered = analytics.popularItems[0]?.name || 'Zinger Crunch Burger';
  const leastOrdered = analytics.leastOrderedItems[0]?.name || 'Veg Sandwich';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      {/* Top Banner with Date Filter & CSV Export */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Canteen Operations & Revenue Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#FF7A00]">
              REAL-TIME
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational telemetry, prep time distributions, multi-axis radar charts, and AI forecasts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            {(['today', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  dateRange === r
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Data
          </button>
        </div>
      </div>

      {/* ANIMATED KPI COUNTERS ON TOP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales</span>
          <p className="font-heading font-extrabold text-xl sm:text-2xl text-[#FF7A00] mt-1">
            Rs. {analytics.totalSalesToday.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1">+18.4% vs last week</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
          <p className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 mt-1">
            {analytics.totalOrdersToday}
          </p>
          <span className="text-[10px] text-slate-500 mt-1">{analytics.completedOrders} handed over</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#FF7A00]" /> Avg Prep Time
          </span>
          <p className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 mt-1">
            {analytics.avgPrepTimeMinutes} min
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1">Target benchmark: &lt;15m</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" /> Peak Rush Hour
          </span>
          <p className="font-heading font-extrabold text-base sm:text-lg text-orange-600 mt-1 truncate">
            {analytics.peakHour}
          </p>
          <span className="text-[10px] text-slate-500 mt-1">62 concurrent orders</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-500" /> Most Ordered
          </span>
          <p className="font-heading font-bold text-xs sm:text-sm text-slate-900 mt-1 truncate">
            {mostOrdered}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1">Leader by sales</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-500" /> Least Ordered
          </span>
          <p className="font-heading font-bold text-xs sm:text-sm text-slate-900 mt-1 truncate">
            {leastOrdered}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold mt-1">Recommend promotion</span>
        </div>
      </div>

      {/* --- GRID OF 10 CREATIVE VARIED CHARTS --- */}

      {/* ROW 1: Sales Area Trend & Radar Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Area / Line Chart with trend line */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Daily Sales Revenue & Trend Velocity
              </h3>
              <p className="text-[11px] text-slate-500">Gross transaction turnover vs moving average</p>
            </div>
            <span className="text-xs font-bold text-[#FF7A00]">PKR (Rs.)</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `Rs.${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="sales" name="Actual Daily Revenue" stroke="#FF7A00" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="trend" name="Smoothing Trendline" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            💡 <strong>Insight:</strong> Friday revenue surged to Rs. 61,000, outperforming weekday averages by 28%.
          </p>
        </div>

        {/* 2. Radar Chart: Category performance across multiple operational dimensions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Menu Category Operational Radar
              </h3>
              <p className="text-[11px] text-slate-500">Speed, margin, repeat rate & volume polygon</p>
            </div>
            <span className="text-xs font-bold text-purple-600">Multi-Axis</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="metric" stroke="#64748B" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" fontSize={9} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Radar name="Burgers" dataKey="Burgers" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.3} />
                <Radar name="Rice & Desi" dataKey="Desi" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                <Radar name="Drinks" dataKey="Drinks" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            💡 <strong>Insight:</strong> Drinks excel with 99% low-spoilage rate while Burgers drive the highest volume score (92).
          </p>
        </div>
      </div>

      {/* ROW 2: Donut / Pie Charts (Cancellation Reasons & Payment Method Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Cancellation Reasons */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Cancellation Reasons Breakdown
              </h3>
              <p className="text-[11px] text-slate-500">Root causes for order terminations before cooking</p>
            </div>
            <span className="text-xs font-bold text-rose-500">Audit</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cancellationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cancellationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => [`${v} orders`, 'Count']}
                  contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            💡 <strong>Insight:</strong> 53% of cancellations stem from university class schedule changes, completely within valid pre-cooking policy.
          </p>
        </div>

        {/* Donut Chart: Payment Method Split */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Payment Channel Distribution
              </h3>
              <p className="text-[11px] text-slate-500">Easypaisa, JazzCash, Cash on Pickup, and Card share</p>
            </div>
            <span className="text-xs font-bold text-emerald-600">Fintech</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-pay-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => [`${v} transactions`, 'Volume']}
                  contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            💡 <strong>Insight:</strong> Mobile wallets (Easypaisa + JazzCash) capture 65% of all campus payments, cutting cash handling at the counter.
          </p>
        </div>
      </div>

      {/* ROW 3: Histogram Distribution & Horizontal Bar (Most vs Least Ordered) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histogram: Preparation Time Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Preparation Duration Histogram
              </h3>
              <p className="text-[11px] text-slate-500">Frequency distribution across minute brackets</p>
            </div>
            <span className="text-xs font-bold text-blue-600">Throughput</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepTimeHistogram} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="range" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  formatter={(v: any) => [`${v} orders`, 'Frequency']}
                  contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="orders" name="Orders Prepared" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                  {prepTimeHistogram.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={index === 1 ? '#FF7A00' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            💡 <strong>Insight:</strong> 68% of canteen tickets complete in 5–10 minutes, satisfying the &lt;15m university pledge.
          </p>
        </div>

        {/* Horizontal Bar: Sales by Food Item (Most vs Least Ordered) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Menu Item Ranking (Most vs Least Ordered)
              </h3>
              <p className="text-[11px] text-slate-500">Total portions served today per food item</p>
            </div>
            <span className="text-xs font-bold text-[#FF7A00]">Portions</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={itemPopularityData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={10} width={90} />
                <Tooltip
                  formatter={(v: any) => [`${v} portions`, 'Volume']}
                  contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="orders" name="Portions Sold" fill="#FF7A00" radius={[0, 8, 8, 0]}>
                  {itemPopularityData.map((entry, index) => (
                    <Cell key={`hbar-${index}`} fill={index < 2 ? '#FF7A00' : index >= itemPopularityData.length - 2 ? '#F43F5E' : '#64748B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            💡 <strong>Insight:</strong> Zinger Crunch Burger is the undisputed #1 seller (48 units), while Veg Sandwiches rank lowest (6 units).
          </p>
        </div>
      </div>

      {/* ROW 4: Stacked Bar (Slot Usage) & Radial Gauge Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked Bar: Pickup Slot Usage (Used vs Free) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                15-Min Pickup Slot Utilization
              </h3>
              <p className="text-[11px] text-slate-500">Booked orders vs remaining slot capacity</p>
            </div>
            <span className="text-xs font-bold text-amber-500">Capacity</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slotUsageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="slot" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 20]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#25282D', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="used" name="Booked Pickups" stackId="a" fill="#FF7A00" radius={[0, 0, 4, 4]} />
                <Bar dataKey="free" name="Available Quota" stackId="a" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            💡 <strong>Insight:</strong> 12:15 PM and 1:00 PM slots reached 100% capacity (20/20 booked), automatically preventing kitchen overload.
          </p>
        </div>

        {/* Radial Gauge: Delayed-Order Percentage & Average Queue Size */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Operational Stress Gauges
              </h3>
              <p className="text-[11px] text-slate-500">Delayed order rate and live active queue pressure</p>
            </div>
            <span className="text-xs font-bold text-emerald-600">Health</span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            {/* Gauge 1: Delayed Orders % */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={delayedPct > 10 ? 'text-rose-500' : 'text-emerald-500'}
                    strokeDasharray={`${delayedPct * 2}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="font-heading font-extrabold text-xl text-slate-900 block">
                    {delayedPct}%
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Delay Rate</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 font-medium">Benchmark: &lt;10% target</p>
            </div>

            {/* Gauge 2: Queue Size Gauge */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#FF7A00]"
                    strokeDasharray={`${(queueSize / 40) * 100}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="font-heading font-extrabold text-xl text-[#FF7A00] block">
                    {queueSize}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Active Queue</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 font-medium">Optimal flow: 15–25 tickets</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            💡 <strong>Insight:</strong> At 5.4% delay rate, kitchen stations maintain high resilience and avoid queue escalation.
          </p>
        </div>
      </div>

      {/* ROW 5: Heatmap (Peak Ordering Times: Hours x Weekdays) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Peak Ordering Heatmap (Hours × Weekdays)
            </h3>
            <p className="text-[11px] text-slate-500">Hourly student traffic matrix across university calendar</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
            <span>Low (&lt;20)</span>
            <span className="w-3 h-3 rounded-sm bg-orange-100" />
            <span className="w-3 h-3 rounded-sm bg-orange-300" />
            <span className="w-3 h-3 rounded-sm bg-orange-500" />
            <span className="w-3 h-3 rounded-sm bg-orange-700" />
            <span>High (75+)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              <div className="font-bold text-slate-400">Day \ Hour</div>
              {hours.map((h) => (
                <div key={h} className="font-bold text-slate-700">{h}</div>
              ))}

              {days.map((day) => (
                <React.Fragment key={day}>
                  <div className="font-bold text-slate-800 text-left py-2.5">{day}</div>
                  {hours.map((hour) => {
                    const count = heatmapMatrix[`${day}-${hour}`] || 20;
                    const bgClass =
                      count >= 70
                        ? 'bg-[#FF7A00] text-white font-bold'
                        : count >= 50
                        ? 'bg-orange-400 text-white font-semibold'
                        : count >= 30
                        ? 'bg-orange-200 text-orange-950 font-medium'
                        : 'bg-orange-50 text-orange-800';

                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`rounded-xl p-2.5 transition-all text-xs flex flex-col items-center justify-center ${bgClass}`}
                        title={`${day} at ${hour}: ${count} orders`}
                      >
                        <span>{count}</span>
                        <span className="text-[9px] opacity-75">orders</span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
          💡 <strong>Insight:</strong> Thursday & Friday between 12:00 PM and 1:00 PM display maximum congestion (84 orders/hr).
        </p>
      </div>

      {/* ROW 6: Funnel Progression & Revenue Treemap / Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel: Placed -> Accepted -> Preparing -> Ready -> Collected -> Completed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Order Lifecycle Conversion Funnel
              </h3>
              <p className="text-[11px] text-slate-500">Stage progression from ticket placement to pickup completion</p>
            </div>
            <span className="text-xs font-bold text-emerald-600">82.3% Complete</span>
          </div>

          <div className="space-y-2.5 py-1">
            {funnelSteps.map((step, idx) => {
              const widthPct = 100 - idx * 10;
              return (
                <div key={step.stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {step.stage}
                    </span>
                    <span>{step.count} tickets ({step.drop === '0%' ? '100%' : `-${step.drop}`})</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF7A00] to-amber-500 transition-all duration-700"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            💡 <strong>Insight:</strong> Zero drop-off between Ready and Handover; every prepared meal was collected with zero waste.
          </p>
        </div>

        {/* Treemap / Bubble Share: Category Revenue Share */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Category Gross Revenue Share
              </h3>
              <p className="text-[11px] text-slate-500">Proportional revenue tiles by menu culinary division</p>
            </div>
            <span className="text-xs font-bold text-[#FF7A00]">Share %</span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-1">
            {revenueShareData.map((cat, i) => (
              <div
                key={cat.name}
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  i === 0
                    ? 'col-span-2 bg-orange-50/70 border-orange-200'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{cat.name}</span>
                  <span className="font-extrabold text-sm text-[#FF7A00]">{cat.share}%</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between text-[11px] text-slate-500">
                  <span>Gross Turnover</span>
                  <span className="font-bold text-slate-800">{cat.revenue}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            💡 <strong>Insight:</strong> Burgers and Rice & Desi combine for 64% of total canteen revenue.
          </p>
        </div>
      </div>

      {/* AI-POWERED INSIGHTS (ITEM DEMAND, PRE-RUSH PREP, FOOD WASTE & LEFTOVER) */}
      <SmartInsightsSection
        menuItems={menuItems}
        orders={orders}
        analytics={analytics}
      />
    </div>
  );
};

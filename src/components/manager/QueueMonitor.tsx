import React from 'react';
import { Clock, Flame, CheckCircle2, AlertTriangle, Layers, User } from 'lucide-react';
import { Order } from '../../types';

interface QueueMonitorProps {
  orders: Order[];
}

export const QueueMonitor: React.FC<QueueMonitorProps> = ({ orders }) => {
  // Read-only queue metrics
  const activeOrders = orders.filter(
    (o) => !['Completed', 'Cancelled', 'Rejected'].includes(o.orderStatus)
  );

  const waitingOrders = orders.filter(
    (o) => o.orderStatus === 'Placed' || o.orderStatus === 'Accepted'
  );
  const preparingOrders = orders.filter((o) => o.orderStatus === 'Preparing');
  const readyOrders = orders.filter((o) => o.orderStatus === 'Ready');
  const delayedOrders = orders.filter((o) => o.isDelayed);

  // Longest waiting order
  const longestWaitingOrder = [...waitingOrders].sort(
    (a, b) => new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime()
  )[0];

  const now = Date.now();
  const longestWaitMinutes = longestWaitingOrder
    ? Math.max(1, Math.round((now - new Date(longestWaitingOrder.orderTime).getTime()) / 60000))
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Read-Only Top Overview Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-lg text-slate-900">
              Live Kitchen Queue Monitor
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              READ-ONLY SUPERVISION
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervise active kitchen stages and wait times. Cooking status changes are handled exclusively by kitchen staff.
          </p>
        </div>

        {/* Counts per stage */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Queue Size</span>
            <p className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">
              {activeOrders.length}
            </p>
            <span className="text-[10px] text-slate-500">Active tickets</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" /> Waiting
            </span>
            <p className="font-heading font-extrabold text-2xl text-amber-800 mt-0.5">
              {waitingOrders.length}
            </p>
            <span className="text-[10px] text-amber-600">Pending cook line</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200">
            <span className="text-[11px] font-bold text-orange-700 uppercase flex items-center gap-1">
              <Flame className="w-3 h-3" /> Preparing
            </span>
            <p className="font-heading font-extrabold text-2xl text-orange-800 mt-0.5">
              {preparingOrders.length}
            </p>
            <span className="text-[10px] text-orange-600">On kitchen stations</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
            <p className="font-heading font-extrabold text-2xl text-emerald-800 mt-0.5">
              {readyOrders.length}
            </p>
            <span className="text-[10px] text-emerald-600">Counter collection</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-700 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Delayed
            </span>
            <p className="font-heading font-extrabold text-2xl text-rose-800 mt-0.5">
              {delayedOrders.length}
            </p>
            <span className="text-[10px] text-rose-600">Exceeded ETA</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200">
            <span className="text-[11px] font-bold text-purple-700 uppercase">Longest Wait</span>
            <p className="font-heading font-extrabold text-2xl text-purple-800 mt-0.5">
              {longestWaitMinutes > 0 ? `${longestWaitMinutes}m` : '0m'}
            </p>
            <span className="text-[10px] text-purple-600">
              {longestWaitingOrder ? longestWaitingOrder.tokenNumber : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Read-Only Live Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs space-y-3">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900">Active Queue Line</h3>
            <p className="text-xs text-slate-500">Live order tickets and estimated ready milestones</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {activeOrders.length} tickets in queue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Pickup Window</th>
                <th className="py-3 px-4">Est. Ready</th>
                <th className="py-3 px-4">Stage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeOrders.map((order) => {
                const readyStr = new Date(order.estimatedReadyTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-heading font-extrabold text-base text-[#FF7A00]">
                        {order.tokenNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400">{order.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{order.pickupTime}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{readyStr}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.orderStatus === 'Ready'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.orderStatus === 'Preparing'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
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

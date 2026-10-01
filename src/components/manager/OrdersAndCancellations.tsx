import React, { useState } from 'react';
import { Search, XCircle, CheckCircle2, Clock, Filter, AlertTriangle } from 'lucide-react';
import { Order } from '../../types';

interface OrdersAndCancellationsProps {
  orders: Order[];
}

export const OrdersAndCancellations: React.FC<OrdersAndCancellationsProps> = ({ orders }) => {
  const [filter, setFilter] = useState<'all' | 'cancelled' | 'completed' | 'active'>('cancelled');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'cancelled' && !(o.orderStatus === 'Cancelled' || o.orderStatus === 'Rejected')) return false;
    if (filter === 'completed' && o.orderStatus !== 'Completed') return false;
    if (filter === 'active' && ['Completed', 'Cancelled', 'Rejected'].includes(o.orderStatus)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.tokenNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.cancellationReason && o.cancellationReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const cancelledCount = orders.filter((o) => o.orderStatus === 'Cancelled' || o.orderStatus === 'Rejected').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-lg text-slate-900">
              Orders & Cancellation Review
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
              {cancelledCount} CANCELLED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit customer cancellation reasons and refund reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['cancelled', 'all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-all ${
                filter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by token, customer, or cancellation reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-[#FF7A00]"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Cancellation / Rejection Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No orders match this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
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
                    <td className="py-3 px-4 font-bold text-slate-900">
                      Rs. {order.totalAmount}
                      <p className="text-[10px] font-normal text-slate-400">
                        {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-700'
                            : order.orderStatus === 'Rejected'
                            ? 'bg-purple-100 text-purple-700'
                            : order.orderStatus === 'Completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {order.cancellationReason || order.rejectionReason || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

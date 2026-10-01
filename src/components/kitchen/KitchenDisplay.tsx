import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Search,
  ScanLine,
  XCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { queueEngine } from '../../services/queueEngine';
import { useToast } from '../common/Toast';

interface KitchenDisplayProps {
  orders: Order[];
  onOpenScanner: () => void;
  onOpenQuickStock: () => void;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
  orders,
  onOpenScanner,
  onOpenQuickStock,
}) => {
  const { showToast } = useToast();
  // Independent filter state
  const [activeTab, setActiveTab] = useState<'all' | 'cooking' | 'waiting' | 'ready'>('all');
  const [searchToken, setSearchToken] = useState('');

  // Reject modal state
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Ingredients out of stock');
  const [customRejectReason, setCustomRejectReason] = useState('');

  // Problem report modal state
  const [problemOrder, setProblemOrder] = useState<Order | null>(null);
  const [problemDescription, setProblemDescription] = useState('');

  // Sort queue by priority engine
  const sortedOrders = queueEngine.sortQueue(orders);

  // Filter orders according to activeTab without changing tab state on summary clicks
  const displayOrders = sortedOrders.filter((order) => {
    if (order.orderStatus === 'Completed' || order.orderStatus === 'Cancelled' || order.orderStatus === 'Rejected') {
      return false;
    }
    if (searchToken.trim()) {
      const q = searchToken.toLowerCase();
      return (
        order.tokenNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'cooking') return order.orderStatus === 'Preparing';
    if (activeTab === 'waiting') return order.orderStatus === 'Placed' || order.orderStatus === 'Accepted';
    if (activeTab === 'ready') return order.orderStatus === 'Ready';
    return true;
  });

  const handleStatusAdvance = (order: Order) => {
    if (order.orderStatus === 'Placed' || order.orderStatus === 'Accepted') {
      storageService.updateOrderStatus(order.id, 'Preparing', 'Chef Bilal');
      showToast(`🔥 Order ${order.tokenNumber} is now PREPARING on station.`, 'info');
    } else if (order.orderStatus === 'Preparing') {
      storageService.updateOrderStatus(order.id, 'Ready', 'Chef Bilal');
      showToast(`🍽️ Order ${order.tokenNumber} marked READY for pickup!`, 'success');
    }
  };

  const handleReorder = (orderId: string, dir: 'up' | 'down') => {
    storageService.reorderQueueItem(orderId, dir, 'Chef Bilal');
    showToast(`Queue priority adjusted.`, 'info');
  };

  const handleConfirmReject = () => {
    if (!rejectingOrder) return;
    const finalReason = rejectReason === 'Other' && customRejectReason ? customRejectReason : rejectReason;
    storageService.rejectOrder(rejectingOrder.id, finalReason, 'Chef Bilal');
    showToast(`Order ${rejectingOrder.tokenNumber} rejected and refunded.`, 'info');
    setRejectingOrder(null);
  };

  const handleReportProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemOrder || !problemDescription.trim()) return;
    storageService.addLog(
      'ORDER_PROBLEM_REPORTED',
      'Chef Bilal',
      'staff',
      `Problem on Token ${problemOrder.tokenNumber}: ${problemDescription}`,
      problemOrder.tokenNumber
    );
    showToast(`Problem flagged for Token ${problemOrder.tokenNumber}.`, 'info');
    setProblemOrder(null);
    setProblemDescription('');
  };

  const preparingCount = orders.filter((o) => o.orderStatus === 'Preparing').length;
  const waitingCount = orders.filter((o) => o.orderStatus === 'Placed' || o.orderStatus === 'Accepted').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'Ready').length;
  const allActiveCount = orders.filter(
    (o) => !['Completed', 'Cancelled', 'Rejected'].includes(o.orderStatus)
  ).length;

  return (
    <div className="min-h-screen bg-[#1E2024] text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top KDS Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#25282D] p-5 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                Kitchen Display System (KDS)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                COOK LINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Only role that updates order cook progression and reorders queue tickets
            </p>
          </div>
        </div>

        {/* Counter quick actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
          >
            <ScanLine className="w-4 h-4" />
            <span>Verify & Collect</span>
          </button>

          <button
            onClick={onOpenQuickStock}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs transition-all"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Quick Stock Toggle</span>
          </button>
        </div>
      </div>

      {/* Tabs with independent state (Fix for "All Orders" bug) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'all'
              ? 'bg-[#2E3238] border-[#FF7A00] ring-2 ring-[#FF7A00]'
              : 'bg-[#25282D] border-white/5 hover:border-white/20'
          }`}
        >
          <span className="text-slate-400 text-xs block font-medium">All Active Queue</span>
          <span className="font-heading font-extrabold text-2xl text-white mt-1 block">
            {allActiveCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cooking')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'cooking'
              ? 'bg-[#2E3238] border-orange-500 ring-2 ring-orange-500'
              : 'bg-[#25282D] border-white/5 hover:border-white/20'
          }`}
        >
          <span className="text-orange-400 text-xs block font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> Cooking Now
          </span>
          <span className="font-heading font-extrabold text-2xl text-white mt-1 block">
            {preparingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('waiting')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'waiting'
              ? 'bg-[#2E3238] border-amber-500 ring-2 ring-amber-500'
              : 'bg-[#25282D] border-white/5 hover:border-white/20'
          }`}
        >
          <span className="text-amber-400 text-xs block font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Waiting In Queue
          </span>
          <span className="font-heading font-extrabold text-2xl text-white mt-1 block">
            {waitingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ready')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'ready'
              ? 'bg-[#2E3238] border-emerald-500 ring-2 ring-emerald-500'
              : 'bg-[#25282D] border-white/5 hover:border-white/20'
          }`}
        >
          <span className="text-emerald-400 text-xs block font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Pickup
          </span>
          <span className="font-heading font-extrabold text-2xl text-white mt-1 block">
            {readyCount}
          </span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by token (e.g. C-021) or customer name..."
            value={searchToken}
            onChange={(e) => setSearchToken(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#25282D] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]"
          />
        </div>
      </div>

      {/* Live Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {displayOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-[#25282D] rounded-3xl border border-white/5">
            <ChefHat className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <p className="font-bold text-sm text-slate-300">No orders in this station lane</p>
            <p className="text-xs text-slate-500 mt-1">Incoming tickets will appear here automatically.</p>
          </div>
        ) : (
          displayOrders.map((order, index) => {
            const isCooking = order.orderStatus === 'Preparing';
            const isReady = order.orderStatus === 'Ready';
            const isDelayed = order.isDelayed;

            return (
              <div
                key={order.id}
                className={`rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xl ${
                  isDelayed
                    ? 'bg-[#2C2123] border-rose-500/80 shadow-rose-950/40'
                    : isCooking
                    ? 'bg-[#2B2825] border-orange-500/80 shadow-orange-950/30'
                    : isReady
                    ? 'bg-[#1E2924] border-emerald-500/80 shadow-emerald-950/30'
                    : 'bg-[#25282D] border-white/10'
                }`}
              >
                {/* Order Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          QUEUE #{index + 1}
                        </span>
                        {/* Queue Reorder buttons for kitchen staff */}
                        <div className="inline-flex rounded-lg bg-black/40 p-0.5 border border-white/10">
                          <button
                            onClick={() => handleReorder(order.id, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-white/20 text-slate-400 hover:text-white disabled:opacity-30 rounded"
                            title="Move up in queue"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleReorder(order.id, 'down')}
                            disabled={index === displayOrders.length - 1}
                            className="p-1 hover:bg-white/20 text-slate-400 hover:text-white disabled:opacity-30 rounded"
                            title="Move down in queue"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#FF7A00] tracking-tight leading-none mt-1">
                        {order.tokenNumber}
                      </h2>
                    </div>

                    {/* Priority & Status Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isReady
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isCooking
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30 animate-pulse'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {order.orderStatus.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {isDelayed && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> DELAYED (+{order.delayMinutes}m)
                          </span>
                        )}
                        {order.isScheduled && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            SCHEDULED
                          </span>
                        )}
                        {order.isQuick && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300">
                            QUICK (5m)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer info & Timing */}
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-3">
                    <span className="font-semibold text-slate-200">{order.customerName}</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Slot: <strong className="text-white">{order.pickupTime}</strong>
                    </span>
                  </div>

                  {/* Items to Cook */}
                  <div className="space-y-2 py-1">
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Kitchen Items ({order.items.length})
                    </h4>
                    <div className="divide-y divide-white/5 space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="pt-1.5 first:pt-0">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-white">
                              <span className="text-[#FF7A00] font-extrabold mr-1.5">
                                {item.quantity}x
                              </span>
                              {item.name}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              ~{item.preparationTime * item.quantity}m
                            </span>
                          </div>
                          {item.specialInstruction && (
                            <div className="mt-1 p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold">
                              ⚠️ Special: "{item.specialInstruction}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                  {!isReady ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStatusAdvance(order)}
                        className={`w-full py-3.5 px-4 rounded-2xl font-heading font-extrabold text-sm transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 ${
                          isCooking
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                            : 'bg-[#FF7A00] hover:bg-[#e66e00] text-white shadow-orange-500/30'
                        }`}
                      >
                        {isCooking ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>MARK READY FOR COUNTER</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-5 h-5" />
                            <span>START PREPARING (STATION #1)</span>
                          </>
                        )}
                      </button>

                      {/* Reject Order & Report Problem buttons for staff */}
                      <div className="flex items-center gap-2">
                        {order.orderStatus === 'Placed' && (
                          <button
                            onClick={() => setRejectingOrder(order)}
                            className="flex-1 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs border border-rose-500/30 transition-colors"
                          >
                            Reject Ticket
                          </button>
                        )}
                        <button
                          onClick={() => setProblemOrder(order)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors"
                        >
                          Report Issue
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                      Ready at Counter • Awaiting Customer Pickup
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Order Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#25282D] text-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-white/10">
            <h3 className="font-heading font-bold text-base text-rose-400">
              Reject Order {rejectingOrder.tokenNumber}
            </h3>
            <p className="text-xs text-slate-300">
              Provide a clear reason. Customer will be notified and any payment refunded.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-semibold">Select Reason</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white"
              >
                <option value="Ingredients out of stock">Ingredients out of stock</option>
                <option value="Kitchen station overload / delay">Kitchen station overload / delay</option>
                <option value="Equipment maintenance issue">Equipment maintenance issue</option>
                <option value="Other">Other reason</option>
              </select>

              {rejectReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify reason..."
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white"
                />
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejectingOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Report Modal */}
      {problemOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <form onSubmit={handleReportProblem} className="bg-[#25282D] text-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-white/10">
            <h3 className="font-heading font-bold text-base text-amber-400">
              Report Problem on Token {problemOrder.tokenNumber}
            </h3>
            <p className="text-xs text-slate-300">
              Log cooking delay, ingredient shortage, or station issue.
            </p>

            <textarea
              placeholder="Describe issue (e.g. Bun grill overheated, waiting on fries batch)..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-xs text-white"
              required
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProblemOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                Submit Problem Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

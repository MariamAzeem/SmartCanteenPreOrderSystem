import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChefHat,
  PackageCheck,
  XCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { CANCELLATION_REASONS } from '../../data/seedData';
import { useToast } from '../common/Toast';

interface OrderTrackingViewProps {
  orders: Order[];
  onGoToMenu: () => void;
  selectedToken?: string;
  onReorder?: (itemsToAdd: { [itemId: string]: number }, instructions?: { [itemId: string]: string }) => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'Placed', label: 'Order Placed', icon: ShoppingBag },
  { status: 'Accepted', label: 'Queue Accepted', icon: Clock },
  { status: 'Preparing', label: 'Kitchen Cooking', icon: ChefHat },
  { status: 'Ready', label: 'Ready for Pickup', icon: Sparkles },
  { status: 'Completed', label: 'Food Collected', icon: PackageCheck },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  onGoToMenu,
  selectedToken,
  onReorder,
}) => {
  const { showToast } = useToast();

  const [activeToken, setActiveToken] = useState<string>(
    selectedToken || orders[0]?.tokenNumber || ''
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [otherReasonText, setOtherReasonText] = useState('');

  // Find target order
  const currentOrder = orders.find((o) => o.tokenNumber === activeToken) || orders[0];

  const handleCancelOrder = () => {
    if (!currentOrder) return;
    try {
      const finalReason =
        cancelReason === 'Other reason' && otherReasonText
          ? otherReasonText
          : cancelReason;

      storageService.cancelOrder(currentOrder.id, finalReason, currentOrder.customerName);
      if (currentOrder.paymentStatus === 'paid') {
        showToast(`Your order has been cancelled. Refund of Rs. ${currentOrder.totalAmount} initiated to your ${currentOrder.paymentMethod.toUpperCase()}.`, 'info');
      } else {
        showToast('Your order has been cancelled.', 'info');
      }
      setShowCancelModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cannot cancel order';
      showToast(msg, 'error');
    }
  };

  if (!currentOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-orange-100 text-[#FF7A00] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-900">
          No Active Orders In Queue
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
          You haven't placed any canteen orders today. Browse our fresh menu and generate your digital token.
        </p>
        <button
          onClick={onGoToMenu}
          className="px-6 py-3 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
        >
          Browse Fresh Menu
        </button>
      </div>
    );
  }

  // Calculate step progress
  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Placed') return 0;
    if (status === 'Accepted') return 1;
    if (status === 'Preparing') return 2;
    if (status === 'Ready') return 3;
    if (status === 'Collected' || status === 'Completed') return 4;
    return -1; // Cancelled or rejected
  };

  const currentStepIdx = getStepIndex(currentOrder.orderStatus);
  const canCancelOrEdit = currentOrder.orderStatus === 'Placed' || currentOrder.orderStatus === 'Accepted';

  // Compute how many active orders are ahead of this order in the kitchen queue
  const allOrders = storageService.getOrders();
  const ordersAhead = allOrders.filter(
    (o) =>
      o.id !== currentOrder.id &&
      ['Placed', 'Accepted', 'Preparing'].includes(o.orderStatus) &&
      new Date(o.orderTime).getTime() < new Date(currentOrder.orderTime).getTime()
  ).length;

  // Format times
  const readyTimeStr = currentOrder.actualReadyTime
    ? new Date(currentOrder.actualReadyTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date(currentOrder.estimatedReadyTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleReorderClick = () => {
    if (!currentOrder || !onReorder) return;
    const menuItems = storageService.getMenuItems();
    const limits = storageService.getOrderLimits();
    const maxItemsLimit = limits.maxItemsPerCustomer || 6;

    const toAdd: { [itemId: string]: number } = {};
    const instructionsToAdd: { [itemId: string]: string } = {};
    const skippedItems: string[] = [];
    let runningCount = 0;

    currentOrder.items.forEach((item) => {
      const liveItem = menuItems.find((m) => m.id === item.itemId);
      if (
        liveItem &&
        liveItem.status !== 'Sold Out' &&
        liveItem.status !== 'Temporarily Unavailable' &&
        liveItem.availableQuantity > 0
      ) {
        const allowedQty = Math.min(item.quantity, liveItem.availableQuantity, maxItemsLimit - runningCount);
        if (allowedQty > 0) {
          toAdd[item.itemId] = allowedQty;
          runningCount += allowedQty;
          if (item.specialInstruction) {
            instructionsToAdd[item.itemId] = item.specialInstruction;
          }
        }
      } else {
        skippedItems.push(item.name);
      }
    });

    if (Object.keys(toAdd).length === 0) {
      if (skippedItems.length > 0) {
        showToast(`${skippedItems.join(', ')} is currently unavailable, so we couldn't rebuild your tray.`, 'error');
      } else {
        showToast('Unable to reorder items.', 'error');
      }
      return;
    }

    if (skippedItems.length > 0) {
      showToast(`${skippedItems.join(', ')} is currently unavailable, so we skipped it.`, 'info');
    } else {
      showToast('Items added to your tray! Review and place your order.', 'success');
    }

    onReorder(toAdd, instructionsToAdd);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Order selector tabs if multiple orders exist */}
      {orders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Your Orders:</span>
          {orders.map((o) => (
            <button
              key={o.id}
              onClick={() => setActiveToken(o.tokenNumber)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeToken === o.tokenNumber
                  ? 'bg-[#25282D] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Token {o.tokenNumber} ({o.orderStatus})
            </button>
          ))}
        </div>
      )}

      {/* Main Digital Token Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 relative overflow-hidden space-y-6">
        {/* Token Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Digital Queue Token
              </span>
              {currentOrder.isDelayed && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                  DELAYED (+{currentOrder.delayMinutes}m)
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#FF7A00] tracking-tight">
                {currentOrder.tokenNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentOrder.orderStatus === 'Ready'
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20'
                    : currentOrder.orderStatus === 'Preparing'
                    ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500/20'
                    : currentOrder.orderStatus === 'Completed'
                    ? 'bg-blue-100 text-blue-700'
                    : currentOrder.orderStatus === 'Cancelled'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {currentOrder.orderStatus.toUpperCase()}
              </span>
            </div>

            {/* Queue position & Live prep time banner */}
            {['Placed', 'Accepted', 'Preparing'].includes(currentOrder.orderStatus) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[#FF7A00] text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {ordersAhead > 0 ? `${ordersAhead} orders ahead of you` : 'Your order is next up!'}
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
                  ⏱ Prep Time: ~{currentOrder.estimatedPrepMinutes} min (Ready by {readyTimeStr})
                </span>
              </div>
            )}
          </div>

          {/* QR Code Container for staff counter scanning */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <QRCodeSVG
              value={`SMARTCANTEEN:${currentOrder.tokenNumber}:${currentOrder.id}`}
              size={64}
              level="M"
              className="rounded-lg"
            />
            <div className="text-[10px] text-slate-500 leading-tight">
              <p className="font-bold text-slate-800">Scan at Counter</p>
              <p>Show to staff for verification</p>
            </div>
          </div>
        </div>

        {/* Live Timeline / Status Stepper */}
        {currentStepIdx >= 0 ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Kitchen Progress</span>
              <span className="text-[#FF7A00] font-bold">
                {currentOrder.orderStatus === 'Ready'
                  ? 'Ready on Counter'
                  : currentOrder.orderStatus === 'Completed'
                  ? 'Order Finished'
                  : `Estimated by ${readyTimeStr}`}
              </span>
            </div>

            {/* Stepper bar */}
            <div className="relative flex items-center justify-between">
              {/* Connecting line */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-[#FF7A00] transition-all duration-500 -z-0"
                style={{
                  width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 92}%`,
                }}
              />

              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const StepIcon = step.icon;

                return (
                  <div key={step.status} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                        isCurrent
                          ? 'bg-[#FF7A00] text-white ring-4 ring-orange-200 scale-110'
                          : isPassed
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold mt-2 text-center max-w-[65px] leading-tight ${
                        isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-bold">This order has been {currentOrder.orderStatus}</p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Reason: {currentOrder.cancellationReason || currentOrder.rejectionReason || 'User request'}
              </p>
            </div>
          </div>
        )}

        {/* Ready Notification Banner if Order is Ready */}
        {currentOrder.orderStatus === 'Ready' && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 animate-bounce-subtle">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍽️</span>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-emerald-950">
                  Your food is waiting at Counter #1!
                </h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Show token <strong>{currentOrder.tokenNumber}</strong> or the QR code above to staff to collect your meal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details & Summary Breakdown */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Placed at: {new Date(currentOrder.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1.5">
              Pickup Slot: <strong className="text-slate-900">{currentOrder.pickupTime}</strong>
            </span>
          </div>

          {/* Items Tray */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Meal Items ({currentOrder.items.length})
            </h4>
            <div className="divide-y divide-slate-200/60">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="py-2 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">
                      {item.quantity}x {item.name}
                    </p>
                    {item.specialInstruction && (
                      <p className="text-[10px] text-amber-700 italic">
                        Note: {item.specialInstruction}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-slate-700">Rs. {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between font-heading font-bold text-sm text-slate-900">
              <span>Total Amount</span>
              <span className="text-[#FF7A00]">Rs. {currentOrder.totalAmount}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Payment ({currentOrder.paymentMethod.toUpperCase()})</span>
              <span
                className={`font-semibold ${
                  currentOrder.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {currentOrder.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Action row: Order More, Reorder, Cancel */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onGoToMenu}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              ← Order More Items
            </button>

            {onReorder && (
              <button
                onClick={handleReorderClick}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF7A00] border border-orange-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reorder Meal
              </button>
            )}
          </div>

          {/* Cancel button rule enforcement */}
          {currentOrder.orderStatus !== 'Cancelled' &&
            currentOrder.orderStatus !== 'Completed' && (
              <div className="w-full sm:w-auto relative group">
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={!canCancelOrEdit}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    canCancelOrEdit
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  Cancel Pre-Order
                </button>

                {!canCancelOrEdit && (
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-[#25282D] text-white text-[10px] rounded-lg shadow-xl text-center pointer-events-none z-30">
                    Kitchen has started cooking your food! Orders in "Preparing" or "Ready" state cannot be cancelled.
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-2xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Cancel Pre-Order {currentOrder.tokenNumber}?
                </h3>
                <p className="text-xs text-slate-500">You can cancel anytime before the kitchen starts cooking.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Select Reason for Cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-[#FF7A00]"
              >
                {CANCELLATION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {cancelReason === 'Other reason' && (
                <textarea
                  placeholder="Tell us what changed..."
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs mt-2"
                  rows={2}
                />
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

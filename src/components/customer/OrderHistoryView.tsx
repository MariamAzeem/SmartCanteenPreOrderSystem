import React from 'react';
import { History, RotateCcw, Clock, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Order, MenuItem } from '../../types';
import { useToast } from '../common/Toast';

interface OrderHistoryViewProps {
  orders: Order[];
  menuItems: MenuItem[];
  onReorder: (itemsToAdd: { [itemId: string]: number }, instructions?: { [itemId: string]: string }) => void;
  onViewToken: (token: string) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  menuItems,
  onReorder,
  onViewToken,
}) => {
  const { showToast } = useToast();

  const handleReorderClick = (order: Order) => {
    const toAdd: { [itemId: string]: number } = {};
    const instructionsToAdd: { [itemId: string]: string } = {};
    const skippedItems: string[] = [];
    const maxItemsLimit = 6;
    let runningCount = 0;

    order.items.forEach((item) => {
      const liveItem = menuItems.find((m) => m.id === item.itemId);
      if (liveItem && liveItem.status !== 'Sold Out' && liveItem.status !== 'Temporarily Unavailable' && liveItem.availableQuantity > 0) {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
            Order History & Past Tokens
          </h2>
          <p className="text-xs text-slate-500">
            View past receipts, digital tokens, or reorder meals with 1 click.
          </p>
        </div>
        <div className="p-2.5 rounded-2xl bg-orange-100 text-[#FF7A00]">
          <History className="w-5 h-5" />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-heading font-bold text-slate-800 text-sm">No orders on record yet</h3>
          <p className="text-xs text-slate-500">
            Once you order from the canteen, receipts and tokens will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const dateStr = new Date(order.orderTime).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = new Date(order.orderTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-extrabold text-base text-[#FF7A00] tracking-tight bg-orange-50 px-3 py-1 rounded-xl border border-orange-200/60">
                      {order.tokenNumber}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {dateStr} • {timeStr}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Pickup: <strong>{order.pickupTime}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        order.orderStatus === 'Completed'
                          ? 'bg-blue-100 text-blue-700'
                          : order.orderStatus === 'Ready'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.orderStatus === 'Preparing'
                          ? 'bg-orange-100 text-orange-700'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.orderStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-1 text-xs">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-600">
                      <span>
                        {item.quantity}x {item.name}
                        {item.specialInstruction && (
                          <span className="text-[10px] text-amber-600 ml-1 italic">
                            ({item.specialInstruction})
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-slate-900">
                        Rs. {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer action row */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-slate-500">Total: </span>
                    <strong className="text-slate-900 font-bold text-sm">
                      Rs. {order.totalAmount}
                    </strong>
                    <span className="text-slate-400 ml-2 text-[10px]">
                      via {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewToken(order.tokenNumber)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      View Live Token <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleReorderClick(order)}
                      className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-[#FF7A00] hover:text-white text-[#FF7A00] text-xs font-bold flex items-center gap-1.5 transition-colors border border-orange-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reorder 1-Tap
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

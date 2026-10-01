import React from 'react';
import { X, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MenuItem } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface QuickStockToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

export const QuickStockToggleModal: React.FC<QuickStockToggleModalProps> = ({
  isOpen,
  onClose,
  menuItems,
}) => {
  const { showToast } = useToast();
  if (!isOpen) return null;

  const handleToggle = (item: MenuItem) => {
    const isCurrentlyUnavailable = item.status === 'Sold Out' || item.status === 'Temporarily Unavailable';
    
    if (isCurrentlyUnavailable) {
      if (item.availableQuantity <= 0) {
        showToast('Add stock first. Quantity must be more than 0.', 'error');
        return;
      }
      try {
        storageService.toggleItemAvailability(item.id, 'Available');
        showToast(`${item.name} is now Available.`, 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Cannot enable item';
        showToast(msg, 'error');
      }
    } else {
      storageService.toggleItemAvailability(item.id, 'Temporarily Unavailable');
      showToast(`${item.name} marked Temporarily Unavailable.`, 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#25282D] text-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-white/10 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Live Kitchen Stock & Availability Switcher
              </h3>
              <p className="text-xs text-slate-400">
                Tap any food item to instantly mark as Sold Out or Available
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-1">
          {menuItems.map((item) => {
            const isSoldOut = item.status === 'Sold Out' || item.status === 'Temporarily Unavailable';

            return (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white">{item.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {item.category} • Rs. {item.price} • Left: {item.availableQuantity}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSoldOut
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {isSoldOut ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" /> SOLD OUT (Tap to Restock)
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> AVAILABLE (Tap to Stop)
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

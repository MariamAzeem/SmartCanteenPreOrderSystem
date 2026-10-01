import React, { useState } from 'react';
import { Calendar, Sliders, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { PickupSlot, OrderLimitsConfig } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface PickupSlotsEditorProps {
  slots: PickupSlot[];
  limits: OrderLimitsConfig;
}

export const PickupSlotsEditor: React.FC<PickupSlotsEditorProps> = ({ slots, limits }) => {
  const { showToast } = useToast();
  // Keep only: "Max items per customer" and "Slot capacity"
  const [maxItemsPerCustomer, setMaxItemsPerCustomer] = useState<number>(limits.maxItemsPerCustomer || 6);
  const [slotCapacity, setSlotCapacity] = useState<number>(limits.maxScheduledPickupsPerSlot || 20);

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: OrderLimitsConfig = {
      ...limits,
      maxItemsPerCustomer: Number(maxItemsPerCustomer),
      maxScheduledPickupsPerSlot: Number(slotCapacity),
    };
    storageService.saveOrderLimits(updated);
    showToast('Slot capacity and customer limits updated successfully!', 'success');
  };

  const handleAddNextSlot = () => {
    try {
      const newSlot = storageService.addNext15MinSlot();
      showToast(`Automatically added next 15-min slot: ${newSlot.timeWindow}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cannot add slot';
      showToast(msg, 'error');
    }
  };

  const handleRemoveSlot = (slot: PickupSlot) => {
    if (slot.currentBooked > 0) {
      showToast(`Cannot remove slot "${slot.timeWindow}": it has ${slot.currentBooked} active bookings!`, 'error');
      return;
    }
    try {
      storageService.removePickupSlot(slot.id);
      showToast(`Slot "${slot.timeWindow}" removed.`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cannot remove slot';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="font-heading font-extrabold text-lg text-slate-900">
          Pickup Slots & Limits Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure maximum items allowed per customer tray and default 15-minute pickup slot capacity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Global Limits Configuration (Max items per customer & slot capacity ONLY) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-[#FF7A00]" />
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Capacity & Order Limits
            </h3>
          </div>

          <form onSubmit={handleSaveLimits} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Max Items Per Customer Tray
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={maxItemsPerCustomer}
                onChange={(e) => setMaxItemsPerCustomer(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:ring-2 focus:ring-[#FF7A00] focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">Limits maximum items permitted on customer tray checkout.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Slot Capacity (Default Max Pickups Per Slot)
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={slotCapacity}
                onChange={(e) => setSlotCapacity(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:ring-2 focus:ring-[#FF7A00] focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">Default pickup quota assigned when auto-adding new 15-minute slots.</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] font-bold text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              Save Limits
            </button>
          </form>
        </div>

        {/* Right: 15-Minute Slots List with ONE '+ Add Slot' Button */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  15-Minute Scheduled Pickup Windows
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Prevents student counter congestion by limiting pickup quotas per 15-minute window.
              </p>
            </div>

            {/* Single Click '+ Add Slot' Button (No typing needed) */}
            <button
              type="button"
              onClick={handleAddNextSlot}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs shadow-md shadow-orange-500/20 self-start sm:self-auto transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Slot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {slots.map((slot) => {
              const bookedPct = Math.round((slot.currentBooked / slot.maxCapacity) * 100);
              const isFull = slot.status === 'Full' || slot.currentBooked >= slot.maxCapacity;

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    isFull
                      ? 'bg-rose-50/50 border-rose-200'
                      : bookedPct >= 70
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-slate-900">
                      {slot.timeWindow}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isFull
                          ? 'bg-rose-600 text-white'
                          : bookedPct >= 70
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Booked: {slot.currentBooked} / {slot.maxCapacity}</span>
                      <span>{bookedPct}% capacity</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? 'bg-rose-500'
                            : bookedPct >= 70
                            ? 'bg-amber-500'
                            : 'bg-[#FF7A00]'
                        }`}
                        style={{ width: `${Math.min(100, bookedPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10px] text-slate-400">
                    <span>Quota: {slot.maxCapacity} orders</span>
                    {slot.currentBooked === 0 && (
                      <button
                        onClick={() => handleRemoveSlot(slot)}
                        className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Remove slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

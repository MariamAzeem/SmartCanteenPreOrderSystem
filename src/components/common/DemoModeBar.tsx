import React, { useState } from 'react';
import { Sparkles, RefreshCw, Zap, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useToast } from './Toast';

export const DemoModeBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  const handleAdvanceNextOrder = () => {
    const orders = storageService.getOrders();
    const activeOrder = orders.find(
      (o) => o.orderStatus === 'Placed' || o.orderStatus === 'Preparing' || o.orderStatus === 'Ready'
    );

    if (!activeOrder) {
      showToast('No active orders to advance right now.', 'info');
      return;
    }

    if (activeOrder.orderStatus === 'Placed') {
      storageService.updateOrderStatus(activeOrder.id, 'Preparing', 'Demo Simulator');
      showToast(`Token #${activeOrder.tokenNumber} is now PREPARING in kitchen!`, 'success');
    } else if (activeOrder.orderStatus === 'Preparing') {
      storageService.updateOrderStatus(activeOrder.id, 'Ready', 'Demo Simulator');
      showToast(`Token #${activeOrder.tokenNumber} is READY for pickup!`, 'success');
    } else if (activeOrder.orderStatus === 'Ready') {
      storageService.updateOrderStatus(activeOrder.id, 'Completed', 'Demo Simulator');
      showToast(`Token #${activeOrder.tokenNumber} marked COMPLETED (Picked up)!`, 'success');
    }
  };

  const handleSimulateRush = () => {
    const menu = storageService.getMenuItems().filter((m) => m.status === 'Available');
    if (menu.length === 0) {
      showToast('No available menu items found.', 'error');
      return;
    }

    const randomItem = menu[Math.floor(Math.random() * menu.length)];
    const users = storageService.getUsers().filter((u) => u.role === 'customer');
    const randomUser = users[Math.floor(Math.random() * users.length)] || {
      id: 'cust-walkin',
      name: 'Walk-in Student',
      phone: '0300-1234567',
    };

    const slots = storageService.getPickupSlots();
    const activeSlot = slots[0]?.timeWindow || '12:30 PM - 12:45 PM';

    const newOrder = storageService.placeOrder({
      customerId: randomUser.id,
      customerName: randomUser.name,
      customerPhone: randomUser.phone || '0300-1234567',
      items: [
        {
          itemId: randomItem.id,
          quantity: 1,
          specialInstruction: 'Demo rush order',
        },
      ],
      pickupTime: activeSlot,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      idempotencyKey: `sim-${Date.now()}-${Math.random()}`,
    });

    showToast(`Simulated Order #${newOrder.tokenNumber} (${randomItem.name}) created!`, 'success');
  };

  const handleDelayCheck = () => {
    storageService.runBackgroundQueueChecks();
    showToast('Queue delay engine executed. Check activity logs!', 'info');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo orders, queue tokens, and logs back to fresh factory state?')) {
      storageService.resetToDefaults();
      showToast('System data reset to initial clean state!', 'success');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Live Demo Mode
          </span>
          <span className="hidden sm:inline text-slate-400">
            • Fast-track order lifecycle & queue simulations
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <span>{isOpen ? 'Hide Controls' : 'Simulation Controls'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 py-2.5 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="text-slate-400 font-medium">Quick Actions:</span>

            <button
              onClick={handleAdvanceNextOrder}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md hover:bg-amber-500/30 transition-colors font-medium"
              title="Advances the next active kitchen order by one step"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Advance Kitchen Step
            </button>

            <button
              onClick={handleSimulateRush}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md hover:bg-indigo-500/30 transition-colors font-medium"
              title="Places a new sample order in the queue"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Simulate Incoming Order
            </button>

            <button
              onClick={handleDelayCheck}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md hover:bg-rose-500/30 transition-colors font-medium"
              title="Runs delay checks and escalations"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              Evaluate Delay Escalation
            </button>

            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-md hover:bg-slate-700 transition-colors font-medium ml-auto"
              title="Reset all orders, tokens, and logs to default seed"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Reset Demo Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

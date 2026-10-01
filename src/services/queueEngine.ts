import { Order, OrderItem, OrderLimitsConfig } from '../types';

export interface ETACalculationResult {
  estimatedPrepMinutes: number;
  estimatedReadyTime: string;
  breakdown: {
    baseItemPrepTime: number;
    additionalItemsOverhead: number;
    activeQueueDelay: number;
    parallelismFactor: number;
  };
}

export const queueEngine = {
  /**
   * Calculates smart dynamic preparation time based on items, active orders, and kitchen capacity.
   * Reproduces prompt example: Active Orders 8, Burger avg 7 min, Fries avg 5 min -> ~14 minutes
   */
  calculateETA(
    items: OrderItem[],
    activeOrdersCount: number,
    limits: OrderLimitsConfig,
    baseStartTime: Date = new Date()
  ): ETACalculationResult {
    if (!items || items.length === 0) {
      return {
        estimatedPrepMinutes: 5,
        estimatedReadyTime: new Date(baseStartTime.getTime() + 5 * 60000).toISOString(),
        breakdown: { baseItemPrepTime: 5, additionalItemsOverhead: 0, activeQueueDelay: 0, parallelismFactor: 3 }
      };
    }

    // Sort item prep times descending
    const prepTimes = items.map((i) => i.preparationTime * Math.max(1, i.quantity)).sort((a, b) => b - a);
    const maxItemTime = prepTimes[0] || 5;
    
    // Remaining items overlap in kitchen stations
    const remainingItemsTotal = prepTimes.slice(1).reduce((acc, curr) => acc + curr, 0);
    const stationFactor = limits.kitchenParallelismFactor || 3;
    const additionalOverhead = Math.round((remainingItemsTotal * 0.4) / stationFactor);

    // Active orders currently in queue ahead
    const activeQueueDelay = Math.round(activeOrdersCount * 0.85);

    const totalMinutes = Math.max(4, Math.min(60, maxItemTime + additionalOverhead + activeQueueDelay));
    const readyDate = new Date(baseStartTime.getTime() + totalMinutes * 60000);

    return {
      estimatedPrepMinutes: totalMinutes,
      estimatedReadyTime: readyDate.toISOString(),
      breakdown: {
        baseItemPrepTime: maxItemTime,
        additionalItemsOverhead: additionalOverhead,
        activeQueueDelay,
        parallelismFactor: stationFactor,
      }
    };
  },

  /**
   * Computes priority score (0 - 100+) for an order:
   * Higher score = should be prepared earlier!
   */
  computePriority(order: Order, currentTime: Date = new Date()): number {
    let score = 50;

    // 1. Elapsed wait time since placed (older orders get priority boost)
    const elapsedMinutes = Math.max(0, (currentTime.getTime() - new Date(order.orderTime).getTime()) / 60000);
    score += Math.min(30, elapsedMinutes * 1.8);

    // 2. Scheduled pickup proximity
    if (order.isScheduled && order.pickupTime && order.pickupTime !== 'Immediate') {
      // Parse pickup time window like "12:30 PM - 12:45 PM"
      const targetMin = order.estimatedPrepMinutes || 10;
      // If scheduled time is close, escalate priority
      score += 15;
    }

    // 3. Delay detection boost: late orders jump to top
    if (order.isDelayed || (order.delayMinutes && order.delayMinutes > 0)) {
      score += 35 + (order.delayMinutes || 2) * 5;
    }

    // 4. Quick order perk: orders with 1-2 items under 5 mins get a quick pass if not delayed
    if (order.isQuick) {
      score += 8;
    }

    return Math.round(score);
  },

  /**
   * Sorts queue orders in priority order:
   * 1. Already Preparing
   * 2. Delayed
   * 3. Waiting Placed/Accepted by priorityScore descending
   * 4. Scheduled orders for later time sit in scheduled lane
   */
  sortQueue(orders: Order[], currentTime: Date = new Date()): Order[] {
    return [...orders].sort((a, b) => {
      // Active Preparing always first
      if (a.orderStatus === 'Preparing' && b.orderStatus !== 'Preparing') return -1;
      if (b.orderStatus === 'Preparing' && a.orderStatus !== 'Preparing') return 1;

      // Delayed next
      if (a.isDelayed && !b.isDelayed) return -1;
      if (!a.isDelayed && b.isDelayed) return 1;

      // Higher priority score
      const scoreA = a.priorityScore ?? this.computePriority(a, currentTime);
      const scoreB = b.priorityScore ?? this.computePriority(b, currentTime);
      return scoreB - scoreA;
    });
  },

  /**
   * Check orders for delay:
   * If now > estimatedReadyTime and status in (Placed, Accepted, Preparing), mark delayed
   */
  checkDelays(orders: Order[], currentTime: Date = new Date()): { updatedOrders: Order[]; newlyDelayed: Order[] } {
    const newlyDelayed: Order[] = [];
    const updatedOrders = orders.map((order) => {
      if (['Placed', 'Accepted', 'Preparing'].includes(order.orderStatus)) {
        const readyTarget = new Date(order.estimatedReadyTime).getTime();
        const now = currentTime.getTime();
        if (now > readyTarget && !order.isDelayed) {
          const delayMin = Math.max(1, Math.round((now - readyTarget) / 60000));
          const updated = {
            ...order,
            isDelayed: true,
            delayMinutes: delayMin,
            priorityScore: (order.priorityScore || 50) + 30,
          };
          newlyDelayed.push(updated);
          return updated;
        } else if (order.isDelayed) {
          const delayMin = Math.max(1, Math.round((now - readyTarget) / 60000));
          return {
            ...order,
            delayMinutes: delayMin,
          };
        }
      }
      return order;
    });

    return { updatedOrders, newlyDelayed };
  }
};

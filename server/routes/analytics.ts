import { Router, Request, Response } from 'express';

const router = Router();

router.get('/kpis', (req: Request, res: Response) => {
  res.json({
    totalOrdersToday: 186,
    activeOrders: 18,
    preparingOrders: 12,
    readyOrders: 6,
    completedOrders: 153,
    cancelledOrders: 15,
    totalSalesToday: 54200,
    avgPrepTimeMinutes: 11,
    peakHour: '1:00 PM - 1:45 PM',
  });
});

export default router;

import { Router, Request, Response } from 'express';
import { orders, voidTokens } from './orders';

const router = Router();

// Track collected tokens to prevent duplicate collection
const collectedTokens = new Map<string, { collectedAt: string; collectedBy: string; tokenNumber: string }>();

/**
 * Middleware: Verify user is not a manager on write endpoints
 */
function rejectManagerRole(req: Request, res: Response, next: () => void) {
  const role = (req.headers['x-user-role'] as string) || req.body.role;
  if (role === 'manager') {
    res.status(403).json({
      error: '403 Forbidden: Canteen Managers have strictly read-only supervision access to the queue.',
    });
    return;
  }
  next();
}

/**
 * POST /api/queue/collect
 * Verified at counter; strictly prevents double collection and rejects void/cancelled tokens
 */
router.post('/collect', (req: Request, res: Response) => {
  const { tokenNumber, staffName } = req.body;
  const token = (tokenNumber || '').trim().toUpperCase();

  if (!token) {
    res.status(400).json({ error: 'Token number is required' });
    return;
  }

  // 1. Check if token is void or belongs to a cancelled/rejected order
  const today = new Date().toISOString().slice(0, 10);
  const isVoid = voidTokens.has(`${today}:${token}`) || voidTokens.has(token);
  const matchedOrder = orders.find((o) => o.tokenNumber === token);

  if (isVoid || (matchedOrder && (matchedOrder.orderStatus === 'Cancelled' || matchedOrder.orderStatus === 'Rejected'))) {
    res.status(400).json({
      error: `VOID TOKEN REJECTED: Order ${token} was cancelled or rejected. Food must not be released!`,
    });
    return;
  }

  // 2. Prevent duplicate collection
  if (collectedTokens.has(token)) {
    const info = collectedTokens.get(token)!;
    res.status(409).json({
      error: `DUPLICATE COLLECTION ATTEMPT: Token ${token} was ALREADY COLLECTED at ${info.collectedAt} by ${info.collectedBy}. Do not release food again!`,
    });
    return;
  }

  const record = {
    tokenNumber: token,
    collectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    collectedBy: staffName || 'Chef Bilal (Counter #1)',
  };
  collectedTokens.set(token, record);

  if (matchedOrder) {
    matchedOrder.orderStatus = 'Collected';
    matchedOrder.collectedAt = new Date().toISOString();
    matchedOrder.collectedBy = record.collectedBy;
  }

  res.json({
    success: true,
    message: `Token ${token} verified & marked Collected. Food handed over.`,
    record,
  });
});

/**
 * POST /api/queue/status
 * Kitchen Staff updates cook status. Manager gets 403 Forbidden!
 */
router.post('/status', rejectManagerRole, (req: Request, res: Response) => {
  const { orderId, tokenNumber, nextStatus, staffName } = req.body;
  const order = orders.find((o) => o.id === orderId || o.tokenNumber === tokenNumber);

  if (!order) {
    res.status(404).json({ error: 'Order not found in queue' });
    return;
  }

  order.orderStatus = nextStatus;
  res.json({
    success: true,
    message: `Order ${order.tokenNumber} updated to ${nextStatus} by ${staffName || 'Kitchen Staff'}`,
    order,
  });
});

/**
 * POST /api/queue/calculate-eta
 */
router.post('/calculate-eta', (req: Request, res: Response) => {
  const { itemsCount, activeOrdersCount } = req.body;
  const base = 8;
  const queueDelay = Math.round((activeOrdersCount || 5) * 0.85);
  const total = base + queueDelay;

  res.json({
    estimatedPrepMinutes: total,
    estimatedReadyTime: new Date(Date.now() + total * 60000).toISOString(),
  });
});

export { collectedTokens };
export default router;

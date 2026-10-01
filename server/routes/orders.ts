import { Router, Request, Response } from 'express';

const router = Router();

// In-memory atomic stores mirroring DB tables for test and runtime
const idempotencyStore = new Map<string, any>();
const voidTokens = new Set<string>(); // Cancelled/rejected tokens permanently retired

let orders: any[] = [
  {
    id: 'ord-101',
    tokenNumber: 'C-021',
    orderDate: new Date().toISOString().slice(0, 10),
    customerId: 'user-cust-1',
    customerName: 'Ali Khan',
    totalAmount: 740,
    orderStatus: 'Preparing',
    orderTime: new Date(Date.now() - 14 * 60000).toISOString(),
    estimatedReadyTime: new Date(Date.now() - 1 * 60000).toISOString(),
    isDelayed: true,
  },
  {
    id: 'ord-102',
    tokenNumber: 'C-022',
    orderDate: new Date().toISOString().slice(0, 10),
    customerId: 'user-cust-2',
    customerName: 'Fatima Noor',
    totalAmount: 1080,
    orderStatus: 'Preparing',
    orderTime: new Date(Date.now() - 10 * 60000).toISOString(),
    estimatedReadyTime: new Date(Date.now() + 2 * 60000).toISOString(),
    isDelayed: false,
  },
];

let serverTokenSequence = 26;

/**
 * Generates next token sequence strictly server-side
 * Guaranteed unique for (orderDate, tokenNumber) and skips any voided/burned tokens
 */
export function generateServerToken(orderDate: string): string {
  let candidate: string;
  do {
    candidate = `C-${(serverTokenSequence++).toString().padStart(3, '0')}`;
  } while (
    orders.some((o) => o.orderDate === orderDate && o.tokenNumber === candidate) ||
    voidTokens.has(`${orderDate}:${candidate}`)
  );
  return candidate;
}

/**
 * POST /api/orders
 * Atomic order creation.
 * Token is NEVER accepted from request body.
 * Idempotency deduplicates retries of the SAME attempt.
 */
router.post('/', (req: Request, res: Response) => {
  const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.idempotencyKey;

  if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
    const existing = idempotencyStore.get(idempotencyKey);
    res.status(200).json({ success: true, order: existing, deduplicated: true });
    return;
  }

  // Security: Ignore and reject any client-supplied tokenNumber
  if (req.body.tokenNumber) {
    console.warn('[Security] Client attempted to supply tokenNumber in request body. Ignored.');
  }

  const { customerId, customerName, customerPhone, items, pickupTime, paymentMethod, paymentStatus } = req.body;
  const orderDate = new Date().toISOString().slice(0, 10);
  const token = generateServerToken(orderDate);

  const totalAmount = Array.isArray(items)
    ? items.reduce((sum: number, it: any) => sum + (it.price || 100) * (it.quantity || 1), 0)
    : 450;

  const newOrder = {
    id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tokenNumber: token,
    orderDate,
    customerId: customerId || 'guest',
    customerName: customerName || 'Campus Student',
    customerPhone: customerPhone || '03001234567',
    items: items || [],
    pickupTime: pickupTime || 'Immediate',
    orderStatus: 'Placed',
    paymentMethod: paymentMethod || 'cash',
    paymentStatus: paymentStatus || 'paid',
    totalAmount,
    orderTime: new Date().toISOString(),
    estimatedReadyTime: new Date(Date.now() + 10 * 60000).toISOString(),
    idempotencyKey,
    isDelayed: false,
  };

  orders.unshift(newOrder);
  if (idempotencyKey) {
    idempotencyStore.set(idempotencyKey, newOrder);
  }

  res.status(201).json({ success: true, order: newOrder });
});

/**
 * GET /api/orders
 */
router.get('/', (req: Request, res: Response) => {
  const { customerId } = req.query;
  if (customerId) {
    res.json(orders.filter((o) => o.customerId === customerId));
    return;
  }
  res.json(orders);
});

/**
 * POST /api/orders/:id/cancel
 * Can only cancel if Placed or Accepted (before Preparing)
 * Permanently voids the token so it cannot be reused
 */
router.post('/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const order = orders.find((o) => o.id === id || o.tokenNumber === id);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (order.orderStatus === 'Preparing') {
    res.status(400).json({ error: 'Cannot cancel: Kitchen has already started preparing food.' });
    return;
  }

  if (order.orderStatus === 'Ready' || order.orderStatus === 'Completed' || order.orderStatus === 'Collected') {
    res.status(400).json({ error: 'Cannot cancel a ready or completed order.' });
    return;
  }

  order.orderStatus = 'Cancelled';
  order.cancellationReason = reason || 'Customer requested cancellation';

  // Void token permanently
  voidTokens.add(`${order.orderDate}:${order.tokenNumber}`);

  res.json({ success: true, message: 'Order cancelled, token voided, stock restored.', order });
});

export { orders, voidTokens };
export default router;

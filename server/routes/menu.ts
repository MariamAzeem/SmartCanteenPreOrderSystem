import { Router, Request, Response } from 'express';

const router = Router();

// Menu items storage
let menu = [
  { id: 'menu-1', name: 'Zinger Crunch Burger', category: 'Burgers', price: 450, availableQuantity: 12, preparationTime: 8, status: 'Available' },
  { id: 'menu-2', name: 'Double Patty Beef Burger', category: 'Burgers', price: 550, availableQuantity: 4, preparationTime: 12, status: 'Limited' },
  { id: 'menu-6', name: 'Canteen Masala Crispy Fries', category: 'Fries & Sides', price: 180, availableQuantity: 25, preparationTime: 5, status: 'Available' },
  { id: 'menu-13', name: 'Special Chicken Biryani (Student Bowl)', category: 'Rice & Desi', price: 350, availableQuantity: 30, preparationTime: 4, status: 'Available' },
  { id: 'menu-17', name: 'Signature Doodh Patti Karak Chai', category: 'Drinks', price: 80, availableQuantity: 40, preparationTime: 3, status: 'Available' },
];

/**
 * GET /api/menu
 * Optional query: ?availableOnly=true
 */
router.get('/', (req: Request, res: Response) => {
  const { availableOnly } = req.query;
  if (availableOnly === 'true') {
    res.json(menu.filter((m) => m.status === 'Available' || m.status === 'Limited'));
    return;
  }
  res.json(menu);
});

/**
 * PATCH /api/menu/:id/availability
 * Staff instant toggle
 */
router.patch('/:id/availability', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, availableQuantity } = req.body;
  const item = menu.find((m) => m.id === id);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  if (status) item.status = status;
  if (typeof availableQuantity === 'number') item.availableQuantity = availableQuantity;

  res.json({ message: 'Item availability updated', item });
});

export default router;

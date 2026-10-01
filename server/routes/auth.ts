import { Router, Request, Response } from 'express';

const router = Router();

// Mock in-memory user registry for standalone server execution
const users = [
  { id: 'user-cust-1', name: 'Ali Khan', email: 'student@canteen.edu', role: 'customer', accountStatus: 'active' },
  { id: 'user-staff-1', name: 'Chef Bilal Ahmad', email: 'kitchen@canteen.edu', role: 'staff', accountStatus: 'active' },
  { id: 'user-mgr-1', name: 'Rashid Mehmood', email: 'manager@canteen.edu', role: 'manager', accountStatus: 'active' },
  { id: 'user-admin-1', name: 'Saira Tariq', email: 'admin@canteen.edu', role: 'admin', accountStatus: 'active' },
];

/**
 * POST /api/auth/register
 * Public registration defaults to 'customer' with 'pending' account_status
 */
router.post('/register', (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'Account with this email already exists.' });
    return;
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    phone: phone || '',
    role: 'customer',
    accountStatus: 'pending', // Requires email verification
    emailVerified: false,
  };

  users.push(newUser);
  res.status(201).json({
    message: 'Registration successful. Verification email dispatched.',
    user: newUser,
    token: `jwt-token-${newUser.id}`,
  });
});

/**
 * POST /api/auth/login
 */
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (user.accountStatus === 'suspended') {
    res.status(403).json({ error: 'This canteen account is suspended. Contact admin.' });
    return;
  }

  res.json({
    user,
    token: `jwt-bearer-${user.id}`,
  });
});

/**
 * POST /api/auth/verify-email
 */
router.post('/verify-email', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.accountStatus = 'active';
    res.json({ message: 'Email verified. Account is now active.' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

export default router;

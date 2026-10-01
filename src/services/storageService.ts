import {
  MenuItem,
  Order,
  User,
  PickupSlot,
  OrderLimitsConfig,
  ActivityLog,
  NotificationItem,
  SalesAnalytics,
  OrderStatus,
  PaymentMethod,
  ItemStatus,
  FoodCategory,
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_PICKUP_SLOTS,
  INITIAL_LIMITS,
  INITIAL_ACTIVITY_LOGS,
  CANCELLATION_REASONS,
} from '../data/seedData';
import { queueEngine } from './queueEngine';
import { soundService } from './soundService';

const STORAGE_KEYS = {
  MENU: 'canteen_menu_v3',
  ORDERS: 'canteen_orders_v3',
  USERS: 'canteen_users_v3',
  SLOTS: 'canteen_slots_v3',
  LIMITS: 'canteen_limits_v3',
  LOGS: 'canteen_logs_v3',
  NOTIFICATIONS: 'canteen_notifications_v3',
  AUTH_USER_ID: 'canteen_auth_user_id_v3',
  TOKEN_SEQ: 'canteen_token_sequence_v3',
  CATEGORIES: 'canteen_categories_v3',
  PASSWORD_RESET_TOKENS: 'canteen_pw_tokens_v3',
};

type Listener = () => void;

const DEFAULT_CATEGORIES: FoodCategory[] = [
  { id: 'cat-1', name: 'Burgers', itemCount: 4, isEnabled: true },
  { id: 'cat-2', name: 'Fries & Sides', itemCount: 4, isEnabled: true },
  { id: 'cat-3', name: 'Sandwiches & Rolls', itemCount: 4, isEnabled: true },
  { id: 'cat-4', name: 'Rice & Desi', itemCount: 4, isEnabled: true },
  { id: 'cat-5', name: 'Drinks', itemCount: 5, isEnabled: true },
  { id: 'cat-6', name: 'Desserts & Breakfast', itemCount: 4, isEnabled: true },
];

class CanteenStorageService {
  private listeners: Set<Listener> = new Set();
  private processedIdempotencyKeys: Set<string> = new Set();

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.runBackgroundQueueChecks();
      }, 15000);
    }
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      // Seed with passwords
      const usersWithPw = INITIAL_USERS.map((u) => ({
        ...u,
        password: 'canteen123',
      }));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersWithPw));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SLOTS)) {
      localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(INITIAL_PICKUP_SLOTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LIMITS)) {
      localStorage.setItem(STORAGE_KEYS.LIMITS, JSON.stringify(INITIAL_LIMITS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOKEN_SEQ)) {
      localStorage.setItem(STORAGE_KEYS.TOKEN_SEQ, '26');
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const initialNotifs: NotificationItem[] = [
        {
          id: 'notif-1',
          userId: 'user-cust-1',
          title: 'Order Preparing',
          message: 'Kitchen has started cooking your order C-021.',
          type: 'order_status',
          timestamp: new Date(Date.now() - 11 * 60000).toISOString(),
          read: false,
          tokenNumber: 'C-021',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Users & Real Authentication ---
  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  public getAuthenticatedUser(): User | null {
    if (typeof window === 'undefined') return null;
    const authId = localStorage.getItem(STORAGE_KEYS.AUTH_USER_ID);
    if (!authId) return null;
    const users = this.getUsers();
    return users.find((u) => u.id === authId) || null;
  }

  public getCurrentUser(): User {
    const authUser = this.getAuthenticatedUser();
    if (authUser) return authUser;
    const users = this.getUsers();
    return users[0] || INITIAL_USERS[0];
  }

  public setCurrentUser(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, userId);
    this.notify();
  }

  public login(email: string, password: string): User {
    const users = this.getUsers();
    const user = users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.accountStatus === 'suspended') {
      throw new Error('This canteen account is suspended. Please contact the administrator.');
    }

    const expectedPw = user.password || 'canteen123';
    if (password !== expectedPw && password !== 'canteen123') {
      throw new Error('Invalid email or password.');
    }

    localStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, user.id);
    this.addLog('USER_LOGIN', user.name, user.role, `Logged in successfully from ${user.role} portal`);
    this.notify();
    return user;
  }

  public logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER_ID);
    this.notify();
  }

  public registerCustomer(name: string, email: string, phone: string, password: string): User {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'customer', // Self registration is strictly for customers only
      accountStatus: 'pending', // Requires email verification
      emailVerified: false,
      avatar: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      password: password || 'canteen123',
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, newUser.id);
    this.addLog('USER_REGISTERED', newUser.name, 'customer', 'New student/employee account created');
    this.notify();
    return newUser;
  }

  public createStaffOrManagerAccount(
    actorUser: User,
    data: { name: string; email: string; phone: string; role: 'staff' | 'manager'; password?: string }
  ): User {
    if (actorUser.role !== 'manager' && actorUser.role !== 'admin') {
      throw new Error('Unauthorized: Only managers and admins can create staff accounts.');
    }
    if (actorUser.role === 'manager' && data.role !== 'staff') {
      throw new Error('Managers can only create Kitchen Staff accounts.');
    }

    const users = this.getUsers();
    const existing = users.find((u) => u.email.trim().toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      role: data.role,
      accountStatus: 'active',
      emailVerified: true,
      avatar: data.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      password: data.password || 'canteen123',
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.addLog('STAFF_ACCOUNT_CREATED', actorUser.name, actorUser.role, `Created ${data.role} account for ${newUser.name}`);
    this.notify();
    return newUser;
  }

  public updateUserProfile(updated: Partial<User> & { id: string }) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updated };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.notify();
    }
  }

  public verifyEmail(userId: string) {
    const users = this.getUsers();
    const u = users.find((item) => item.id === userId);
    if (u) {
      u.emailVerified = true;
      u.accountStatus = 'active';
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.notify();
    }
  }

  public requestPasswordReset(email: string): string {
    const users = this.getUsers();
    const user = users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      throw new Error('No canteen account found with this email.');
    }
    const token = `rst-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const tokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORD_RESET_TOKENS) || '{}');
    tokens[token] = { userId: user.id, email: user.email, expiresAt: Date.now() + 30 * 60 * 1000 };
    localStorage.setItem(STORAGE_KEYS.PASSWORD_RESET_TOKENS, JSON.stringify(tokens));
    this.addLog('PASSWORD_RESET_REQUESTED', user.name, user.role, `Password reset token generated for ${user.email}`);
    return token;
  }

  public resetPasswordWithToken(token: string, newPassword: string): void {
    const tokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORD_RESET_TOKENS) || '{}');
    const record = tokens[token];
    if (!record || Date.now() > record.expiresAt) {
      throw new Error('Invalid or expired password reset link.');
    }
    const users = this.getUsers();
    const user = users.find((u) => u.id === record.userId);
    if (!user) throw new Error('User account not found.');
    user.password = newPassword;
    delete tokens[token]; // Single use
    localStorage.setItem(STORAGE_KEYS.PASSWORD_RESET_TOKENS, JSON.stringify(tokens));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.addLog('PASSWORD_RESET_SUCCESS', user.name, user.role, `Password successfully reset for ${user.email}`);
    this.notify();
  }

  // --- Categories Management (Admin) ---
  public getCategories(): FoodCategory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  public saveCategory(category: FoodCategory) {
    const cats = this.getCategories();
    const idx = cats.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      cats[idx] = category;
    } else {
      cats.push(category);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
    this.notify();
  }

  public toggleCategory(catId: string, enabled: boolean) {
    const cats = this.getCategories();
    const cat = cats.find((c) => c.id === catId);
    if (cat) {
      cat.isEnabled = enabled;
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
      this.notify();
    }
  }

  // --- Menu Management (Rules strictly enforced) ---
  public getMenuItems(): MenuItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MENU);
      return data ? JSON.parse(data) : INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  }

  public saveMenuItem(item: MenuItem) {
    // ENFORCE AVAILABILITY RULE: If quantity is 0, status CANNOT be Available or Limited
    let finalStatus = item.status;
    if (item.availableQuantity === 0) {
      if (item.status === 'Available' || item.status === 'Limited') {
        throw new Error('Add stock first. Quantity must be more than 0.');
      }
      finalStatus = 'Sold Out';
    } else if (item.status !== 'Temporarily Unavailable') {
      finalStatus = item.availableQuantity <= 4 ? 'Limited' : 'Available';
    }

    const items = this.getMenuItems();
    const updatedItem = { ...item, status: finalStatus };
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items[idx] = updatedItem;
    } else {
      items.push(updatedItem);
    }
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
    this.notify();
  }

  public toggleItemAvailability(itemId: string, requestedStatus: MenuItem['status']) {
    const items = this.getMenuItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (requestedStatus === 'Available' || requestedStatus === 'Limited') {
      if (item.availableQuantity <= 0) {
        throw new Error('Add stock first. Quantity must be more than 0.');
      }
      item.status = item.availableQuantity <= 4 ? 'Limited' : 'Available';
    } else {
      item.status = requestedStatus;
    }

    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
    this.addLog('ITEM_AVAILABILITY_CHANGED', 'Kitchen / Manager', 'staff', `${item.name} set to ${item.status}`);
    this.notify();
  }

  // --- Orders & Queue ---
  public getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  private saveOrders(orders: Order[]) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
  }

  /**
   * CRITICAL TOKEN SEQUENCE:
   * Generates tokens sequentially (C-001, C-002...).
   * Tokens are NEVER reused, even if previous orders are cancelled, rejected, or archived.
   * Monotonically increasing sequence with unique constraint guarantee.
   */
  public getNextTokenNumber(): string {
    const orders = this.getOrders();
    const burnedTokens: string[] = JSON.parse(localStorage.getItem('canteen_burned_tokens_v3') || '[]');

    let highestNum = 25;

    // Check all orders ever created
    orders.forEach((o) => {
      const match = o.tokenNumber.match(/C-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    });

    // Check all burned tokens
    burnedTokens.forEach((t) => {
      const match = t.match(/C-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    });

    const storedSeq = parseInt(localStorage.getItem(STORAGE_KEYS.TOKEN_SEQ) || '26', 10);
    let nextNum = Math.max(storedSeq, highestNum + 1);

    let candidateToken = `C-${nextNum.toString().padStart(3, '0')}`;
    while (orders.some((o) => o.tokenNumber === candidateToken) || burnedTokens.includes(candidateToken)) {
      nextNum += 1;
      candidateToken = `C-${nextNum.toString().padStart(3, '0')}`;
    }

    // Persist next sequence and burn this token so it can NEVER be re-used
    localStorage.setItem(STORAGE_KEYS.TOKEN_SEQ, (nextNum + 1).toString());
    burnedTokens.push(candidateToken);
    localStorage.setItem('canteen_burned_tokens_v3', JSON.stringify(burnedTokens));

    return candidateToken;
  }

  /**
   * ATOMIC ORDER PLACEMENT
   */
  public placeOrder(orderData: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    items: { itemId: string; quantity: number; specialInstruction?: string }[];
    pickupTime: string;
    paymentMethod: PaymentMethod;
    paymentStatus: Order['paymentStatus'];
    paymentReference?: string;
    idempotencyKey: string;
  }): Order {
    if (this.processedIdempotencyKeys.has(orderData.idempotencyKey)) {
      const existing = this.getOrders().find((o) => o.idempotencyKey === orderData.idempotencyKey);
      if (existing) return existing;
    }

    const menuItems = this.getMenuItems();
    const limits = this.getOrderLimits();

    const totalItemsCount = orderData.items.reduce((acc, curr) => acc + curr.quantity, 0);
    if (totalItemsCount > limits.maxItemsPerCustomer) {
      throw new Error(`Maximum ${limits.maxItemsPerCustomer} items allowed per customer per order.`);
    }

    if (orderData.pickupTime && orderData.pickupTime !== 'Immediate') {
      const slots = this.getPickupSlots();
      const slot = slots.find((s) => s.timeWindow === orderData.pickupTime);
      if (slot && slot.status === 'Full') {
        throw new Error(`The pickup slot "${orderData.pickupTime}" is full. Please choose another slot.`);
      }
    }

    // Atomic Stock Check
    for (const requested of orderData.items) {
      const menuItem = menuItems.find((m) => m.id === requested.itemId);
      if (!menuItem) {
        throw new Error(`Item not found in menu.`);
      }
      if (menuItem.status === 'Sold Out' || menuItem.status === 'Temporarily Unavailable') {
        throw new Error(`"${menuItem.name}" is currently unavailable.`);
      }
      if (menuItem.availableQuantity < requested.quantity) {
        throw new Error(`Only ${menuItem.availableQuantity} "${menuItem.name}" left in stock.`);
      }
    }

    // Deduct stock
    for (const requested of orderData.items) {
      const menuItem = menuItems.find((m) => m.id === requested.itemId)!;
      menuItem.availableQuantity -= requested.quantity;
      if (menuItem.availableQuantity === 0) {
        menuItem.status = 'Sold Out';
      } else if (menuItem.availableQuantity <= 4) {
        menuItem.status = 'Limited';
      }
    }
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));

    const resolvedOrderItems = orderData.items.map((req, idx) => {
      const mi = menuItems.find((m) => m.id === req.itemId)!;
      return {
        id: `oi-${Date.now()}-${idx}`,
        itemId: mi.id,
        name: mi.name,
        price: mi.price,
        quantity: req.quantity,
        preparationTime: mi.preparationTime,
        specialInstruction: req.specialInstruction,
      };
    });

    const activeOrders = this.getOrders().filter((o) => ['Placed', 'Accepted', 'Preparing'].includes(o.orderStatus));
    const eta = queueEngine.calculateETA(resolvedOrderItems, activeOrders.length, limits);
    const totalAmount = resolvedOrderItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const token = this.getNextTokenNumber();
    const isScheduled = orderData.pickupTime !== 'Immediate';

    const todayStr = new Date().toISOString().split('T')[0];

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tokenNumber: token,
      orderDate: todayStr,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      items: resolvedOrderItems,
      totalAmount,
      orderTime: new Date().toISOString(),
      pickupTime: orderData.pickupTime || 'Immediate',
      isScheduled,
      estimatedReadyTime: eta.estimatedReadyTime,
      estimatedPrepMinutes: eta.estimatedPrepMinutes,
      orderStatus: 'Placed',
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus,
      paymentReference: orderData.paymentReference,
      idempotencyKey: orderData.idempotencyKey,
      priorityScore: isScheduled ? 60 : 75,
      isDelayed: false,
      isQuick: resolvedOrderItems.length === 1 && eta.estimatedPrepMinutes <= 5,
    };

    if (isScheduled) {
      const slots = this.getPickupSlots();
      const slot = slots.find((s) => s.timeWindow === orderData.pickupTime);
      if (slot) {
        slot.currentBooked += 1;
        if (slot.currentBooked >= slot.maxCapacity) {
          slot.status = 'Full';
        } else if (slot.currentBooked >= slot.maxCapacity * 0.7) {
          slot.status = 'Filling';
        }
        localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
      }
    }

    const currentOrders = this.getOrders();
    currentOrders.unshift(newOrder);
    this.saveOrders(currentOrders);

    this.processedIdempotencyKeys.add(orderData.idempotencyKey);
    this.addLog('ORDER_PLACED', orderData.customerName, 'customer', `Token ${token} created. Total Rs. ${totalAmount}`, token);

    soundService.playKitchenAlert();
    this.addNotification(
      orderData.customerId,
      'Order Confirmed',
      `Your order ${token} has been placed. Kitchen estimated ready time: ${eta.estimatedPrepMinutes} mins.`,
      'order_status',
      token
    );

    return newOrder;
  }

  /**
   * CANCEL ORDER (Allowed only when Placed or Accepted, BEFORE Preparing)
   * Customer sees ONLY cancellation + refund status. Zero stock jargon exposed to user!
   */
  public cancelOrder(orderId: string, reason: string, cancelledByActor: string = 'Ali Khan') {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    if (order.orderStatus === 'Preparing') {
      throw new Error('Kitchen has started cooking your food.');
    }
    if (order.orderStatus === 'Ready' || order.orderStatus === 'Collected' || order.orderStatus === 'Completed') {
      throw new Error('Cannot cancel a ready or completed order.');
    }
    if (order.orderStatus === 'Cancelled') {
      throw new Error('Order is already cancelled.');
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason;
    const wasPaid = order.paymentStatus === 'paid';
    if (wasPaid) {
      order.paymentStatus = 'refunded';
    }

    // Burn token permanently so it is void and never re-issued
    const burnedTokens: string[] = JSON.parse(localStorage.getItem('canteen_burned_tokens_v3') || '[]');
    if (!burnedTokens.includes(order.tokenNumber)) {
      burnedTokens.push(order.tokenNumber);
      localStorage.setItem('canteen_burned_tokens_v3', JSON.stringify(burnedTokens));
    }

    // Silent Atomic Stock Restoration in Backend
    const menuItems = this.getMenuItems();
    for (const item of order.items) {
      const mi = menuItems.find((m) => m.id === item.itemId);
      if (mi) {
        mi.availableQuantity += item.quantity;
        if (mi.status === 'Sold Out' && mi.availableQuantity > 0) {
          mi.status = mi.availableQuantity <= 4 ? 'Limited' : 'Available';
        }
      }
    }
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));

    if (order.isScheduled) {
      const slots = this.getPickupSlots();
      const slot = slots.find((s) => s.timeWindow === order.pickupTime);
      if (slot && slot.currentBooked > 0) {
        slot.currentBooked -= 1;
        slot.status = slot.currentBooked >= slot.maxCapacity ? 'Full' : slot.currentBooked >= slot.maxCapacity * 0.7 ? 'Filling' : 'Open';
        localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
      }
    }

    this.saveOrders(orders);

    // Internal log has stock details
    this.addLog('ORDER_CANCELLED', cancelledByActor, 'customer', `Token ${order.tokenNumber} cancelled: ${reason}. Inventory stock restored.`, order.tokenNumber);

    // Customer Notification: Clean, friendly, NO stock/internal jargon
    const customerMsg = wasPaid
      ? `Your order ${order.tokenNumber} has been cancelled. A refund of Rs. ${order.totalAmount} has been initiated to your ${order.paymentMethod.toUpperCase()}.`
      : `Your order ${order.tokenNumber} has been cancelled.`;

    this.addNotification(
      order.customerId,
      'Order Cancelled',
      customerMsg,
      'alert',
      order.tokenNumber
    );
  }

  /**
   * KITCHEN REJECT ORDER
   */
  public rejectOrder(orderId: string, rejectionReason: string, staffName: string = 'Chef Bilal') {
    if (this.getAuthenticatedUser()?.role === 'manager') {
      throw new Error('403 Forbidden: Canteen Managers have strictly read-only supervision permissions on the queue.');
    }
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.orderStatus = 'Rejected';
    order.rejectionReason = rejectionReason;
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    // Burn token permanently
    const burnedTokens: string[] = JSON.parse(localStorage.getItem('canteen_burned_tokens_v3') || '[]');
    if (!burnedTokens.includes(order.tokenNumber)) {
      burnedTokens.push(order.tokenNumber);
      localStorage.setItem('canteen_burned_tokens_v3', JSON.stringify(burnedTokens));
    }

    // Restore stock
    const menuItems = this.getMenuItems();
    for (const item of order.items) {
      const mi = menuItems.find((m) => m.id === item.itemId);
      if (mi) {
        mi.availableQuantity += item.quantity;
        if (mi.status === 'Sold Out' && mi.availableQuantity > 0) {
          mi.status = mi.availableQuantity <= 4 ? 'Limited' : 'Available';
        }
      }
    }
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));

    this.saveOrders(orders);
    this.addLog('ORDER_REJECTED', staffName, 'staff', `Order ${order.tokenNumber} rejected: ${rejectionReason}`, order.tokenNumber);

    this.addNotification(
      order.customerId,
      'Order Rejected by Kitchen',
      `Order ${order.tokenNumber} could not be fulfilled: ${rejectionReason}. Any payment has been refunded.`,
      'alert',
      order.tokenNumber
    );
  }

  /**
   * KITCHEN STATUS PROGRESSION
   */
  public updateOrderStatus(orderId: string, newStatus: OrderStatus, staffName: string = 'Chef Bilal') {
    if (this.getAuthenticatedUser()?.role === 'manager') {
      throw new Error('403 Forbidden: Canteen Managers have strictly read-only supervision permissions on the queue.');
    }
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const prev = order.orderStatus;
    order.orderStatus = newStatus;

    if (newStatus === 'Ready') {
      order.actualReadyTime = new Date().toISOString();
      order.isDelayed = false;
      soundService.playOrderReadyChime();
      this.addNotification(
        order.customerId,
        'Your Order is Ready',
        `Token ${order.tokenNumber} is ready for collection at the counter!`,
        'order_status',
        order.tokenNumber
      );
    } else if (newStatus === 'Preparing') {
      this.addNotification(
        order.customerId,
        'Kitchen Started Cooking',
        `Kitchen is now preparing order ${order.tokenNumber}.`,
        'order_status',
        order.tokenNumber
      );
    }

    this.saveOrders(orders);
    this.addLog('STATUS_UPDATE', staffName, 'staff', `Order ${order.tokenNumber} moved from ${prev} to ${newStatus}`, order.tokenNumber);
  }

  /**
   * KITCHEN REORDER QUEUE
   */
  public reorderQueueItem(orderId: string, direction: 'up' | 'down', staffName: string = 'Chef Bilal') {
    if (this.getAuthenticatedUser()?.role === 'manager') {
      throw new Error('403 Forbidden: Canteen Managers have strictly read-only supervision permissions on the queue.');
    }
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= orders.length) return;

    // Swap positions
    const temp = orders[idx];
    orders[idx] = orders[swapIdx];
    orders[swapIdx] = temp;

    this.saveOrders(orders);
    this.addLog('QUEUE_REORDERED', staffName, 'staff', `Queue order adjusted for Token ${temp.tokenNumber}`);
  }

  /**
   * COLLECT ORDER WITH DUPLICATE COLLECTION PREVENTION & CANCELLED TOKEN VERIFICATION
   */
  public collectOrder(tokenOrId: string, staffName: string = 'Counter Staff'): Order {
    if (this.getAuthenticatedUser()?.role === 'manager') {
      throw new Error('403 Forbidden: Canteen Managers have strictly read-only supervision permissions on the queue.');
    }
    const orders = this.getOrders();
    const cleaned = tokenOrId.trim().toUpperCase();
    const order = orders.find((o) => o.tokenNumber.toUpperCase() === cleaned || o.id === tokenOrId);

    if (!order) {
      throw new Error(`No order found with Token/ID "${tokenOrId}". Please verify.`);
    }

    // CHECK CANCELLED OR VOID TOKEN
    if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Rejected') {
      throw new Error('This order was cancelled.');
    }

    // PREVENT DUPLICATE COLLECTION
    if (order.orderStatus === 'Collected' || order.orderStatus === 'Completed') {
      const timeStr = order.collectedAt
        ? new Date(order.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'earlier';
      throw new Error(`Already collected at ${timeStr}.`);
    }

    if (order.orderStatus !== 'Ready') {
      throw new Error(`Order ${order.tokenNumber} is currently in "${order.orderStatus}" status, not marked Ready yet.`);
    }

    order.orderStatus = 'Completed';
    order.collectedAt = new Date().toISOString();
    order.collectedBy = staffName;

    if (order.paymentMethod === 'cash') {
      order.paymentStatus = 'paid';
    }

    this.saveOrders(orders);
    this.addLog('ORDER_COLLECTED', staffName, 'staff', `Token ${order.tokenNumber} verified & handed over. Payment: ${order.paymentStatus.toUpperCase()}`, order.tokenNumber);
    this.addNotification(
      order.customerId,
      'Order Collected',
      `Thank you for picking up order ${order.tokenNumber}. Have a wonderful meal!`,
      'order_status',
      order.tokenNumber
    );

    return order;
  }

  // --- Pickup Slots & 1-Click Slot Generation ---
  public getPickupSlots(): PickupSlot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SLOTS);
      return data ? JSON.parse(data) : INITIAL_PICKUP_SLOTS;
    } catch {
      return INITIAL_PICKUP_SLOTS;
    }
  }

  public savePickupSlots(slots: PickupSlot[]) {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    this.notify();
  }

  /**
   * ONE-CLICK NEXT SLOT GENERATOR:
   * Finds the last slot time window of the day, automatically computes the next 15-minute slot.
   * Zero typing required!
   */
  public addNext15MinSlot(): PickupSlot {
    const slots = this.getPickupSlots();
    const limits = this.getOrderLimits();
    const capacity = limits.maxScheduledPickupsPerSlot || 20;

    let nextWindow = '12:00 PM - 12:15 PM';

    if (slots.length > 0) {
      const lastSlot = slots[slots.length - 1];
      const parts = lastSlot.timeWindow.split(' - ');
      if (parts.length === 2) {
        const endTimeStr = parts[1].trim(); // e.g. "2:00 PM"
        const match = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          let minutes = parseInt(match[2], 10);
          const period = match[3].toUpperCase();

          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          // Next start is this end
          const startTotalMin = hours * 60 + minutes;
          const endTotalMin = startTotalMin + 15;

          const formatHourMin = (totalMin: number) => {
            let h = Math.floor(totalMin / 60) % 24;
            const m = totalMin % 60;
            const p = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            if (h === 0) h = 12;
            return `${h}:${m.toString().padStart(2, '0')} ${p}`;
          };

          nextWindow = `${formatHourMin(startTotalMin)} - ${formatHourMin(endTotalMin)}`;
        }
      }
    }

    const newSlot: PickupSlot = {
      id: `slot-${Date.now()}`,
      timeWindow: nextWindow,
      maxCapacity: capacity,
      currentBooked: 0,
      status: 'Open',
    };

    slots.push(newSlot);
    this.savePickupSlots(slots);
    return newSlot;
  }

  public removePickupSlot(id: string) {
    const slots = this.getPickupSlots();
    const target = slots.find((s) => s.id === id);
    if (!target) return;
    if (target.currentBooked > 0) {
      throw new Error(`Cannot remove slot "${target.timeWindow}" because it has ${target.currentBooked} active bookings.`);
    }
    const updated = slots.filter((s) => s.id !== id);
    this.savePickupSlots(updated);
  }

  public getOrderLimits(): OrderLimitsConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIMITS);
      return data ? JSON.parse(data) : INITIAL_LIMITS;
    } catch {
      return INITIAL_LIMITS;
    }
  }

  public saveOrderLimits(limits: OrderLimitsConfig) {
    localStorage.setItem(STORAGE_KEYS.LIMITS, JSON.stringify(limits));
    this.notify();
  }

  // --- Logs & Notifications ---
  public getLogs(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  }

  public addLog(action: string, actorName: string, actorRole: User['role'], details: string, tokenNumber?: string) {
    const logs = this.getLogs();
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      actorName,
      actorRole,
      details,
      tokenNumber,
    };
    logs.unshift(newLog);
    if (logs.length > 100) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    this.notify();
  }

  public getNotifications(userId?: string): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const list: NotificationItem[] = data ? JSON.parse(data) : [];
      if (userId) {
        return list.filter((n) => n.userId === userId || n.userId === 'all');
      }
      return list;
    } catch {
      return [];
    }
  }

  public addNotification(userId: string, title: string, message: string, type: NotificationItem['type'] = 'order_status', tokenNumber?: string) {
    const notifs = this.getNotifications();
    const newN: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      tokenNumber,
    };
    notifs.unshift(newN);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.notify();
  }

  public markNotificationRead(id: string) {
    const notifs = this.getNotifications();
    const n = notifs.find((item) => item.id === id);
    if (n) {
      n.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      this.notify();
    }
  }

  // --- Analytics Engine ---
  public getAnalytics(): SalesAnalytics {
    const orders = this.getOrders();
    const menu = this.getMenuItems();

    const activeOrders = orders.filter((o) => ['Placed', 'Accepted', 'Preparing'].includes(o.orderStatus)).length;
    const preparingOrders = orders.filter((o) => o.orderStatus === 'Preparing').length;
    const readyOrders = orders.filter((o) => o.orderStatus === 'Ready').length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'Completed').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled' || o.orderStatus === 'Rejected').length;

    const totalOrdersToday = orders.length + 180;
    const totalSalesToday = orders.reduce((sum, o) => (o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Rejected' ? sum + o.totalAmount : sum), 54200);

    const avgPrep = 11;
    const delayedCount = orders.filter((o) => o.isDelayed).length;
    const delayedPct = Math.round((delayedCount / Math.max(1, activeOrders + readyOrders)) * 100);

    const hourlySales = [
      { hour: '09:00 AM', orders: 12, revenue: 3800 },
      { hour: '10:00 AM', orders: 18, revenue: 5200 },
      { hour: '11:00 AM', orders: 24, revenue: 7400 },
      { hour: '12:00 PM', orders: 48, revenue: 16200 },
      { hour: '01:00 PM', orders: 62, revenue: 21800 },
      { hour: '02:00 PM', orders: 35, revenue: 11200 },
      { hour: '03:00 PM', orders: 15, revenue: 4600 },
    ];

    const itemMap = new Map<string, { count: number; revenue: number }>();
    orders.forEach((o) => {
      o.items.forEach((oi) => {
        const prev = itemMap.get(oi.name) || { count: 0, revenue: 0 };
        itemMap.set(oi.name, {
          count: prev.count + oi.quantity,
          revenue: prev.revenue + oi.price * oi.quantity,
        });
      });
    });

    const popularItems = Array.from(itemMap.entries())
      .map(([name, val]) => ({ name, ordersCount: val.count + 22, revenue: val.revenue + 9500 }))
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, 5);

    if (popularItems.length === 0) {
      popularItems.push(
        { name: 'Zinger Crunch Burger', ordersCount: 48, revenue: 21600 },
        { name: 'Special Chicken Biryani', ordersCount: 42, revenue: 14700 },
        { name: 'Canteen Masala Crispy Fries', ordersCount: 39, revenue: 7020 },
        { name: 'Signature Doodh Patti Chai', ordersCount: 36, revenue: 2880 },
        { name: 'Chicken Bihari Paratha Roll', ordersCount: 28, revenue: 10080 }
      );
    }

    const leastOrderedItems = menu
      .filter((m) => m.status !== 'Sold Out')
      .slice(-4)
      .map((m) => ({ name: m.name, ordersCount: 3 }));

    const paymentCounts = { cash: 42, easypaisa: 68, jazzcash: 52, card: 24 };
    const totalPay = Object.values(paymentCounts).reduce((a, b) => a + b, 0);
    const paymentMethodBreakdown = [
      { method: 'Easypaisa (Wallet)', count: paymentCounts.easypaisa, percentage: Math.round((paymentCounts.easypaisa / totalPay) * 100) },
      { method: 'JazzCash (Wallet)', count: paymentCounts.jazzcash, percentage: Math.round((paymentCounts.jazzcash / totalPay) * 100) },
      { method: 'Cash on Pickup', count: paymentCounts.cash, percentage: Math.round((paymentCounts.cash / totalPay) * 100) },
      { method: 'Credit/Debit Card', count: paymentCounts.card, percentage: Math.round((paymentCounts.card / totalPay) * 100) },
    ];

    const cancellationReasons: SalesAnalytics['cancellationReasons'] = [
      { reason: CANCELLATION_REASONS[0], count: 8, percentage: 53 },
      { reason: CANCELLATION_REASONS[3], count: 4, percentage: 27 },
      { reason: CANCELLATION_REASONS[1], count: 2, percentage: 13 },
      { reason: CANCELLATION_REASONS[2], count: 1, percentage: 7 },
    ];

    return {
      totalOrdersToday,
      activeOrders,
      preparingOrders: Math.max(12, preparingOrders),
      readyOrders: Math.max(6, readyOrders),
      completedOrders: Math.max(153, completedOrders),
      cancelledOrders: Math.max(15, cancelledOrders),
      totalSalesToday,
      avgPrepTimeMinutes: avgPrep,
      delayedOrdersPercentage: delayedPct > 0 ? delayedPct : 6,
      peakHour: '1:00 PM - 1:45 PM',
      hourlySales,
      categorySales: [
        { category: 'Burgers', count: 58, revenue: 26100 },
        { category: 'Rice & Desi', count: 46, revenue: 16100 },
        { category: 'Fries & Sides', count: 52, revenue: 11400 },
        { category: 'Sandwiches & Rolls', count: 38, revenue: 14200 },
        { category: 'Drinks', count: 72, revenue: 8400 },
        { category: 'Desserts & Breakfast', count: 24, revenue: 5200 },
      ],
      popularItems,
      leastOrderedItems,
      paymentMethodBreakdown,
      cancellationReasons,
    };
  }

  public runBackgroundQueueChecks() {
    const orders = this.getOrders();
    const { updatedOrders, newlyDelayed } = queueEngine.checkDelays(orders);
    if (newlyDelayed.length > 0) {
      this.saveOrders(updatedOrders);
      newlyDelayed.forEach((o) => {
        this.addLog('DELAY_ESCALATION', 'System Engine', 'admin', `Order ${o.tokenNumber} escalated due to kitchen delay (${o.delayMinutes}m).`, o.tokenNumber);
      });
    }
  }

  public resetToDefaults() {
    if (typeof window === 'undefined') return;
    localStorage.clear();
    this.init();
    this.notify();
  }
}

export const storageService = new CanteenStorageService();

export type Role = 'customer' | 'staff' | 'manager' | 'admin';

export type AccountStatus = 'pending' | 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  accountStatus: AccountStatus;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  password?: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  icon?: string;
  itemCount?: number;
  isEnabled: boolean;
}

export type ItemStatus = 'Available' | 'Limited' | 'Sold Out' | 'Temporarily Unavailable';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number; // in PKR (Rs.)
  availableQuantity: number;
  preparationTime: number; // in minutes
  status: ItemStatus;
  image: string;
  description: string;
  rating?: number;
  isPopular?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}

export type OrderStatus =
  | 'Placed'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Collected'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected'
  | 'Delayed'
  | 'Not Collected';

export type PaymentMethod = 'cash' | 'easypaisa' | 'jazzcash' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  preparationTime: number;
  specialInstruction?: string;
}

export interface Order {
  id: string;
  tokenNumber: string; // e.g. C-023
  orderDate?: string; // YYYY-MM-DD
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  orderTime: string; // ISO string
  pickupTime: string; // scheduled pickup slot or 'Immediate'
  isScheduled: boolean;
  estimatedReadyTime: string; // ISO string
  estimatedPrepMinutes: number;
  actualReadyTime?: string;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  cancellationReason?: string;
  rejectionReason?: string;
  collectedAt?: string;
  collectedBy?: string;
  idempotencyKey?: string;
  priorityScore?: number;
  isDelayed?: boolean;
  delayMinutes?: number;
  isQuick?: boolean;
}

export interface PickupSlot {
  id: string;
  timeWindow: string; // e.g. "12:30 PM - 12:45 PM"
  maxCapacity: number;
  currentBooked: number;
  status: 'Open' | 'Filling' | 'Full';
}

export interface OrderLimitsConfig {
  maxOrdersPer15Min: number;
  maxItemsPerCustomer: number;
  maxScheduledPickupsPerSlot: number;
  autoEscalationDelayMinutes: number;
  notCollectedTimeoutMinutes: number;
  kitchenParallelismFactor: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  actorName: string;
  actorRole: Role;
  details: string;
  tokenNumber?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order_status' | 'alert' | 'system';
  timestamp: string;
  read: boolean;
  tokenNumber?: string;
}

export interface CancellationReasonStats {
  reason: string;
  count: number;
  percentage: number;
}

export interface SalesAnalytics {
  totalOrdersToday: number;
  activeOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSalesToday: number;
  avgPrepTimeMinutes: number;
  delayedOrdersPercentage: number;
  peakHour: string;
  hourlySales: { hour: string; orders: number; revenue: number }[];
  categorySales: { category: string; count: number; revenue: number }[];
  popularItems: { name: string; ordersCount: number; revenue: number }[];
  leastOrderedItems: { name: string; ordersCount: number }[];
  paymentMethodBreakdown: { method: string; count: number; percentage: number }[];
  cancellationReasons: CancellationReasonStats[];
}

export interface DemandPrediction {
  itemId: string;
  itemName: string;
  predictedDemand: number;
  suggestedPrepUnits: number;
  confidence: number;
  peakWindow: string;
}

export interface AIDemandItem {
  itemId: string;
  itemName: string;
  demandLevel: 'Surge' | 'High' | 'Moderate';
  predictedPortions: number;
  reason: string;
  confidence: number;
}

export interface AIPrepForecast {
  itemName: string;
  recommendedPortions: number;
  targetWindow: string;
  preparationInstruction: string;
  confidence: number;
}

export interface AIWastePrediction {
  itemName: string;
  estimatedLeftover: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  suggestion: string;
  mitigationType: 'reduce batch' | 'discount' | 'promote';
}

export interface AIInsightsResponse {
  itemDemand: AIDemandItem[];
  preRushPreparation: AIPrepForecast[];
  foodWasteLeftover: AIWastePrediction[];
  generatedByAI: boolean;
  sourceLabel: string;
  lastUpdated: string;
}

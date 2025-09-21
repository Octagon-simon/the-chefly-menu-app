export interface OrderAnalytics {
  userId: string;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number; // Only from completed orders
  lastUpdated: string;
}

export interface DailyAnalytics {
  date: string; // YYYY-MM-DD format
  ordersCreated: number;
  ordersCompleted: number;
  ordersCancelled: number;
  revenueGenerated: number;
  averageOrderValue: number;
}

export interface MonthlyAnalytics {
  month: string; // YYYY-MM format
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// Ephemeral order - same as before but with expiry tracking
export interface EphemeralOrder {
  id: string;
  userId: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: {
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    selectedCombos?: {
      id: string;
      name: string;
      price: number;
    }[];
    totalPrice: number;
  }[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string; // Auto-delete after this timestamp
}

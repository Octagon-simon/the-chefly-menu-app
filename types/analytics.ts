export interface OrderAnalytics {
  id: string;
  adminId: string;
  date: string; // YYYY-MM-DD format
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyAnalytics {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  statusCounts: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
  };
}

export interface AnalyticsSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  last30Days: DailyAnalytics[];
}

"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get, set, update, onValue, off } from "firebase/database";
import type {
  OrderAnalytics,
  DailyAnalytics,
  MonthlyAnalytics,
} from "@/types/analytics";
import { useAuth } from "./use-auth";

export const useAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>([]);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<MonthlyAnalytics[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Initialize analytics for new user
  const initializeAnalytics = async (
    userId: string
  ): Promise<OrderAnalytics> => {
    const initialAnalytics: OrderAnalytics = {
      userId,
      totalOrders: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      preparingOrders: 0,
      readyOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      lastUpdated: new Date().toISOString(),
    };

    const analyticsRef = ref(db, `analytics/orders/${userId}`);
    await set(analyticsRef, initialAnalytics);
    return initialAnalytics;
  };

  // Update analytics when order status changes
  const updateAnalytics = async (
    userId: string,
    action: "create" | "statusChange",
    oldStatus?: string,
    newStatus?: string,
    orderAmount?: number
  ) => {
    const analyticsRef = ref(db, `analytics/orders/${userId}`);
    const snapshot = await get(analyticsRef);

    let currentAnalytics: OrderAnalytics;
    if (!snapshot.exists()) {
      currentAnalytics = await initializeAnalytics(userId);
    } else {
      currentAnalytics = snapshot.val();
    }

    const updates: Partial<OrderAnalytics> = {
      lastUpdated: new Date().toISOString(),
    };

    if (action === "create") {
      updates.totalOrders = currentAnalytics.totalOrders + 1;
      updates.pendingOrders = currentAnalytics.pendingOrders + 1;
    } else if (action === "statusChange" && oldStatus && newStatus) {
      // Decrease old status count
      const oldStatusKey = `${oldStatus}Orders` as keyof OrderAnalytics;
      if (typeof currentAnalytics[oldStatusKey] === "number") {
        updates[oldStatusKey] = (currentAnalytics[oldStatusKey] as number) - 1;
      }

      // Increase new status count
      const newStatusKey = `${newStatus}Orders` as keyof OrderAnalytics;
      if (typeof currentAnalytics[newStatusKey] === "number") {
        updates[newStatusKey] = (currentAnalytics[newStatusKey] as number) + 1;
      }

      // Update revenue if order completed
      if (newStatus === "completed" && orderAmount) {
        updates.totalRevenue = currentAnalytics.totalRevenue + orderAmount;
      }
      // Remove revenue if order was completed but now cancelled
      else if (
        oldStatus === "completed" &&
        newStatus === "cancelled" &&
        orderAmount
      ) {
        updates.totalRevenue = Math.max(
          0,
          currentAnalytics.totalRevenue - orderAmount
        );
      }
    }

    await update(analyticsRef, updates);

    // Update daily analytics
    await updateDailyAnalytics(userId, action, newStatus, orderAmount);
  };

  // Update daily analytics
  const updateDailyAnalytics = async (
    userId: string,
    action: "create" | "statusChange",
    status?: string,
    orderAmount?: number
  ) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const dailyRef = ref(db, `analytics/daily/${userId}/${today}`);
    const snapshot = await get(dailyRef);

    let dailyData: DailyAnalytics;
    if (!snapshot.exists()) {
      dailyData = {
        date: today,
        ordersCreated: 0,
        ordersCompleted: 0,
        ordersCancelled: 0,
        revenueGenerated: 0,
        averageOrderValue: 0,
      };
    } else {
      dailyData = snapshot.val();
    }

    const updates: Partial<DailyAnalytics> = {};

    if (action === "create") {
      updates.ordersCreated = dailyData.ordersCreated + 1;
    } else if (action === "statusChange" && status) {
      if (status === "completed" && orderAmount) {
        updates.ordersCompleted = dailyData.ordersCompleted + 1;
        updates.revenueGenerated = dailyData.revenueGenerated + orderAmount;
        // Recalculate average order value
        const newTotal = updates.revenueGenerated;
        const newCount = updates.ordersCompleted;
        updates.averageOrderValue = newCount > 0 ? newTotal / newCount : 0;
      } else if (status === "cancelled") {
        updates.ordersCancelled = dailyData.ordersCancelled + 1;
      }
    }

    await update(dailyRef, { ...dailyData, ...updates });
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch main analytics
      const analyticsRef = ref(db, `analytics/orders/${user.id}`);
      const analyticsSnapshot = await get(analyticsRef);

      if (analyticsSnapshot.exists()) {
        setAnalytics(analyticsSnapshot.val());
      } else {
        const newAnalytics = await initializeAnalytics(user.id);
        setAnalytics(newAnalytics);
      }

      // Fetch daily analytics (last 30 days)
      const dailyRef = ref(db, `analytics/daily/${user.id}`);
      const dailySnapshot = await get(dailyRef);

      if (dailySnapshot.exists()) {
        const dailyData = dailySnapshot.val();
        const dailyArray = Object.values(dailyData) as DailyAnalytics[];
        // Sort by date and take last 30 days
        const sortedDaily = dailyArray
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 30);
        setDailyAnalytics(sortedDaily);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();

      // Set up real-time listener for analytics
      const analyticsRef = ref(db, `analytics/orders/${user.id}`);
      const unsubscribe = onValue(analyticsRef, (snapshot) => {
        if (snapshot.exists()) {
          setAnalytics(snapshot.val());
        }
      });

      return () => off(analyticsRef, "value", unsubscribe);
    }
  }, [user?.id]);

  return {
    analytics,
    dailyAnalytics,
    monthlyAnalytics,
    loading,
    updateAnalytics,
    refreshAnalytics: fetchAnalytics,
  };
};

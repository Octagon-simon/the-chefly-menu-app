"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, push, get, update } from "firebase/database";
import type {
  OrderAnalytics,
  DailyAnalytics,
  AnalyticsSummary,
} from "@/types/analytics";
import { useAuth } from "./use-auth";

export const useAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<OrderAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    last30Days: [],
  });
  const [loading, setLoading] = useState(true);

  /** Fetch analytics for the logged-in admin */
  const fetchAnalytics = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Direct path under adminId
      const analyticsRef = ref(db, `analytics/orders/${user.id}`);
      const snapshot = await get(analyticsRef);

      if (snapshot.exists()) {
        const analyticsData = snapshot.val();
        const analyticsList: OrderAnalytics[] = Object.entries(
          analyticsData
        ).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));

        // Sort by date (newest first)
        analyticsList.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setAnalytics(analyticsList);

        // Compute summary from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentAnalytics = analyticsList.filter(
          (item) => new Date(item.date) >= thirtyDaysAgo
        );

        const totalOrders = recentAnalytics.reduce(
          (sum, item) => sum + item.totalOrders,
          0
        );
        const pendingOrders = recentAnalytics.reduce(
          (sum, item) => sum + item.pendingOrders,
          0
        );
        const completedOrders = recentAnalytics.reduce(
          (sum, item) => sum + item.completedOrders,
          0
        );
        const totalRevenue = recentAnalytics.reduce(
          (sum, item) => sum + item.totalRevenue,
          0
        );

        const last30Days: DailyAnalytics[] = recentAnalytics.map((item) => ({
          date: item.date,
          totalOrders: item.totalOrders,
          totalRevenue: item.totalRevenue,
          statusCounts: {
            pending: item.pendingOrders,
            confirmed: item.confirmedOrders,
            preparing: item.preparingOrders,
            ready: item.readyOrders,
            completed: item.completedOrders,
            cancelled: item.cancelledOrders,
          },
        }));

        setSummary({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          last30Days,
        });
      } else {
        // No analytics found
        setAnalytics([]);
        setSummary({
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          last30Days: [],
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  /** Create or update analytics for a specific date */
  const updateAnalytics = async (
    date: string,
    orderData: {
      totalOrders: number;
      pendingOrders: number;
      confirmedOrders: number;
      preparingOrders: number;
      readyOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      totalRevenue: number;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const analyticsRef = ref(db, `analytics/orders/${user.id}`);
      const snapshot = await get(analyticsRef);

      let existingId: string | null = null;

      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const [id, analytics] of Object.entries(data)) {
          const analyticsData = analytics as any;
          if (analyticsData.date === date) {
            existingId = id;
            break;
          }
        }
      }

      const now = new Date().toISOString();

      if (existingId) {
        // Update existing analytics
        const updateRef = ref(db, `analytics/orders/${user.id}/${existingId}`);
        await update(updateRef, {
          ...orderData,
          updatedAt: now,
        });
      } else {
        // Create new analytics entry
        const newAnalytics: Omit<OrderAnalytics, "id"> = {
          adminId: user.id,
          date,
          ...orderData,
          createdAt: now,
          updatedAt: now,
        };

        await push(analyticsRef, newAnalytics);
      }

      await fetchAnalytics(); // Refresh analytics
      return { success: true };
    } catch (error) {
      console.error("Error updating analytics:", error);
      return { success: false, error: "Failed to update analytics" };
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id]);

  return {
    analytics,
    summary,
    loading,
    updateAnalytics,
    refreshAnalytics: fetchAnalytics,
  };
};

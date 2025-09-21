"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  ref,
  push,
  get,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import type { EphemeralOrder } from "@/types/analytics";
import type { Customer, OrderItem } from "@/types/order";
import { useAuth } from "./use-auth";
import { useAnalytics } from "./use-analytics";

export const useEphemeralOrders = () => {
  const { user } = useAuth();
  const { updateAnalytics } = useAnalytics();
  const [orders, setOrders] = useState<EphemeralOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const ordersRef = ref(db, "ephemeralOrders");
      const userOrdersQuery = query(
        ordersRef,
        orderByChild("userId"),
        equalTo(user.id)
      );
      const snapshot = await get(userOrdersQuery);

      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersList: EphemeralOrder[] = Object.entries(ordersData).map(
          ([id, data]: [string, any]) => ({
            id,
            ...data,
          })
        );

        // Filter out expired orders (they should be auto-deleted but just in case)
        const now = new Date().toISOString();
        const validOrders = ordersList.filter((order) => order.expiresAt > now);

        // Sort by creation date (newest first)
        validOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(validOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching ephemeral orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (
    customer: Customer,
    items: OrderItem[],
    notes?: string
  ): Promise<{ success: boolean; error?: string; orderId?: string }> => {
    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

      const newOrder: Omit<EphemeralOrder, "id"> = {
        userId: user.id,
        customer,
        items,
        totalAmount,
        status: "pending",
        notes,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      const ordersRef = ref(db, "ephemeralOrders");
      const orderRef = await push(ordersRef, newOrder);

      if (orderRef.key) {
        // Update analytics
        await updateAnalytics(user.id, "create");

        await fetchOrders(); // Refresh orders list
        return { success: true, orderId: orderRef.key };
      } else {
        return { success: false, error: "Failed to create order" };
      }
    } catch (error) {
      console.error("Error creating ephemeral order:", error);
      return { success: false, error: "Failed to create order" };
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: EphemeralOrder["status"]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get current order to track old status
      const orderRef = ref(db, `ephemeralOrders/${orderId}`);
      const snapshot = await get(orderRef);

      if (!snapshot.exists()) {
        return { success: false, error: "Order not found" };
      }

      const currentOrder = snapshot.val() as EphemeralOrder;
      const oldStatus = currentOrder.status;

      await update(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Update analytics with status change
      if (user?.id) {
        await updateAnalytics(
          user.id,
          "statusChange",
          oldStatus,
          newStatus,
          currentOrder.totalAmount
        );
      }

      await fetchOrders(); // Refresh orders list
      return { success: true };
    } catch (error) {
      console.error("Error updating ephemeral order status:", error);
      return { success: false, error: "Failed to update order status" };
    }
  };

  const deleteOrder = async (
    orderId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const orderRef = ref(db, `ephemeralOrders/${orderId}`);
      await remove(orderRef);

      await fetchOrders(); // Refresh orders list
      return { success: true };
    } catch (error) {
      console.error("Error deleting ephemeral order:", error);
      return { success: false, error: "Failed to delete order" };
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]);

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    refreshOrders: fetchOrders,
  };
};

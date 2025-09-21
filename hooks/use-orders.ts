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
import type { Order, OrderItem, Customer, OrderSummary } from "@/types/order";
import { useAuth } from "./use-auth";

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<OrderSummary>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });

  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const ordersRef = ref(db, "orders");
      const userOrdersQuery = query(
        ordersRef,
        orderByChild("userId"),
        equalTo(user.id)
      );
      const snapshot = await get(userOrdersQuery);

      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersList: Order[] = Object.entries(ordersData).map(
          ([id, data]: [string, any]) => ({
            id,
            ...data,
          })
        );

        // Sort by creation date (newest first)
        ordersList.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(ordersList);

        // Calculate summary
        const totalOrders = ordersList.length;
        const pendingOrders = ordersList.filter((order) =>
          ["pending", "confirmed", "preparing", "ready"].includes(order.status)
        ).length;
        const completedOrders = ordersList.filter(
          (order) => order.status === "completed"
        ).length;
        const totalRevenue = ordersList
          .filter((order) => order.status === "completed")
          .reduce((sum, order) => sum + order.totalAmount, 0);

        setSummary({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
        });
      } else {
        setOrders([]);
        setSummary({
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
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
      const now = new Date().toISOString();

      const newOrder: Omit<Order, "id"> = {
        userId: user.id,
        customer,
        items,
        totalAmount,
        status: "pending",
        notes,
        createdAt: now,
        updatedAt: now,
      };

      const ordersRef = ref(db, "orders");
      const orderRef = await push(ordersRef, newOrder);

      if (orderRef.key) {
        await fetchOrders(); // Refresh orders list
        return { success: true, orderId: orderRef.key };
      } else {
        return { success: false, error: "Failed to create order" };
      }
    } catch (error) {
      console.error("Error creating order:", error);
      return { success: false, error: "Failed to create order" };
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, {
        status,
        updatedAt: new Date().toISOString(),
      });

      await fetchOrders(); // Refresh orders list
      return { success: true };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, error: "Failed to update order status" };
    }
  };

  const deleteOrder = async (
    orderId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await remove(orderRef);

      await fetchOrders(); // Refresh orders list
      return { success: true };
    } catch (error) {
      console.error("Error deleting order:", error);
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
    summary,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    refreshOrders: fetchOrders,
  };
};

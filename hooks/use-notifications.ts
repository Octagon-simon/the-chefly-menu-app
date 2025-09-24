"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import type { NotificationAction } from "@/types/notification";

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported("Notification" in window);

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) {
        console.warn("Notifications are not supported in this browser");
        return "denied";
      }

      if (permission === "granted") {
        return "granted";
      }

      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return "denied";
      }
    }, [isSupported, permission]);

  const showNotification = useCallback(
    async (options: NotificationOptions): Promise<boolean> => {
      if (!isSupported) {
        console.warn("Notifications are not supported");
        return false;
      }

      if (permission !== "granted") {
        const newPermission = await requestPermission();
        if (newPermission !== "granted") {
          console.warn("Notification permission denied");
          return false;
        }
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/cheflymenuapp-transparent.png",
          badge: options.badge || "/cheflymenuapp-transparent.png",
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          // Note: actions are not supported in all browsers
          // actions: options.actions || [],
        });

        // Auto-close notification after 10 seconds if not requiring interaction
        if (!options.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 10000);
        }

        return true;
      } catch (error) {
        console.error("Error showing notification:", error);
        return false;
      }
    },
    [isSupported, permission, requestPermission]
  );

  const showOrderNotification = useCallback(
    async (orderData: {
      customerName: string;
      totalAmount: number;
      itemCount: number;
      orderId: string;
    }) => {
      const success = await showNotification({
        title: "🔔 New Order Received!",
        body: `${
          orderData.customerName
        } placed an order for ₦${orderData.totalAmount.toLocaleString()} (${
          orderData.itemCount
        } items)`,
        tag: `order-${orderData.orderId}`,
        requireInteraction: true,
      });

      return success;
    },
    [showNotification]
  );

  const sendEmailNotification = useCallback(
    async (orderData: {
      orderId: string;
      orderNumber: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      orderItems: any[];
      totalAmount: number;
      orderNotes?: string;
      restaurantName: string;
    }) => {
      if (!user?.email) {
        console.error("No user email available for notification");
        return { success: false, error: "No user email" };
      }

      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: user.email,
            subject: `🔔 New Order #${orderData.orderNumber} - ${orderData.customerName}`,
            template: "order-notification",
            variables: {
              orderNumber: orderData.orderNumber,
              orderDate: new Date().toLocaleDateString(),
              orderTime: new Date().toLocaleTimeString(),
              customerName: orderData.customerName,
              customerPhone: orderData.customerPhone,
              customerAddress: orderData.customerAddress,
              orderNotes: orderData.orderNotes,
              orderItems: orderData.orderItems.map((item) => ({
                ...item,
                totalPrice: item.totalPrice.toLocaleString(),
              })),
              totalAmount: orderData.totalAmount.toLocaleString(),
              adminUrl: `${window.location.origin}/admin`,
              restaurantName: orderData.restaurantName,
            },
          }),
        });

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Error sending email notification:", error);
        return { success: false, error: "Failed to send email" };
      }
    },
    [user?.email]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    showOrderNotification,
    sendEmailNotification,
  };
};

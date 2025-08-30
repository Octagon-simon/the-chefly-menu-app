"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";
import { SubscriptionService } from "@/lib/subscription";
import type { UserSubscription } from "@/types/menu";

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [hasSubscribedBefore, setHasSubscribedBefore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"active" | "expired" | "cancelled">(
    "cancelled"
  );

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const subscriptionStatus =
          await SubscriptionService.checkSubscriptionStatus(user.id);

        // Retrieve latest subscription data from Firebase
        const latestSub = user.subscription;
        // Check if user has ever subscribed to a paid plan
        setHasSubscribedBefore(!!user?.subscription?.startDate);

        // Update local state
        setSubscription(latestSub);

        // Normalize status
        if (subscriptionStatus === "pro") {
          setStatus("active");
        } else if (subscriptionStatus === "expired") {
          setStatus("expired");
        } else {
          setStatus("cancelled");
        }

        if (subscriptionStatus === "expired") {
          console.log("⚠️ Subscription has expired");
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();

    const interval = setInterval(checkSubscription, 60 * 60 * 1000); // Every hour
    return () => clearInterval(interval);
  }, [user]);

  const isPro = subscription?.plan === "pro" && status === "active";
  const isFree = subscription?.plan === "free" || status !== "active";

  return {
    subscription,
    status,
    loading,
    isPro,
    isFree,
    isExpired: status === "expired",
    isCancelled: status === "cancelled",
    hasSubscribedBefore
  };
};

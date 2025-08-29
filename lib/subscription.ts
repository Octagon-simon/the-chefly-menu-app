import type { User, UserSubscription } from "@/types/menu";
import { db } from "./firebase";
import { ref, get, update } from "firebase/database";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: "monthly" | "yearly";
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    price: 5000,
    duration: "monthly",
    features: [
      "Unlimited menu items",
      "Multiple images per item",
      "Custom branding",
      "QR code generation",
      "Analytics dashboard",
      "Priority support",
    ],
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    price: 50000,
    duration: "yearly",
    features: [
      "Unlimited menu items",
      "Multiple images per item",
      "Custom branding",
      "QR code generation",
      "Analytics dashboard",
      "Priority support",
      "2 months free",
    ],
  },
];

export class SubscriptionService {
  static async checkSubscriptionStatus(
    userId: string
  ): Promise<"free" | "pro" | "expired"> {
    try {
      const userRef = ref(db, `users/${userId}`);
      const userSnap = await get(userRef);

      if (!userSnap.exists()) return "free";

      const user = userSnap.val() as User;
      const subscription = user.subscription;

      if (subscription.plan === "free") return "free";

      if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
        await this.downgradeToFree(userId);
        return "expired";
      }

      return "pro";
    } catch (error) {
      console.error("❌ Error checking subscription status:", error);
      return "free";
    }
  }

  static async downgradeToFree(userId: string): Promise<void> {
    try {
      const userRef = ref(db, `users/${userId}`);
      const publicUserRef = ref(db, `userPublic/${userId}`);
      const userSnap = await get(userRef);

      if (!userSnap.exists()) return;

      const user = userSnap.val() as User;
      const now = new Date();

      const updatedSubscription: UserSubscription = {
        ...user.subscription,
        plan: "free",
        status: "cancelled",
        endDate: null,
        updatedAt: now.toISOString(),
      };

      //update private user document
      await update(userRef, {
        subscription: updatedSubscription,
        updatedAt: now.toISOString(),
      });

      //update public user document
      await update(publicUserRef, {
        subscription: { plan: "free" },
      });
    } catch (error) {
      console.error("❌ Error downgrading to free:", error);
    }
  }

  static getPlanById(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || null;
  }

  static formatPrice(amount: number): string {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount / 100);
  }
}

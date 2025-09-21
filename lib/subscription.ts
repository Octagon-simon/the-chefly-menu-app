import type { User, UserSubscription } from "@/types/menu";
import { db } from "./firebase";
import { ref, get, update } from "firebase/database";
import {
  CORE_PRO_FEATURES,
  ADDON_FEATURES,
  calculateTotalPrice,
  formatPrice,
} from "./features";

export interface SubscriptionPlan {
  id: string;
  name: string;
  basePrice: number;
  duration: "monthly" | "yearly";
  coreFeatures: string[];
  availableAddons: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    basePrice: 500000, // ₦5,000 in kobo
    duration: "monthly",
    coreFeatures: CORE_PRO_FEATURES.map((f) => f.id),
    availableAddons: ADDON_FEATURES.map((f) => f.id),
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    basePrice: 5000000, // ₦50,000 in kobo
    duration: "yearly",
    coreFeatures: CORE_PRO_FEATURES.map((f) => f.id),
    availableAddons: ADDON_FEATURES.map((f) => f.id),
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
        features: [], // Remove all features
        endDate: null,
        updatedAt: now.toISOString(),
      };

      await update(userRef, {
        subscription: updatedSubscription,
        updatedAt: now.toISOString(),
      });

      await update(publicUserRef, {
        subscription: { plan: "free", features: [] },
      });
    } catch (error) {
      console.error("❌ Error downgrading to free:", error);
    }
  }

  static getPlanById(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || null;
  }

  static calculateCustomPlanPrice(
    duration: "monthly" | "yearly",
    addonFeatures: string[]
  ): number {
    return calculateTotalPrice(duration, addonFeatures);
  }

  static formatPrice(amountInKobo: number): string {
    return formatPrice(amountInKobo);
  }
}

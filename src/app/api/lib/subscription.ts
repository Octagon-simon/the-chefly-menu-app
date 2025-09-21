import { ADDON_FEATURES, BASE_PRO_PRICE, Feature } from "@/lib/features";
import type { User, UserSubscription } from "@/types/menu";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const databaseURL = process.env.FIREBASE_DATABASE_URL;

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    databaseURL,
  });
}

export async function upgradeUserToPro(
  userId: string,
  plan: "monthly" | "yearly",
  paymentReference: string,
  isRenewal = false,
  remainingDays = 0,
  selectedFeatures: string[]
): Promise<boolean> {
  try {
    const db = getDatabase();
    const userRef = db.ref(`users/${userId}`);
    const publicUserRef = db.ref(`userPublic/${userId}`);
    const userSnap = await userRef.get();

    if (!userSnap.exists()) throw new Error("User not found");

    const user = userSnap.val() as User;
    const now = new Date();

    let startDate: Date;
    let endDate: Date;

    if (isRenewal && remainingDays > 0 && user.subscription.endDate) {
      // For renewals with remaining time, extend from current end date
      startDate = new Date(user.subscription.endDate);
      endDate = new Date(user.subscription.endDate);
    } else {
      // For new subscriptions or expired renewals, start from now
      startDate = now;
      endDate = new Date();
    }

    if (plan === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const updatedSubscription: UserSubscription = {
      ...user.subscription,
      plan: "pro",
      status: "active",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      updatedAt: now.toISOString(),
      features: selectedFeatures,
    };

    //update private user document
    await userRef.update({
      subscription: updatedSubscription,
      updatedAt: now.toISOString(),
    });

    //update public user document
    await publicUserRef.update({
      subscription: {
        plan: updatedSubscription.plan,
        features: updatedSubscription.features,
      },
    });

    const paymentRef = db.ref(`payments/${paymentReference}`);
    await paymentRef.set({
      userId,
      plan,
      amount: plan === "monthly" ? 5000 : 50000,
      status: "completed",
      paymentReference,
      createdAt: now.toISOString(),
    });

    return true;
  } catch (error) {
    console.error("❌ Error upgrading user to pro:", error);
    return false;
  }
}

export const calculateTotalSubscriptionCost = (
  selectedPlan: "yearly" | "monthly",
  selectedAddons: Feature[],
  promoDiscount: number = 0
) => {
  const basePrice = BASE_PRO_PRICE[selectedPlan];

  // prevent duplicate features by id
  const uniqueAddons = Array.from(
    new Map(selectedAddons.map((f) => [f.id, f])).values()
  );

  const addonPrice = uniqueAddons.reduce(
    (total, addon) => total + addon.price,
    0
  );

  // yearly plan multiplies addons by 12
  const totalAddonPrice =
    selectedPlan === "yearly" ? addonPrice * 12 : addonPrice;

  const totalPrice = basePrice + totalAddonPrice;

  // clamp discount between 0–100
  const validDiscount = Math.min(Math.max(promoDiscount, 0), 100);

  // always return a whole number
  return Math.round(totalPrice - (totalPrice * validDiscount) / 100);
};

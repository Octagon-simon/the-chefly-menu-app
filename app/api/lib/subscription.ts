import { getDatabase } from "firebase-admin/database";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";
import type { User, UserSubscription } from "@/types/menu";

// Ensure Firebase Admin is initialized
initializeFirebaseAdmin();

export async function upgradeUserToPro(
  userId: string,
  plan: "monthly" | "yearly",
  paymentReference: string
): Promise<boolean> {
  try {
    const db = getDatabase();
    const userRef = db.ref(`users/${userId}`);
    const userSnap = await userRef.get();

    if (!userSnap.exists()) throw new Error("User not found");

    const user = userSnap.val() as User;
    const now = new Date();
    const endDate = new Date();

    if (plan === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const updatedSubscription: UserSubscription = {
      ...user.subscription,
      plan: "pro",
      status: "active",
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      updatedAt: now.toISOString(),
    };

    await userRef.update({
      subscription: updatedSubscription,
      updatedAt: now.toISOString(),
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

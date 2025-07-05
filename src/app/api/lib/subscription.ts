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

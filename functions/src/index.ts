/* eslint-disable max-len */
import * as admin from "firebase-admin";
import {onSchedule} from "firebase-functions/v2/scheduler";

admin.initializeApp();
const db = admin.database();

export const checkSubscriptions = onSchedule(
  {
    schedule: "0 0 * * *", // midnight UTC
    timeZone: "UTC",
  },
  async (event) => {
    try {
      const usersSnap = await db.ref("users").once("value");
      const now = new Date();

      const downgradePromises: Promise<void>[] = [];

      // ✨ FIX: Use Object.keys(usersSnap.val()).length instead of usersSnap.size
      // This is a robust way to get the number of children on a DataSnapshot.
      const numberOfUsers = usersSnap.exists() ?
        Object.keys(usersSnap.val()).length :
        0;

      console.log(`Starting subscription check for ${numberOfUsers} users.`);

      usersSnap.forEach((userSnap) => {
        const user = userSnap.val();
        const userId = userSnap.key!;

        if (!user || !user.subscription) {
          return;
        }

        const subscription = user.subscription;

        if (subscription.plan !== "free" && subscription.endDate) {
          const endDate = new Date(subscription.endDate);
          if (endDate < now) {
            console.log(
              `User ${userId} subscription expired on ${endDate.toISOString()}. Downgrading...`
            );
            downgradePromises.push(downgradeToFree(userId));
          }
        }
      });

      await Promise.allSettled(downgradePromises);

      console.log(`✅ Completed subscription check for ${numberOfUsers} users.`);
    } catch (error) {
      console.error("❌ Error during subscription check:", error);
      throw new Error(`Subscription check failed: ${error}`);
    }
  }
);

/**
 * Downgrades a specific user's subscription to the 'free' plan.
 *
 * This function updates both the user's main profile in the 'users' path
 * and their public profile in the 'userPublic' path in the Realtime Database.
 * It sets the subscription plan to 'free', status to 'cancelled',
 * clears the endDate, and updates timestamps.
 *
 * @param {string} userId - The unique ID of the user whose subscription needs to be downgraded.
 * @return {Promise<void>} A promise that resolves when the database updates are complete.
 * @throws {Error} If any database operation fails during the downgrade process.
 */
async function downgradeToFree(userId: string): Promise<void> {
  try {
    const userRef = db.ref(`users/${userId}`);
    const publicUserRef = db.ref(`userPublic/${userId}`);
    const now = new Date();

    const updatesUser = userRef.update({
      "subscription/plan": "free",
      "subscription/status": "cancelled",
      "subscription/endDate": null,
      "subscription/updatedAt": now.toISOString(),
      "updatedAt": now.toISOString(),
    });

    const updatesPublicUser = publicUserRef.update({
      "subscription/plan": "free",
    });

    await Promise.all([updatesUser, updatesPublicUser]);
    console.log(`⬇️ Successfully downgraded user ${userId} to free.`);
  } catch (error) {
    console.error(`💔 Failed to downgrade user ${userId}:`, error);
    throw error;
  }
}

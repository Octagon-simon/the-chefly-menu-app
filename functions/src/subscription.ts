/* eslint-disable max-len */
import * as admin from "firebase-admin";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {Resend} from "resend";
import {readFileSync} from "fs";
import {join} from "path";
import {defineSecret} from "firebase-functions/params";

// set key with npx firebase functions:secrets:set RESEND_API_KEY
// read key with npx firebase functions:secrets:access RESEND_API_KEY
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

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

      console.log(
        `✅ Completed subscription check for ${numberOfUsers} users.`
      );
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

/**
 * Sends an email using a stored HTML template and the Resend API.
 *
 * @param {string} to - Recipient email address.
 * @param {string} template - The name of the template file (without `.html` extension) in the `emails` folder.
 * @param {Record<string, string>} [variables={}] - Key-value pairs to replace placeholders (`{{key}}`) in the template.
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 *   - `success: true` if email was sent successfully.
 *   - `data`: API response from Resend if successful.
 *   - `error`: Error message if sending failed.
 *
 * @example
 * await sendEmailWithTemplate(
 *   "user@example.com",
 *   "subscription-expiry",
 *   { user: "John", daysLeft: "3", renewUrl: "https://cheflymenu.app/upgrade" }
 * );
 */

const sendEmailWithTemplate = async (
  to: string,
  variables: Record<string, string> = {}
) => {
  const template = "subscription-expiry";
  const resend = new Resend(RESEND_API_KEY.value());

  try {
    // Read the HTML template file
    const templatePath = join(__dirname, "..", "emails", `${template}.html`);
    let templateHtml: string;

    try {
      templateHtml = readFileSync(templatePath, "utf-8");
    } catch (error) {
      console.error(`❌ Template ${template} not found at ${templatePath}`);
      return {success: false, error: `Template ${template} not found`};
    }

    // Render template with variables
    let rendered = templateHtml;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      rendered = rendered.replace(placeholder, value);
    });

    const subject = `⏰ Your CheflyMenu Pro subscription expires in ${
      variables?.daysLeft || "X"
    } days`;

    const {data, error} = await resend.emails.send({
      from: "CheflyMenu <noreply@cheflymenu.app>",
      to,
      subject,
      html: rendered,
    });

    if (error) {
      console.error("❌ Email send error:", error);
      return {success: false, error: error.message};
    }

    console.log("✅ Email sent successfully:", data);
    return {success: true, data};
  } catch (error: any) {
    console.error("❌ Email service error:", error);
    return {success: false, error: error.message};
  }
};

/**
 * Scheduled Cloud Function: Sends subscription expiry reminder emails.
 *
 * This function runs daily at midnight UTC and:
 * - Reads all users from Realtime Database
 * - Finds "pro" users whose subscriptions expire in exactly 3 days
 * - Renders an HTML email template with user-specific variables
 * - Sends the email via the Resend API
 *
 * Secrets:
 * - RESEND_API_KEY (stored in Firebase secrets manager)
 *
 * @schedule 0 0 * * *  (midnight UTC every day)
 * @returns {Promise<void>} Resolves when processing completes
 */

export const checkSubscriptionExpiry = onSchedule(
  {
    schedule: "0 0 * * *", // Run daily at midnight
    timeZone: "UTC",
    secrets: [RESEND_API_KEY],
  },
  async (event) => {
    try {
      console.log("🔍 Checking subscription expiry...");

      const db = admin.database();
      const usersRef = db.ref("users");
      const snapshot = await usersRef.once("value");

      if (!snapshot.exists()) {
        console.log("No users found");
        return;
      }

      const users = snapshot.val();
      const now = new Date();
      const nowMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      let emailsSent = 0;

      for (const [, userData] of Object.entries(users as Record<string, any>)) {
        const user = userData as any;

        // Only check Pro users
        if (user.subscription?.plan !== "pro" || !user.subscription?.endDate) {
          continue;
        }

        const endDate = new Date(user.subscription.endDate);

        // normalize to midnight (ignore hours/minutes/seconds)
        const endDateMidnight = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );

        const diffTime = endDateMidnight.getTime() - nowMidnight.getTime();
        const daysLeft = Math.max(
          0,
          Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        );

        if (daysLeft === 3) {
          const result = await sendEmailWithTemplate(
            user.email,
            {
              user: user.username || "there",
              daysLeft: "3",
              renewal_url: "https://cheflymenu.app/upgrade",
              expiry_date: endDate.toDateString(),
            }
          );

          if (result.success) {
            emailsSent++;
            console.log(`✅ Sent 3-day expiry email to ${user.email}`);
          } else {
            console.error(
              `❌ Failed to send expiry email to ${user.email}:`,
              result.error
            );
          }
        }
      }

      console.log(`📧 Sent ${emailsSent} subscription expiry emails`);
      return;
    } catch (error) {
      console.error("❌ Error checking subscription expiry:", error);
      throw error;
    }
  }
);

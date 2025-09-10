/* eslint-disable max-len */
import {Resend} from "resend";
import {readFileSync} from "fs";
import {join} from "path";
import {defineSecret} from "firebase-functions/params";
import {onRequest} from "firebase-functions/v2/https";

// set key with npx firebase functions:secrets:set RESEND_API_KEY
// read key with npx firebase functions:secrets:access RESEND_API_KEY
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

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
  template: string,
  variables: Record<string, string> = {}
) => {
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

    const subjects = {
      "welcome":
        "🎉 Welcome to CheflyMenu - Your Digital Menu Journey Starts Here!",
      "subscription-expiry": `⏰ Your CheflyMenu Pro subscription expires in ${
        variables?.daysLeft || "X"
      } days`,
    };

    const subject =
      subjects[template as keyof typeof subjects] || "CheflyMenu Notification";

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
 * HTTP Cloud Function: Send an email on demand.
 *
 * This function lets you call it directly (e.g., from Next.js) to send emails
 * with a template. It uses the same sendEmailWithTemplate helper.
 *
 * Example call (frontend):
 * await fetch("https://<region>-<project-id>.cloudfunctions.net/sendEmail", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({
 *     to: "user@example.com",
 *     template: "subscription-expiry",
 *     variables: { daysLeft: "3" }
 *   })
 * })
 */
export const sendEmail = onRequest(
  {secrets: [RESEND_API_KEY]},
  async (req, res) => {
    try {
      const {to, template, variables} = req.body;

      if (!to || !template) {
        res
          .status(400)
          .json({success: false, error: "Missing 'to' or 'template' field"});
      }

      const result = await sendEmailWithTemplate(to, template, variables || {});

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err: any) {
      console.error("❌ sendEmail function error:", err);
      res.status(500).json({success: false, error: err.message});
    }
  }
);

import { type NextRequest, NextResponse } from "next/server";
import { paystack } from "@/lib/paystack";
import { upgradeUserToPro } from "../../lib/subscription";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = await paystack.verifyWebhookSignature(body, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle successful payment
    if (event.event === "charge.success") {
      const { reference, metadata, status } = event.data;

      if (status === "success" && metadata) {
        const { userId, plan } = metadata;

        // Upgrade user subscription
        await upgradeUserToPro(
          userId,
          plan as "monthly" | "yearly",
          reference
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

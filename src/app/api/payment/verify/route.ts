import { type NextRequest, NextResponse } from "next/server";
import { paystack } from "../../lib/paystack";
import { upgradeUserToPro } from "../../lib/subscription";

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const verification = await paystack.verifyPayment(reference);

    if (!verification.status || verification.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const { userId, plan, isRenewal, remainingDays, selectedFeatures } =
      verification.data.metadata;

    // Upgrade user subscription
    const upgradeSuccess = await upgradeUserToPro(
      userId,
      plan as "monthly" | "yearly",
      reference,
      isRenewal || false,
      remainingDays || 0,
      selectedFeatures
    );

    if (!upgradeSuccess) {
      return NextResponse.json(
        { error: "Failed to upgrade user subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        status: verification.data.status,
        amount: verification.data.amount,
        reference: verification.data.reference,
        paid_at: verification.data.paid_at,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

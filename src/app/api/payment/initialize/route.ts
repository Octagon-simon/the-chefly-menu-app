import { type NextRequest, NextResponse } from "next/server";
import { auth } from "firebase-admin";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { paystack } from "../../lib/paystack";
import { ADDON_FEATURES, Feature } from "@/lib/features";
import { calculateTotalSubscriptionCost } from "../../lib/subscription";

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

export async function POST(request: NextRequest) {
  try {
    const {
      plan,
      idToken,
      promoCode,
      discount,
      isRenewal,
      remainingDays,
      selectedFeatures,
    } = (await request.json()) as {
      plan: "yearly" | "monthly";
      idToken: string;
      promoCode: string;
      discount: number;
      isRenewal: boolean;
      remainingDays: number;
      selectedFeatures: string[];
    };

    if (!plan || !idToken) {
      return NextResponse.json(
        { error: "Plan and authentication token are required" },
        { status: 400 }
      );
    }

    if (!selectedFeatures || Object.keys(selectedFeatures).length <= 0) {
      return NextResponse.json(
        { error: "Subscription features are required" },
        { status: 400 }
      );
    }

    //make a map/dictionary of add-ons first (O(m)), then look them up in O(1):
    const addonMap = new Map(ADDON_FEATURES.map((addon) => [addon.id, addon]));

    const selectedAddOns = selectedFeatures
      .map((id) => addonMap.get(id))
      .filter((addon): addon is Feature => Boolean(addon));

    // Verify the Firebase ID token
    const decodedToken = await auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Determine base amount based on plan
    const baseAmount = plan === "yearly" ? 5000000 : 500000; // Amount in kobo (₦50,000 or ₦5,000)

    // Apply discount if promo code is provided
    // let finalAmount = baseAmount;
    // if (promoCode && discount > 0) {
    //   finalAmount = baseAmount - (baseAmount * discount) / 100;
    // }

    const finalAmount = calculateTotalSubscriptionCost(
      plan,
      selectedAddOns,
      discount
    );

    console.log(finalAmount, selectedAddOns, selectedFeatures, plan);

    const reference = paystack.generateReference(userId);
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`;

    // Initialize payment with Paystack
    const paymentData = await paystack.initializePayment({
      email,
      amount: Math.round(finalAmount), // Ensure it's a whole number
      reference,
      callback_url: callbackUrl,
      metadata: {
        userId,
        plan,
        email,
        promoCode: promoCode || null,
        discount: discount || 0,
        originalAmount: baseAmount,
        finalAmount: Math.round(finalAmount),
        isRenewal: isRenewal || false,
        remainingDays: remainingDays || 0,
        selectedFeatures
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paymentData.data.authorization_url,
        reference: paymentData.data.reference,
      },
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}

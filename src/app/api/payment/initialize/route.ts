import { type NextRequest, NextResponse } from "next/server"
import { auth } from "firebase-admin"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { paystack } from "../../lib/paystack"

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const { plan, idToken } = await request.json()

    if (!plan || !idToken) {
      return NextResponse.json({ error: "Plan and authentication token are required" }, { status: 400 })
    }

    // Verify the Firebase ID token
    const decodedToken = await auth().verifyIdToken(idToken)
    const userId = decodedToken.uid
    const email = decodedToken.email

    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    // Determine amount based on plan
    const amount = plan === "yearly" ? 5000000 : 500000 // Amount in kobo (₦50,000 or ₦5,000)
    const reference = paystack.generateReference(userId)
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`

    // Initialize payment with Paystack
    const paymentData = await paystack.initializePayment({
      email,
      amount,
      reference,
      callback_url: callbackUrl,
      metadata: {
        userId,
        plan,
        email,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paymentData.data.authorization_url,
        reference: paymentData.data.reference,
      },
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}

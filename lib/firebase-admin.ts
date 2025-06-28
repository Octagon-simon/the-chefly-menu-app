import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

export function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (
      !privateKey ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || // ✅ still correct here
      !process.env.FIREBASE_DATABASE_URL // ✅ use correct env var
    ) {
      throw new Error("❌ Missing Firebase environment variables");
    }

    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL, // 👈 must be defined
    });
  }
}

initializeFirebaseAdmin(); // Ensure it's run immediately for server

export const adminDb = getFirestore();
export const adminRtdb = getDatabase();

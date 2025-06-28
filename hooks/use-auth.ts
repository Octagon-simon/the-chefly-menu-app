"use client";

import { useState, useEffect } from "react";
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getDatabase, ref, get, set, update } from "firebase/database";
import { auth } from "@/lib/firebase";
import { generateRandomUsername, generateSlug } from "@/lib/utils";
import type { User } from "@/types/menu";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = getDatabase();

  const createUserDocument = async (
    firebaseUser: FirebaseUser
  ): Promise<User> => {
    try {
      const userRef = ref(db, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return snapshot.val() as User;
      }

      const username = generateRandomUsername();
      const now = new Date().toISOString();
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        username,
        subscription: {
          id: `sub_${firebaseUser.uid}`,
          userId: firebaseUser.uid,
          plan: "free",
          status: "active",
          startDate: now,
          createdAt: now,
          updatedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      };

      await set(userRef, userData);
      return userData;
    } catch (err) {
      console.error("❌ Realtime DB createUserDocument error:", err);
      throw err;
    }
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;

    try {
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        setUser(snapshot.val() as User);
      }
    } catch (err) {
      console.error("❌ Realtime DB refreshUser error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null);
      setLoading(true);

      if (firebaseUser) {
        try {
          await firebaseUser.getIdToken(true); // Ensure session is ready
          const userData = await createUserDocument(firebaseUser);
          setUser(userData);
        } catch (err) {
          console.error("❌ useAuth AuthState error:", err);
          setUser(null);
          setError(
            "We couldn’t load your account. Check your internet or try again."
          );
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await createUserDocument(result.user);
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      console.error("❌ signIn error:", err);
      setError(err.message);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userData = await createUserDocument(result.user);
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      console.error("❌ signUp error:", err);
      setError(err.message);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
      return { success: true };
    } catch (err: any) {
      console.error("❌ logout error:", err);
      return { success: false, error: err.message };
    }
  };

  const updateUserBrandUrl = async (brandName: string) => {
    if (!user) return { success: false, error: "No user found" };

    try {
      const slug = generateSlug(brandName);
      const userRef = ref(db, `users/${user.id}`);
      const now = new Date().toISOString();

      await update(userRef, {
        username: slug,
        updatedAt: now,
      });

      setUser({ ...user, username: slug, updatedAt: now });
      return { success: true };
    } catch (err: any) {
      console.error("❌ updateUserBrandUrl error:", err);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error("❌ Password reset error:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const getErrorMessage = (error: any): string => {
    switch (error.code) {
      case "auth/user-not-found":
        return "No account found with this email address";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/user-disabled":
        return "This account has been disabled";
      case "auth/email-already-in-use":
        return "An account with this email already exists";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later";
      case "auth/network-request-failed":
        return "Network error. Please check your connection";
      default:
        return error.message || "An error occurred";
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout,
    refreshUser,
    resetPassword,
    updateUserBrandUrl,
  };
};

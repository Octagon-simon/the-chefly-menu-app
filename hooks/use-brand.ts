"use client";

import { useState, useEffect } from "react";
import { getDatabase, ref, get, set, update } from "firebase/database";
import { useAuth } from "./use-auth";
import type { Brand } from "@/types/menu";

export const useBrand = () => {
  const { user, updateUserBrandUrl } = useAuth();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  const db = getDatabase();

  useEffect(() => {
    const fetchBrand = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const brandRef = ref(db, `brands/${user.id}`);
        const snapshot = await get(brandRef);

        if (snapshot.exists()) {
          setBrand(snapshot.val() as Brand);
        } else {
          setBrand(null);
        }
      } catch (error) {
        console.error("❌ Error fetching brand:", error);
        setBrand(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [user]);

  const updateBrand = async (brandData: Partial<Brand>) => {
    if (!user) return { success: false, error: "No user found" };

    try {
      const brandRef = ref(db, `brands/${user.id}`);
      const now = new Date().toISOString();

      const updatedBrand: Brand = {
        id: user.id,
        userId: user.id,
        name: brandData.name || brand?.name || "",
        description: brandData.description || brand?.description || "",
        logo: brandData.logo || brand?.logo || "",
        primaryColor: brandData.primaryColor || brand?.primaryColor || "#3B82F6",
        secondaryColor: brandData.secondaryColor || brand?.secondaryColor || "#10B981",
        createdAt: brand?.createdAt || now,
        updatedAt: now,
      };

      if (brand) {
        await update(brandRef, {
          name: updatedBrand.name,
          description: updatedBrand.description,
          logo: updatedBrand.logo,
          primaryColor: updatedBrand.primaryColor,
          secondaryColor: updatedBrand.secondaryColor,
          updatedAt: updatedBrand.updatedAt,
        });
      } else {
        await set(brandRef, updatedBrand);
      }

      setBrand(updatedBrand);

      // Update user's URL if brand name changed and user is Pro
      if (brandData.name && user.subscription.plan === "pro") {
        await updateUserBrandUrl(brandData.name);
      }

      return { success: true };
    } catch (error: any) {
      console.error("❌ Error updating brand:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    brand,
    loading,
    updateBrand,
  };
};

"use client";

import { useState, useEffect } from "react";
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { useAuth } from "./use-auth";
import type { MenuItem, Category } from "@/types/menu";
import { db } from "@/lib/firebase";
import { metadataCache } from "@/lib/metadataCache";

export const useMenu = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch fresh menu items
        const itemsRef = ref(db, "menuItems");
        const itemsQuery = query(
          itemsRef,
          orderByChild("userId"),
          equalTo(user.id)
        );
        const itemsSnap = await get(itemsQuery);

        const items: MenuItem[] = [];
        if (itemsSnap.exists()) {
          itemsSnap.forEach((snap) => {
            const item = snap.val();
            items.push({ id: snap.key!, ...item });
          });

          items.sort((a, b) =>
            (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
          );
        }

        // Fetch categories
        const catsRef = ref(db, "categories");
        const catsQuery = query(
          catsRef,
          orderByChild("userId"),
          equalTo(user.id)
        );
        const catsSnap = await get(catsQuery);

        const cats: Category[] = [];
        if (catsSnap.exists()) {
          catsSnap.forEach((snap) => {
            const cat = snap.val();
            cats.push({ id: snap.key!, ...cat });
          });

          cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }

        setMenuItems(items);
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [user]);

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    if (!user) return { success: false, error: "No user found" };

    try {
      const now = new Date().toISOString();
      const db = getDatabase();

      // Check how many menu items the user already has
      const itemsRef = ref(db, "menuItems");
      const itemsQuery = query(
        itemsRef,
        orderByChild("userId"),
        equalTo(user.id)
      );
      const itemsSnap = await get(itemsQuery);

      let itemCount = 0;
      if (itemsSnap.exists()) {
        itemsSnap.forEach(() => {
          itemCount++;
        });
      }

      // If user is on a free plan and already has 5 or more items, block it
      if (user.subscription.plan === "free" && itemCount >= 5) {
        return {
          success: false,
          error:
            "Free plan limit reached. Renew your subscription to add more items.",
        };
      }

      // If isCombo is false, remove subItems entirely to prevent undefined errors
      if (!item.isCombo) {
        delete item.subItems;
      }

      // Proceed with adding the new item
      const newItem = {
        ...item,
        userId: user.id,
        createdAt: now,
        updatedAt: now,
      };

      const newRef = push(ref(db, "menuItems"));
      await set(newRef, newItem);

      setMenuItems((prev) => [{ id: newRef.key!, ...newItem }, ...prev]);

      //update meta data last updated
      await metadataCache.updateMetadata(user.id);

      return { success: true };
    } catch (error: any) {
      console.error("Error adding menu item:", error);
      return { success: false, error: error.message };
    }
  };

  const updateMenuItem = async (id: string, item: Omit<MenuItem, "id">) => {
    if (!user) return { success: false, error: "No user found" };

    try {
      const db = getDatabase();
      const updatedItem: any = {
        ...item,
        updatedAt: new Date().toISOString(),
      };

      // If isCombo is false, remove subItems entirely
      if (!updatedItem.isCombo) {
        delete updatedItem.subItems;
      }

      // Remove any undefined values to prevent Firebase errors
      Object.keys(updatedItem).forEach((key) => {
        if (updatedItem[key] === undefined) {
          delete updatedItem[key];
        }
      });

      await update(ref(db, `menuItems/${id}`), updatedItem);

      setMenuItems((prev) =>
        prev.map((prevItem) =>
          prevItem.id === id ? { id, ...updatedItem } : prevItem
        )
      );

      await metadataCache.updateMetadata(user.id);

      return { success: true };
    } catch (error: any) {
      console.error("Error updating menu item:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!user) return { success: false, error: "No user found" };

    try {
      const db = getDatabase();
      await remove(ref(db, `menuItems/${id}`));
      setMenuItems((prev) => prev.filter((item) => item.id !== id));

      //update meta data last updated
      await metadataCache.updateMetadata(user.id);

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting menu item:", error);
      return { success: false, error: error.message };
    }
  };

  const addCategory = async (category: Omit<Category, "id">) => {
    if (!user) return { success: false, error: "No user found" };

    try {
      const now = new Date().toISOString();
      const db = getDatabase();
      const newCategory = {
        ...category,
        userId: user.id,
        order: categories.length,
        createdAt: now,
        updatedAt: now,
      };

      const newRef = push(ref(db, "categories"));
      await set(newRef, newCategory);

      setCategories((prev) => [...prev, { id: newRef.key!, ...newCategory }]);

      //update meta data last updated
      await metadataCache.updateMetadata(user.id);

      return { success: true };
    } catch (error: any) {
      console.error("Error adding category:", error);
      return { success: false, error: error.message };
    }
  };

  const updateCategory = async (id: string, category: Omit<Category, "id">) => {
    if (!user) return { success: false, error: "No user found" };

    try {
      const db = getDatabase();
      const updatedCategory = {
        ...category,
        updatedAt: new Date().toISOString(),
      };

      await update(ref(db, `categories/${id}`), updatedCategory);

      setCategories((prev) =>
        prev.map((prevCat) =>
          prevCat.id === id ? { id, ...updatedCategory } : prevCat
        )
      );

      //update meta data last updated
      await metadataCache.updateMetadata(user.id);

      return { success: true };
    } catch (error: any) {
      console.error("Error updating category:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return { success: false, error: "No user found" };

    try {
      const db = getDatabase();
      await remove(ref(db, `categories/${id}`));
      setCategories((prev) => prev.filter((category) => category.id !== id));

      //update meta data last updated
      await metadataCache.updateMetadata(user.id);

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting category:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    menuItems,
    categories,
    loading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};

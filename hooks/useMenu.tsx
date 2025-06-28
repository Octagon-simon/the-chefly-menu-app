"use client";

import { useState, useEffect } from "react";
import { ref, onValue, push, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";
import type { MenuItem, Category } from "@/types/menu";

export const useMenu = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("useMenu: Effect triggered", {
      user: user?.id,
      db: !!db,
    });

    if (!db || !user) {
      console.log("useMenu: db or user not available");
      setLoading(false);
      return;
    }

    console.log("useMenu: Setting up listeners for user", user.id);

    const menuRef = ref(db, `menus/${user.id}/items`);
    const categoriesRef = ref(db, `menus/${user.id}/categories`);

    const unsubscribeMenu = onValue(menuRef, (snapshot) => {
      try {
        console.log("useMenu: Menu data received");
        const data = snapshot.val();
        if (data) {
          const items: MenuItem[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          console.log("useMenu: Parsed menu items:", items.length);
          setMenuItems(items);
        } else {
          console.log("useMenu: No menu items found");
          setMenuItems([]);
        }
      } catch (err) {
        console.error("useMenu: Error fetching menu items:", err);
        setError("Failed to fetch menu items");
      }
    });

    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      try {
        console.log("useMenu: Categories data received");
        const data = snapshot.val();
        if (data) {
          const cats: Category[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          console.log("useMenu: Parsed categories:", cats.length);
          setCategories(cats);
        } else {
          console.log("useMenu: No categories found");
          setCategories([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("useMenu: Error fetching categories:", err);
        setError("Failed to fetch categories");
        setLoading(false);
      }
    });

    return () => {
      console.log("useMenu: Cleaning up listeners");
      unsubscribeMenu();
      unsubscribeCategories();
    };
  }, [user]);

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    try {
      console.log("useMenu: Adding menu item");
      if (!db || !user) throw new Error("db or user not available");

      const menuRef = ref(db, `menus/${user.id}/items`);
      const newItem = {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await push(menuRef, newItem);
      console.log("useMenu: Menu item added successfully");
      return { success: true };
    } catch (err) {
      console.error("useMenu: Error adding menu item:", err);
      return { success: false, error: "Failed to add menu item" };
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      console.log("useMenu: Updating menu item", id);
      if (!db || !user) throw new Error("db or user not available");

      const itemRef = ref(db, `menus/${user.id}/items/${id}`);
      const updatedItem = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await update(itemRef, updatedItem);
      console.log("useMenu: Menu item updated successfully");
      return { success: true };
    } catch (err) {
      console.error("useMenu: Error updating menu item:", err);
      return { success: false, error: "Failed to update menu item" };
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      console.log("useMenu: Deleting menu item", id);
      if (!db || !user) throw new Error("db or user not available");

      const itemRef = ref(db, `menus/${user.id}/items/${id}`);
      await remove(itemRef);
      console.log("useMenu: Menu item deleted successfully");
      return { success: true };
    } catch (err) {
      console.error("useMenu: Error deleting menu item:", err);
      return { success: false, error: "Failed to delete menu item" };
    }
  };

  const addCategory = async (category: Omit<Category, "id">) => {
    try {
      console.log("useMenu: Adding category");
      if (!db || !user) throw new Error("db or user not available");

      const categoriesRef = ref(db, `menus/${user.id}/categories`);
      const newCategory = {
        ...category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await push(categoriesRef, newCategory);
      console.log("useMenu: Category added successfully");
      return { success: true };
    } catch (err) {
      console.error("useMenu: Error adding category:", err);
      return { success: false, error: "Failed to add category" };
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      console.log("useMenu: Updating category", id);
      if (!db || !user) throw new Error("db or user not available");

      const categoryRef = ref(db, `menus/${user.id}/categories/${id}`);
      const updatedCategory = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await update(categoryRef, updatedCategory);
      console.log("useMenu: Category updated successfully");
      return { success: true };
    } catch (err) {
      console.error("useMenu: Error updating category:", err);
      return { success: false, error: "Failed to update category" };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      console.log("useMenu: Deleting category", id);
      if (!db || !user) throw new Error("db or user not available");

      const categoryRef = ref(db, `menus/${user.id}/categories/${id}`);
      await remove(categoryRef);
      console.log("useMenu: Category deleted successfully");
      return { success: true };
    } catch (err) {
      console.error("useMenu: Error deleting category:", err);
      return { success: false, error: "Failed to delete category" };
    }
  };

  return {
    menuItems,
    categories,
    loading,
    error,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};

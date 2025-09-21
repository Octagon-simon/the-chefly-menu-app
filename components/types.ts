import type React from "react";
import type { Feature } from "@/lib/features";
import type { Brand, Category, MenuItem } from "@/types/menu";

export interface MenuDisplayProps {
  user: {
    id: string;
    username: string;
    subscription: { plan: string; features: Feature[] };
  };
  menuItems: MenuItem[];
  categories: Category[];
  brand: Brand | null;
}

export interface MenuItemCardProps {
  item: MenuItem;
}
export interface CategoryFormProps {
  category?: Category;
  onSubmit: (
    category: Omit<Category, "id">
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  primaryColor: string;
  secondaryColor: string;
  userPlan: string;
  userFeatures: Feature[];
  brand?: any;
  onAddToCart?: (item: MenuItem, selectedCombos: any[]) => void;
  cart?: any[];
}

export interface MenuItemFormProps {
  item?: MenuItem;
  categories: Category[];
  onSubmit: (
    item: Omit<MenuItem, "id">
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export interface QRCodeGeneratorProps {
  url: string;
  brandName: string;
}

export interface QRCodeProps {
  value: string;
  size?: number;
}

export interface SubscriptionBadgeProps {
  plan: "free" | "pro";
}

export interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature: string;
  fallback?: React.ReactNode;
}

export interface UpgradeBannerProps {
  message: string;
  onUpgrade: () => void;
}

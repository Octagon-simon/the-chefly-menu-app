export interface Feature {
  id: string;
  name: string;
  description: string;
  price: number; // Monthly price in kobo (Nigerian cents)
  category: "core" | "addon";
}

export interface SubscriptionFeatures {
  coreFeatures: string[]; // Always included feature IDs
  addonFeatures: string[]; // Optional paid feature IDs
}

// Core Pro features (always included in Pro plan)
export const CORE_PRO_FEATURES: Feature[] = [
  {
    id: "unlimited_menu_items",
    name: "Unlimited Menu Items",
    description: "Add unlimited menu items to your restaurant",
    price: 0,
    category: "core",
  },
  {
    id: "custom_branded_url",
    name: "Custom Branded URL",
    description: "Get a custom URL for your restaurant menu",
    price: 0,
    category: "core",
  },
  {
    id: "custom_brand_colors_logo",
    name: "Custom Brand Colors & Logo",
    description: "Customize your menu with your brand colors and logo",
    price: 0,
    category: "core",
  },
  {
    id: "multiple_images_per_item",
    name: "Up to 5 Images Per Item",
    description: "Upload up to 5 images for each menu item",
    price: 0,
    category: "core",
  },
  {
    id: "remove_branding",
    name: "Remove CheflyMenu Branding",
    description: "Remove CheflyMenu branding from your menu",
    price: 0,
    category: "core",
  },
  {
    id: "month_end_analytics",
    name: "Month-end Analytics",
    description: "Get detailed analytics about your menu performance",
    price: 0,
    category: "core",
  },
];

// Optional paid addon features
export const ADDON_FEATURES: Feature[] = [
  {
    id: "whatsapp_ordering",
    name: "WhatsApp Ordering",
    description: "Allow customers to order directly via WhatsApp",
    price: 250000, // ₦2,500 in kobo
    category: "addon",
  },
  {
    id: "manual_ordering",
    name: "Manual Ordering",
    description: "Accept and manage orders directly through your dashboard",
    price: 200000, // ₦2,000 in kobo
    category: "addon",
  },
];

export const ALL_FEATURES = [...CORE_PRO_FEATURES, ...ADDON_FEATURES];

// Base Pro plan price (without addons)
export const BASE_PRO_PRICE = {
  monthly: 500000, // ₦5,000 in kobo
  yearly: 5000000, // ₦50,000 in kobo
};

// Helper functions
export function getFeatureById(featureId: string): Feature | undefined {
  return ALL_FEATURES.find((feature) => feature.id === featureId);
}

export function calculateTotalPrice(
  basePlan: "monthly" | "yearly",
  addonFeatureIds: string[]
): number {
  const basePrice = BASE_PRO_PRICE[basePlan];
  const addonPrice = addonFeatureIds.reduce((total, featureId) => {
    const feature = getFeatureById(featureId);
    return total + (feature?.price || 0);
  }, 0);

  // Apply yearly discount to addons as well
  const totalAddonPrice = basePlan === "yearly" ? addonPrice * 12 : addonPrice;
  return basePrice + totalAddonPrice;
}

export function formatPrice(amountInKobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amountInKobo / 100);
}

// Check if user has access to a specific feature
export function hasFeatureAccess(
  userFeatures: Feature["id"][],
  featureIds: Feature["id"] | Feature["id"][]
): boolean {
  const ids = Array.isArray(featureIds) ? featureIds : [featureIds];
  return ids.every((id) => userFeatures.includes(id));
}

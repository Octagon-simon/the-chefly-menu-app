export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  userId: string;
  name: string;
  description?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  plan: "free" | "pro";
  status: "active" | "inactive" | "cancelled";
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  subscription: UserSubscription;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: MenuItem[];
  categories: Category[];
  brand?: Brand;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

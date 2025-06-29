import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { MenuDisplay } from "@/components/menu-display";
import type { User, MenuItem, Category, Brand } from "@/types/menu";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { Metadata } from "next";

interface UserMenuPageProps {
  params: {
    username: string;
  };
}

async function getUserByUsername(username: string): Promise<User | null> {
  const usersRef = ref(db, "users");
  const usersQuery = query(
    usersRef,
    orderByChild("username"),
    equalTo(username)
  );
  const snapshot = await get(usersQuery);

  if (!snapshot.exists()) return null;

  let user: User | null = null;
  snapshot.forEach((childSnap) => {
    user = { id: childSnap.key!, ...childSnap.val() } as User;
  });

  return user;
}

async function getUserMenuData(userId: string) {
  try {
    // Fetch all data in parallel
    const [itemsSnapshot, categoriesSnapshot, brandSnap] = await Promise.all([
      get(query(ref(db, "menuItems"), orderByChild("userId"), equalTo(userId))),
      get(
        query(ref(db, "categories"), orderByChild("userId"), equalTo(userId))
      ),
      get(ref(db, `brands/${userId}`)),
    ]);

    // Process menu items
    const menuItems: MenuItem[] = [];
    if (itemsSnapshot.exists()) {
      itemsSnapshot.forEach((snap) => {
        const data = snap.val();
        if (data.available) {
          menuItems.push({ id: snap.key!, ...data });
        }
      });
      menuItems.sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );
    }

    // Process categories
    const categories: Category[] = [];
    if (categoriesSnapshot.exists()) {
      categoriesSnapshot.forEach((snap) => {
        categories.push({ id: snap.key!, ...snap.val() });
      });
      categories.sort((a, b) => a.order - b.order);
    }

    // Process brand
    const brand = brandSnap.exists() ? (brandSnap.val() as Brand) : null;

    return { menuItems, categories, brand };
  } catch (error) {
    console.error("Error fetching menu data:", error);
    return { menuItems: [], categories: [], brand: null };
  }
}

export default async function UserMenuPage({ params }: UserMenuPageProps) {
  const user = await getUserByUsername(params.username);
  if (!user) notFound();

  const { menuItems, categories, brand } = await getUserMenuData(user.id);

  return (
    <MenuDisplay
      user={user}
      menuItems={menuItems}
      categories={categories}
      brand={brand}
    />
  );
}

export async function generateMetadata({
  params,
}: UserMenuPageProps): Promise<Metadata> {
  const user = await getUserByUsername(params.username);
  if (!user) return { title: "Menu Not Found" };

  // Only fetch brand data for metadata to reduce load
  const brandSnap = await get(ref(db, `brands/${user.id}`));
  const brand = brandSnap.exists() ? (brandSnap.val() as Brand) : null;
  const restaurantName = brand?.name || user.email.split("@")[0];

  return {
    title: `${restaurantName} - Digital Menu`,
    description: `View the digital menu for ${restaurantName}. Browse our delicious offerings and place your order.`,
  };
}

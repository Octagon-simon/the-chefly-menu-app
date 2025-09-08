import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { MenuDisplay } from "@/components/menu-display";
import type { MenuItem, Category, Brand } from "@/types/menu";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { Metadata } from "next";
import { formatText } from "@/lib/utils";
import { MENU_CACHE_PREFIX } from "@/constants/app";
import { metadataCache } from "@/lib/metadataCache";

interface UserMenuPageProps {
  params: Promise<{
    username: string;
  }>;
}

async function getUserByUsername(username: string): Promise<{
  id: string;
  username: string;
  subscription: { plan: string };
} | null> {
  const userPublicRef = ref(db, "userPublic");
  const usersQuery = query(
    userPublicRef,
    orderByChild("username"),
    equalTo(username)
  );
  const snapshot = await get(usersQuery);

  if (!snapshot.exists()) return null;

  let user: { id: string; username: string } | null = null;
  snapshot.forEach((childSnap) => {
    user = { id: childSnap.key!, ...childSnap.val() } as {
      id: string;
      username: string;
    };
  });

  return user;
}

async function getUserMenuData(userId: string) {
  try {
    // Use metadata-based cache for efficient data fetching
    const cachedData = await metadataCache.get(
      userId,
      `${MENU_CACHE_PREFIX}${userId}`,
      async () => {
        // Fetch all data in parallel
        const [itemsSnapshot, categoriesSnapshot, brandSnap] =
          await Promise.all([
            get(
              query(
                ref(db, "menuItems"),
                orderByChild("userId"),
                equalTo(userId)
              )
            ),
            get(
              query(
                ref(db, "categories"),
                orderByChild("userId"),
                equalTo(userId)
              )
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
      }
    );

    return cachedData;
  } catch (error) {
    console.error("Error fetching menu data:", error);
    return { menuItems: [], categories: [], brand: null };
  }
}

export default async function UserMenuPage(props: UserMenuPageProps) {
  const params = await props.params;
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

export async function generateMetadata(
  props: UserMenuPageProps
): Promise<Metadata> {
  const params = await props.params;
  const user = await getUserByUsername(params.username);
  if (!user) return { title: "Menu Not Found" };

  const brandSnap = await get(ref(db, `brands/${user.id}`));
  const brand = brandSnap.exists() ? (brandSnap.val() as Brand) : null;
  const restaurantName = brand?.name || user?.username || "CheflyMenu User";
  const description =
    brand?.description ||
    `View the digital menu for ${formatText(
      restaurantName
    )}. Browse our delicious offerings and place your order.`;
  const logoUrl =
    brand?.logo || `${process.env.NEXT_PUBLIC_APP_URL + "/cheflymenuapp.png"}`;

  const baseMetadata: Metadata = {
    title: `${formatText(restaurantName)} - Digital Menu`,
    description,
    openGraph: {
      title: `${formatText(restaurantName)} - Digital Menu`,
      description,
      images: logoUrl
        ? [
            {
              url: logoUrl,
              width: 1200,
              height: 630,
              alt: `${formatText(restaurantName)} Logo`,
            },
          ]
        : [],
      type: "website",
      locale: "en_US",
      siteName: "CheflyMenu",
    },
    twitter: {
      card: "summary_large_image",
      title: `${formatText(restaurantName)} - Digital Menu`,
      description,
      images: logoUrl ? [logoUrl] : [],
    },
  };

  if (user.subscription?.plan === "pro") {
    return {
      ...baseMetadata,
      keywords: `${formatText(
        restaurantName
      )}, restaurant, menu, food, dining, online menu, digital menu, ${
        params.username
      }`,
      authors: [{ name: formatText(restaurantName) }],
      creator: formatText(restaurantName),
      publisher: formatText(restaurantName),
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${params.username}`,
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
      },
      category: "restaurant",
      classification: "business",
      other: {
        "restaurant-name": formatText(restaurantName),
        "menu-type": "digital",
        // "cuisine-type": brand?.cuisine || "International",
        "business-type": "restaurant",
      },
    };
  }

  return {
    ...baseMetadata,
    robots: {
      index: false,
      follow: false,
    },
  };
}

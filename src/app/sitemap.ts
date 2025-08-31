import type { MetadataRoute } from "next";
import { ref, get } from "firebase/database";
import { unstable_cache } from "next/cache";
import { User } from "@/types/menu";
import { db } from "@/lib/firebase";

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: process.env.NEXT_PUBLIC_APP_URL || "https://cheflymenu.app",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
];

async function fetchProUsers(db: any) {
  try {
    const usersRef = ref(db, "userPublic");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return [];
    }

    const users = snapshot.val();
    const proUsers: any[] = [];

    for (const [userId, userData] of Object.entries(users as User)) {
      if (userData.subscription?.plan === "pro" && userData.username) {
        proUsers.push({ userId, ...userData });
      }
    }

    return proUsers;
  } catch (error) {
    console.error("Error fetching PRO users:", error);
    return [];
  }
}

function generateUserRoutes(
  proUsers: any[],
  baseUrl: string
): MetadataRoute.Sitemap {
  const userRoutes: MetadataRoute.Sitemap = [];

  for (const userData of proUsers) {
    userRoutes.push({
      url: `${baseUrl}/${userData.username}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return userRoutes;
}

const getCachedSitemap = unstable_cache(
  async (): Promise<MetadataRoute.Sitemap> => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cheflymenu.app";

    try {
      const proUsers = await fetchProUsers(db);

      if (proUsers.length === 0) {
        return staticRoutes;
      }

      const userRoutes = generateUserRoutes(proUsers, baseUrl);
      const fullSitemap = [...staticRoutes, ...userRoutes];

      return fullSitemap;
    } catch (error) {
      console.error("Error generating sitemap:", error);
      return staticRoutes;
    }
  },
  ["sitemap-data"],
  {
    revalidate: 86400, // 24 hours in seconds
    tags: ["sitemap"],
  }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await getCachedSitemap();
}

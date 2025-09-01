import { ref, get, set } from "firebase/database";
import { db } from "./firebase";
import { CacheEntry } from "./types";

class MetadataBasedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private db = db;

  async isCacheOutdated(userId: string, cacheKey: string): Promise<boolean> {
    try {
      const metadataRef = ref(this.db, `metadata/${userId}`);
      const snapshot = await get(metadataRef);

      if (!snapshot.exists()) {
        return true; // No metadata means fetch fresh
      }

      const { lastUpdated: firebaseLastUpdated } = snapshot.val();
      const cached = this.cache.get(cacheKey);
      if (!cached) {
        return true; // No cache entry
      }

      // Ensure both are strings in ISO format
      return cached.lastUpdated !== firebaseLastUpdated;
    } catch (error) {
      console.error("Error checking cache validity:", error);
      return true; // On error, assume cache is outdated
    }
  }

  async get<T>(
    userId: string, //only used to check if cache is outdated by querying the metadata doc on firebase
    cacheKey: string,
    fetchFunction: () => Promise<T>
  ): Promise<T> {
    const isOutdated = await this.isCacheOutdated(userId, cacheKey);
    if (!isOutdated) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached.data;
      }
    }

    // Fetch fresh data
    const freshData = await fetchFunction();

    // Get the latest metadata timestamp
    const metadataRef = ref(this.db, `metadata/${userId}/lastUpdated`);
    const metadataSnapshot = await get(metadataRef);
    const lastUpdated = metadataSnapshot.exists()
      ? metadataSnapshot.val()
      : new Date().toISOString();

    // Cache the fresh data
    this.cache.set(cacheKey, {
      data: freshData,
      lastUpdated,
      timestamp: Date.now(),
    });

    return freshData;
  }

  async updateMetadata(userId: string): Promise<void> {
    try {
      const metadataRef = ref(this.db, `metadata/${userId}/lastUpdated`);
      await set(metadataRef, new Date().toISOString());

      // Clear related cache entries
      const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
        key.includes(userId)
      );
      keysToDelete.forEach((key) => this.cache.delete(key));
    } catch (error) {
      console.error("Error updating metadata:", error);
    }
  }

  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats for debugging
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export { MetadataBasedCache };
export const metadataCache = new MetadataBasedCache();

setInterval(() => {
  metadataCache.cleanup();
}, 24 * 60 * 60 * 1000);

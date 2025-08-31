import { MENU_CACHE_DURATION } from "@/constants/app";
import { MenuItem } from "@/types/menu";

export class MenuCache {
  private cache = new Map<string, { data: MenuItem[]; timestamp: number }>();
  private readonly CACHE_DURATION = MENU_CACHE_DURATION;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  get(key: string): MenuItem[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  set(key: string, data: MenuItem[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

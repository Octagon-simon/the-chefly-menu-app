export interface CacheEntry<T> {
  data: T;
  lastUpdated: string;
  timestamp: number;
}
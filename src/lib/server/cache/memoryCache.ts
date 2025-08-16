type Entry<T> = { value: T; expires: number };

export class MemoryCache<T = any> {
  private store = new Map<string, Entry<T>>();
  constructor(private defaultTtlMs = 60_000) {}

  get(key: string): T | null {
    const e = this.store.get(key);
    if (!e) return null;
    if (Date.now() > e.expires) {
      this.store.delete(key);
      return null;
    }
    return e.value;
  }

  set(key: string, value: T, ttlMs = this.defaultTtlMs) {
    this.store.set(key, { value, expires: Date.now() + ttlMs });
  }
}


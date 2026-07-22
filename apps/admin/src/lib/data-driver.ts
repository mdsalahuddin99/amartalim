/**
 * Data driver — the only module that touches `localStorage` directly.
 *
 * Stores call `driver.list(resource)` / `driver.save(resource, items)` instead
 * of reading/writing `localStorage` themselves. This keeps the store APIs
 * synchronous (so existing components don't need to await) while routing all
 * persistence through one swappable layer.
 *
 * After Next.js migration:
 *   - Replace this file's implementation with a no-op or remove it entirely.
 *   - Switch the stores to use `api.get` / `api.post` directly (they already
 *     have a thin wrapper for that pattern).
 *
 * Cross-tab + same-tab change notifications use a custom event so React hooks
 * can re-render without polling.
 */

const NS = "amartalim";

export const driverEvent = (resource: string) => `${NS}:${resource}:changed`;

const storageKey = (resource: string, version = "v1") => `${NS}:${resource}:${version}`;

export const driver = {
  list<T>(resource: string, opts: { version?: string } = {}): T[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(storageKey(resource, opts.version));
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  },
  save<T>(resource: string, items: T[], opts: { version?: string } = {}): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey(resource, opts.version), JSON.stringify(items));
    window.dispatchEvent(new Event(driverEvent(resource)));
  },
  /** Generic JSON read (for singletons like config objects). */
  readJson<T>(resource: string, fallback: T, opts: { version?: string } = {}): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(storageKey(resource, opts.version));
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  writeJson<T>(resource: string, value: T, opts: { version?: string } = {}): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey(resource, opts.version), JSON.stringify(value));
    window.dispatchEvent(new Event(driverEvent(resource)));
  },
  subscribe(resource: string, cb: () => void): () => void {
    const evt = driverEvent(resource);
    window.addEventListener(evt, cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener(evt, cb);
      window.removeEventListener("storage", cb);
    };
  },
};

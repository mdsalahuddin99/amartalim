# Mock API Layer

This folder is **temporary**. It exists only so the Vite preview can run without a real backend.

## How it works

1. `src/lib/api-client.ts` exposes `api.get / post / put / patch / del`.
2. Before calling `fetch`, the client checks a `mockRegistry` — if a handler matches the path + method, it returns the mock response instead of doing network I/O.
3. Each `*.mock.ts` here registers handlers for one resource, backed by `localStorage` via `src/lib/data-driver.ts`.
4. `src/main.tsx` calls `registerMocks()` once at startup.

## After Next.js migration

1. Delete this entire folder.
2. Remove the `registerMocks()` import + call from `src/main.tsx`.
3. Set `VITE_API_URL` / `NEXT_PUBLIC_API_URL` (or leave blank for same-origin `/api`).
4. Every store that imports from `@/lib/api-client` keeps working unchanged — calls now hit real `app/api/*` route handlers.

## Adding new resources

Follow `orders.mock.ts` as the template:

```ts
import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";

const RES = "thing";
registerMock("GET", /^\/things$/, () => ok(driver.list(RES)));
registerMock("POST", /^\/things$/, (req) => { /* ... */ });
```

Then add `registerThingMocks()` to `index.ts`.

## Stores still using direct localStorage

These stores have **not yet** been migrated to the `api.*` pattern; they still use the old in-file localStorage code. They work today, but for full backend-readiness each should be converted by:

1. Creating `<resource>.mock.ts` here.
2. Rewriting the store to call `api.get / post / patch / del` (see `orders-store.ts` as the reference).

Pending: `bookmarks-store.ts`, `notes-store.ts`, `progress-store.ts`, `coupons-store.ts`, `authors-store.ts`, `blog-store.ts`, `blog-categories-store.ts`, `comments-store.ts`, `ads-store.ts`.

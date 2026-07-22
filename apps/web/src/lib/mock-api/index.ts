/**
 * Mock API handler registry.
 *
 * Today (Vite preview): each `register*Mocks()` registers fetch interceptors
 * that read/write localStorage (via the shared `driver`) and return the
 * standard `{ data, error, meta }` envelope — so `api.get("/orders")` works
 * locally without a server.
 *
 * After Next.js migration:
 *   1. Delete this file (and `src/lib/mock-api/`).
 *   2. Remove the `registerMocks()` call from `src/main.tsx`.
 *   3. `api.get` / `api.post` will hit the real `/api/...` routes.
 */
let installed = false;

export const registerMocks = () => {
  if (installed) return;
  installed = true;
};


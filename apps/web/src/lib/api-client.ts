/**
 * Central API client — single point of contact between the React frontend and
 * the backend. Today, in the Vite preview, there is no real HTTP server, so a
 * pluggable `mockTransport` runs the request against in-memory / localStorage
 * handlers and returns a Promise that mirrors `fetch()`.
 *
 * Post Next.js migration:
 *   - Set `VITE_API_URL` (or `NEXT_PUBLIC_API_URL`) to "" or "/api"
 *   - Delete `setMockTransport(...)` usage from `src/lib/mock-api/index.ts`
 *   - Every store / hook keeps working unchanged because they all go through
 *     `api.get` / `api.post` / `api.put` / `api.del`.
 *
 * Response envelope (matches the migration doc):
 *   { data: T | null, error: { code, message } | null, meta?: {...} }
 */

export interface ApiEnvelope<T> {
  data: T | null;
  error: { code: string; message: string } | null;
  meta?: Record<string, unknown>;
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 0) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface MockRequest {
  method: Method;
  path: string;
  query: Record<string, string>;
  body: unknown;
}

export type MockHandler = (req: MockRequest) => Promise<ApiEnvelope<unknown>> | ApiEnvelope<unknown>;

const mockRegistry: { match: RegExp; method: Method | "*"; handler: MockHandler }[] = [];

/** Register a mock route. Pattern is a regex matched against the path (no query). */
export const registerMock = (method: Method | "*", pattern: RegExp, handler: MockHandler) => {
  mockRegistry.push({ method, match: pattern, handler });
};

const BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL) ||
  "";

const buildUrl = (path: string, query?: Record<string, string | number | boolean | undefined>) => {
  const qs = query
    ? Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  return `${BASE_URL}${path}${qs ? `?${qs}` : ""}`;
};

const findMock = (method: Method, path: string): MockHandler | null => {
  for (const r of mockRegistry) {
    if ((r.method === "*" || r.method === method) && r.match.test(path)) return r.handler;
  }
  return null;
};

const request = async <T>(
  method: Method,
  path: string,
  opts: { body?: unknown; query?: Record<string, string | number | boolean | undefined> } = {},
): Promise<T> => {
  const mock = findMock(method, path);
  if (mock) {
    const env = await mock({
      method,
      path,
      query: Object.fromEntries(
        Object.entries(opts.query ?? {}).map(([k, v]) => [k, String(v ?? "")]),
      ),
      body: opts.body,
    });
    if (env.error) throw new ApiError(env.error.code, env.error.message, 400);
    return env.data as T;
  }

  // Real HTTP path — used after Next.js migration.
  const res = await fetch(buildUrl(path, opts.query), {
    method,
    credentials: "include",
    headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let env: ApiEnvelope<T>;
  try {
    env = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError("BAD_RESPONSE", `Non-JSON response (${res.status})`, res.status);
  }
  if (!res.ok || env.error) {
    throw new ApiError(env.error?.code ?? "HTTP_ERROR", env.error?.message ?? res.statusText, res.status);
  }
  return env.data as T;
};

export const api = {
  get: <T>(path: string, query?: Record<string, string | number | boolean | undefined>) =>
    request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  del: <T>(path: string, body?: unknown) => request<T>("DELETE", path, { body }),
};

/** Helper for mock handlers to wrap a result in the standard envelope. */
export const ok = <T>(data: T, meta?: Record<string, unknown>): ApiEnvelope<T> => ({
  data,
  error: null,
  ...(meta ? { meta } : {}),
});
export const fail = <T = unknown>(code: string, message: string): ApiEnvelope<T> => ({
  data: null,
  error: { code, message },
});

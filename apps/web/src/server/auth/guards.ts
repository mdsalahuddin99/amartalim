import { auth, type AppRole } from "./auth";

/** Throws/redirects if no session. Use inside server components. */
export const requireAuth = async () => {
  const session = await auth();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
};

/** Throws/redirects if user lacks any of the allowed roles. */
export const requireRole = async (...allowed: AppRole[]) => {
  const session = await requireAuth();
  if (!allowed.includes(session.user.role)) throw new Error("FORBIDDEN");
  return session;
};

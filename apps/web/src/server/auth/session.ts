import { useEffect, useState } from "react";
import { useSession as useNextAuthSession, signOut as nextAuthSignOut } from "next-auth/react";

/**
 * Client session bridge between NextAuth and legacy mock auth.
 */
export type SessionRole = "student" | "instructor" | "admin";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: SessionRole;
  approvedRoles?: string[];
}

// ─── Legacy / global session (used by admin panel etc.) ───────────────────────
const KEY = "amartalim:session:v1";
const EVT = "amartalim:session:changed";

const read = (): SessionUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as SessionUser;
    return { role: "student", ...u };
  } catch {
    return null;
  }
};

/** Map an email to a session role using mock conventions. */
export const resolveRoleForEmail = (email: string): SessionRole => {
  const e = (email || "").trim().toLowerCase();
  if (!e) return "student";
  if (e === "admin@amartalim.com" || e.startsWith("admin@") || e.startsWith("admin.")) return "admin";
  if (
    e === "instructor@amartalim.com" ||
    e.startsWith("instructor@") ||
    e.startsWith("instructor.") ||
    e.includes("+instructor@") ||
    e.includes("teacher")
  )
    return "instructor";
  return "student";
};

export const sessionStore = {
  get: read,
  signIn(user: SessionUser) {
    const role = user.role ?? resolveRoleForEmail(user.email);
    localStorage.setItem(KEY, JSON.stringify({ ...user, role }));
    window.dispatchEvent(new Event(EVT));
  },
  signOut() {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVT));
    if (typeof window !== "undefined") {
      void nextAuthSignOut({ redirect: true, callbackUrl: "/" });
    }
  },
};

// ─── User Panel Session (completely separate from admin/NextAuth) ─────────────
// This allows an admin to stay logged into /admin while a student is logged
// into /dashboard with a different account.
const USER_PANEL_KEY = "amartalim:user-panel:v1";
const USER_PANEL_EVT = "amartalim:user-panel:changed";

const readUserPanel = (): SessionUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_PANEL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
};

/** Store for the /dashboard student session — independent of NextAuth cookie. */
export const userPanelStore = {
  get: readUserPanel,
  signIn(user: SessionUser) {
    localStorage.setItem(USER_PANEL_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event(USER_PANEL_EVT));
  },
  /** Logs out only from the User Dashboard; admin panel stays logged in. */
  signOut() {
    localStorage.removeItem(USER_PANEL_KEY);
    window.dispatchEvent(new Event(USER_PANEL_EVT));
  },
  isActive(): boolean {
    return readUserPanel() !== null;
  },
};

/**
 * Hook for the User Dashboard (/dashboard/*).
 * Reads ONLY the user-panel localStorage session — completely independent of
 * NextAuth, so admins can remain logged in to /admin at the same time.
 */
export function useUserPanelSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setUser(readUserPanel());
    setIsMounted(true);

    const refresh = () => setUser(readUserPanel());
    window.addEventListener(USER_PANEL_EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(USER_PANEL_EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    role: (user?.role ?? null) as SessionRole | null,
    status: isMounted ? (user ? "authenticated" : "unauthenticated") : "loading",
  };
}

/**
 * Generic useSession used across the site (admin panel, marketing pages, etc.).
 * Prioritises NextAuth JWT session; falls back to legacy localStorage.
 */
export function useSession() {
  const { data: nextSession, status } = useNextAuthSession();
  const [localUser, setLocalUser] = useState<SessionUser | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setLocalUser(read());
    setIsMounted(true);
    
    const refresh = () => setLocalUser(read());
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // If we have a real NextAuth database session, use it as primary
  if (status === "authenticated" && nextSession?.user) {
    const nextUser = nextSession.user as any;
    const dbRole = nextUser.role; // "ADMIN" | "INSTRUCTOR" | "STUDENT"
    const mappedRole = (dbRole ? dbRole.toLowerCase() : "student") as SessionRole;

    const user: SessionUser = {
      id: nextUser.id || "",
      name: nextUser.name || "",
      email: nextUser.email || "",
      avatar: nextUser.image || null,
      role: mappedRole,
      approvedRoles: nextUser.approvedRoles || [],
    };
    return {
      user,
      isAuthenticated: true,
      role: mappedRole,
      status,
    };
  }

  // Fallback to client-side localStorage session (e.g. for development/preview bypass)
  return {
    user: localUser,
    isAuthenticated: !!localUser,
    role: localUser?.role ?? null,
    status: isMounted ? (localUser ? "authenticated" : "unauthenticated") : "loading",
  };
}

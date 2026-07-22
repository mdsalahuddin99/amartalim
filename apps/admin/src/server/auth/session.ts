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

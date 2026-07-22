/**
 * NextAuth session augmentation — used after Next.js migration.
 * Kept here so types are ready when `next-auth` is installed.
 */
import type { AppRole } from "@/server/auth/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: AppRole;
    };
  }

  interface User {
    role: AppRole;
  }
}

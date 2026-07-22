import { ReactNode } from "react";
import { Link, Navigate, useLocation } from "@/lib/navigation";
import { ShieldAlert, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, type SessionRole } from "@/server/auth/session";

interface RoleGuardProps {
  allow: SessionRole[];
  children: ReactNode;
  /** Where to redirect unauthenticated users. Defaults to /login?from=... */
  loginPath?: string;
}

/**
 * Client-side role guard for mock-auth pages.
 *
 * - No session → redirects to /login with `from` set.
 * - Wrong role → renders a friendly "অনুমতি নেই" screen.
 */
export const RoleGuard = ({ allow, children, loginPath }: RoleGuardProps) => {
  const { user, role, status } = useSession();
  const location = useLocation();

  if (status === "loading") {
    return null; // Avoid hydration mismatch on initial render
  }

  if (!user) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${loginPath ?? "/login"}?from=${from}`} replace />;
  }

  const hasDirectRole = role && allow.includes(role);
  const hasApprovedRole = user?.approvedRoles?.some(r => allow.includes(r.toLowerCase() as SessionRole));

  if (!hasDirectRole && !hasApprovedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full text-center rounded-2xl border border-border/50 bg-card shadow-card p-6 sm:p-8 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold">অনুমতি নেই</h1>
            <p className="text-sm text-muted-foreground mt-1">
              এই পৃষ্ঠাটি শুধু {allow.map((r) => (r === "instructor" ? "ইন্সট্রাক্টর" : r === "admin" ? "অ্যাডমিন" : "শিক্ষার্থী")).join(" / ")} ইউজারের জন্য।
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              বর্তমান অ্যাকাউন্ট: <span className="font-medium">{user.email}</span>
              {role ? <> · ভূমিকা: <span className="font-medium">{role}</span></> : null}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/">
              <Button variant="outline" className="rounded-xl w-full sm:w-auto">হোমে ফিরুন</Button>
            </Link>
            <Link to={`/login?from=${encodeURIComponent(location.pathname)}`}>
              <Button className="rounded-xl w-full sm:w-auto bg-gradient-hero hover:opacity-90">
                <LogIn className="mr-2 h-4 w-4" /> অন্য অ্যাকাউন্টে লগইন
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;

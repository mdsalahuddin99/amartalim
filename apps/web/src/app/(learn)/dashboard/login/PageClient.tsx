"use client";

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "@/lib/navigation";
import { Loader2, AlertCircle, GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userPanelStore } from "@/server/auth/session";
import PasswordInput from "@/components/shared/PasswordInput";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

const DashboardLoginPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We remove the aggressive userPanelStore redirect that causes the loop.
  // We want users to log in again if they don't have a NextAuth session.
  useEffect(() => {
    // Only redirect if we know for sure they are fully authenticated
    // but NextAuth check requires useSession, which we don't have here.
    // So we'll trust the redirect logic from middleware/server.
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("ইমেইল ও পাসওয়ার্ড প্রয়োজন।");
      return;
    }
    setLoading(true);

    try {
      // 1. Sign in with NextAuth to establish the secure server session (cookie)
      // This is required for Server Actions like submitRoleApplication
      const { signIn } = await import("next-auth/react");
      const nextAuthRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (nextAuthRes?.error) {
        setError("ভুল ইমেইল বা পাসওয়ার্ড।");
        setLoading(false);
        return;
      }

      // 2. Fetch the user details to populate the legacy userPanelStore
      const res = await fetch("/api/auth/verify-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        setError(data.error || "ভুল ইমেইল বা পাসওয়ার্ড।");
        setLoading(false);
        return;
      }

      // Store in user-panel-specific localStorage
      userPanelStore.signIn({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.image ?? null,
        role: (data.user.role?.toLowerCase() ?? "student") as any,
      });

      toast({ title: "স্বাগতম!", description: `${data.user.name} হিসেবে লগইন হয়েছে।` });
      navigate(redirectTo);
    } catch {
      setError("লগইন করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/10 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-hero mb-4 shadow-lg">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">শিক্ষার্থী লগইন</h1>
          <p className="text-muted-foreground text-sm mt-1">
            আপনার স্টুডেন্ট অ্যাকাউন্ট দিয়ে প্রবেশ করুন
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-card p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dp-email">ইমেইল</Label>
              <Input
                id="dp-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dp-password">পাসওয়ার্ড</Label>
              <PasswordInput
                id="dp-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-semibold bg-gradient-hero hover:opacity-90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "লগইন করুন"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            অ্যাকাউন্ট নেই?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              সাইন আপ করুন
            </Link>
          </p>
        </div>

        {/* Back link */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            মূল ওয়েবসাইটে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoginPage;

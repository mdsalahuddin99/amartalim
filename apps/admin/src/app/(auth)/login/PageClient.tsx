"use client";

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AuthShell from "../_shell";
import PasswordInput from "@/components/shared/PasswordInput";
import GoogleButton from "@/components/shared/GoogleButton";
import { sessionStore } from "@/server/auth/session";
import { toast } from "@/hooks/use-toast";

import { signIn } from "next-auth/react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("ইমেইল ও পাসওয়ার্ড প্রয়োজন।");
      return;
    }
    setLoading(true);
    
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        if (res.error === "Incorrect password" || res.error === "User not found or using OAuth") {
          setError("ভুল ইমেইল বা পাসওয়ার্ড।");
        } else {
          setError(res.error);
        }
        return;
      }

      // Sync mock session store to keep existing frontend UI working smoothly
      const derivedName = email.split("@")[0].replace(/[._-]+/g, " ").trim() || "ইউজার";
      const existing = sessionStore.get();
      sessionStore.signIn({
        id: existing?.id ?? `u_${Date.now()}`,
        name: existing?.email === email && existing?.name ? existing.name : derivedName,
        email: email,
        avatar: existing?.email === email ? existing?.avatar ?? null : null,
      });

      toast({ title: "স্বাগতম!", description: "সফলভাবে লগইন হয়েছে।" });
      
      let finalRedirect = redirectTo;
      if (finalRedirect === "/dashboard") {
         finalRedirect = "/admin";
      }
      
      navigate(finalRedirect);
    } catch (err: any) {
      setError("লগইন করতে সমস্যা হচ্ছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="আবার স্বাগতম"
      subtitle="অ্যাডমিন প্যানেলে প্রবেশ করতে লগইন করুন"
    >
      <GoogleButton onClick={() => signIn("google", { callbackUrl: redirectTo })} disabled={loading} label="গুগল দিয়ে লগইন করুন" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">অথবা</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">ইমেইল</Label>
          <Input
            id="email"
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
          আমাকে মনে রাখুন
        </label>
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl font-semibold bg-gradient-hero hover:opacity-90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "সাইন ইন"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;

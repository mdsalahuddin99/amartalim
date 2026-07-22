"use client";

import { useState } from "react";
import { Link, useNavigate } from "@/lib/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import AuthShell from "../_shell";
import PasswordInput from "@/components/shared/PasswordInput";
import GoogleButton from "@/components/shared/GoogleButton";
import PasswordStrengthMeter from "@/components/shared/PasswordStrengthMeter";
import { sessionStore } from "@/server/auth/session";

import { signIn } from "next-auth/react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("নাম প্রয়োজন।");
    if (form.password.length < 8) return setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।");
    if (form.password !== form.confirm) return setError("পাসওয়ার্ড মিলছে না।");
    if (!agree) return setError("শর্তাবলীতে সম্মতি দিন।");
    setLoading(true);

    try {
      // Call register API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      }

      // Automatically sign in via NextAuth
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error);
      }

      // Sync mock session store to keep existing frontend UI working smoothly
      sessionStore.signIn({
        id: data.userId || `u_${Date.now()}`,
        name: form.name.trim(),
        email: form.email,
        avatar: null,
      });

      toast({ title: "সফল!", description: "রেজিস্ট্রেশন সফল হয়েছে।" });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "কোনো একটি সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="অ্যাকাউন্ট তৈরি করুন"
      subtitle="আপনার শেখার যাত্রা শুরু করুন"
      footer={
        <>
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">সাইন ইন করুন</Link>
        </>
      }
    >
      <GoogleButton onClick={() => signIn("google", { callbackUrl: "/dashboard" })} label="গুগল দিয়ে সাইন আপ" disabled={loading} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">অথবা</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">পূর্ণ নাম</Label>
          <Input id="name" value={form.name} onChange={update("name")} autoComplete="name" disabled={loading} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">ইমেইল</Label>
          <Input id="email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required disabled={loading} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">পাসওয়ার্ড</Label>
          <PasswordInput id="password" value={form.password} onChange={update("password")} autoComplete="new-password" required disabled={loading} />
          <PasswordStrengthMeter password={form.password} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">পাসওয়ার্ড নিশ্চিত করুন</Label>
          <PasswordInput id="confirm" value={form.confirm} onChange={update("confirm")} autoComplete="new-password" required disabled={loading} />
          {form.confirm && form.password !== form.confirm && (
            <p className="text-xs text-destructive">পাসওয়ার্ড মিলছে না</p>
          )}
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
          <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
          <span>
            আমি <Link to="/terms" className="text-primary hover:underline">শর্তাবলী</Link> ও{" "}
            <Link to="/privacy" className="text-primary hover:underline">গোপনীয়তা নীতি</Link> মেনে নিচ্ছি
          </span>
        </label>
        <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold bg-gradient-hero hover:opacity-90">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "অ্যাকাউন্ট তৈরি করুন"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;

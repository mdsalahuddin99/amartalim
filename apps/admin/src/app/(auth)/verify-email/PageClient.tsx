"use client";

import { useState } from "react";
import { Link, useSearchParams } from "@/lib/navigation";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import AuthShell from "../_shell";

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const [cooldown, setCooldown] = useState(0);

  const resend = () => {
    if (cooldown > 0) return;
    // TODO: server action — auth.resendVerification(email)
    toast({ title: "নতুন যাচাই ইমেইল পাঠানো হয়েছে" });
    setCooldown(30);
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <AuthShell title="ইমেইল যাচাই করুন" subtitle="আপনার ইমেইল ইনবক্স দেখুন">
      <div className="rounded-xl border bg-card p-6 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <MailCheck className="h-7 w-7 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          আমরা <span className="text-foreground font-medium">{email || "আপনার ইমেইল"}</span>-এ একটি যাচাই লিঙ্ক পাঠিয়েছি।
          লিঙ্কে ক্লিক করে অ্যাকাউন্ট সক্রিয় করুন।
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={resend} disabled={cooldown > 0} variant="outline" className="h-11 rounded-xl">
            {cooldown > 0 ? `আবার পাঠান (${cooldown}s)` : "আবার পাঠান"}
          </Button>
          <Link to="/login" className="text-sm text-primary hover:underline">সাইন ইন পেজে ফিরে যান</Link>
        </div>
      </div>
    </AuthShell>
  );
};

export default VerifyEmailPage;

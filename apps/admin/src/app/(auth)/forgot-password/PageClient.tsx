"use client";

import { useState } from "react";
import { Link } from "@/lib/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import AuthShell from "../_shell";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: server action — auth.requestPasswordReset(email)
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast({ title: "রিসেট লিঙ্ক পাঠানো হয়েছে" });
    }, 600);
  };

  return (
    <AuthShell
      title="পাসওয়ার্ড ভুলে গেছেন?"
      subtitle="ইমেইল দিন, আমরা রিসেট লিঙ্ক পাঠাব"
      footer={
        <>
          মনে পড়েছে?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">সাইন ইন</Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-xl border bg-card p-6 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <p className="font-medium">ইমেইল চেক করুন</p>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{email}</span>-এ একটি রিসেট লিঙ্ক পাঠানো হয়েছে। ১০ মিনিটের মধ্যে ব্যবহার করুন।
          </p>
          <Button variant="ghost" size="sm" onClick={() => setSent(false)}>আবার পাঠান</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ইমেইল</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold bg-gradient-hero hover:opacity-90">
            {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিঙ্ক পাঠান"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPasswordPage;

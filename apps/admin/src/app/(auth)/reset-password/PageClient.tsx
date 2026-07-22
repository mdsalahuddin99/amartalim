"use client";

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import AuthShell from "../_shell";

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast({ title: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষর", variant: "destructive" });
    if (password !== confirm) return toast({ title: "পাসওয়ার্ড মিলছে না", variant: "destructive" });
    setLoading(true);
    // TODO: server action — auth.resetPassword(token, password)
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 600);
  };

  if (!token) {
    return (
      <AuthShell title="অবৈধ লিঙ্ক" subtitle="রিসেট লিঙ্কটি মেয়াদোত্তীর্ণ অথবা ভুল">
        <Button onClick={() => navigate("/forgot-password")} className="w-full h-11 rounded-xl">
          নতুন লিঙ্ক চান
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="নতুন পাসওয়ার্ড সেট করুন" subtitle="শক্তিশালী একটি পাসওয়ার্ড বেছে নিন">
      {done ? (
        <div className="rounded-xl border bg-card p-6 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
          <p className="font-medium">পাসওয়ার্ড আপডেট হয়েছে</p>
          <Link to="/login"><Button className="w-full h-11 rounded-xl mt-2">সাইন ইন করুন</Button></Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">নতুন পাসওয়ার্ড</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">পাসওয়ার্ড নিশ্চিত করুন</Label>
            <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold bg-gradient-hero hover:opacity-90">
            {loading ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
};

export default ResetPasswordPage;

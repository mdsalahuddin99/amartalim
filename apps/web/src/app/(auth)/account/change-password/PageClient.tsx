"use client";

import { useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { KeyRound } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next.length < 8) return toast({ title: "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর", variant: "destructive" });
    if (form.next !== form.confirm) return toast({ title: "পাসওয়ার্ড মিলছে না", variant: "destructive" });
    setSaving(true);
    // TODO: server action — auth.changePassword
    setTimeout(() => {
      setSaving(false);
      toast({ title: "পাসওয়ার্ড পরিবর্তন হয়েছে" });
      navigate("/account");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
                <CardDescription>নিরাপত্তার জন্য নিয়মিত পাসওয়ার্ড বদলান</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">বর্তমান পাসওয়ার্ড</Label>
                <Input id="current" type="password" required value={form.current} onChange={update("current")} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next">নতুন পাসওয়ার্ড</Label>
                <Input id="next" type="password" required value={form.next} onChange={update("next")} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">নিশ্চিত করুন</Label>
                <Input id="confirm" type="password" required value={form.confirm} onChange={update("confirm")} className="h-11 rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>বাতিল</Button>
                <Button type="submit" disabled={saving} className="rounded-xl bg-gradient-hero">
                  {saving ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড আপডেট"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ChangePasswordPage;

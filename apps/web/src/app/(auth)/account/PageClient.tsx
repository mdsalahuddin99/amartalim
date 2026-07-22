"use client";

import { useState } from "react";
import { Link } from "@/lib/navigation";
import { Camera, User as UserIcon, Award } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const ProfileSettingsPage = () => {
  const [profile, setProfile] = useState({
    name: "শিক্ষার্থীর নাম",
    email: "student@example.com",
    phone: "",
    bio: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);

  const update = (k: keyof typeof profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setProfile((p) => ({ ...p, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: server action — user.updateProfile
    setTimeout(() => {
      setSaving(false);
      toast({ title: "প্রোফাইল আপডেট হয়েছে" });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">অ্যাকাউন্ট সেটিংস</h1>
          <p className="text-sm text-muted-foreground mt-1">আপনার প্রোফাইল তথ্য পরিচালনা করুন</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>প্রোফাইল তথ্য</CardTitle>
            <CardDescription>আপনার পাবলিক প্রোফাইলে দেখাবে</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback><UserIcon className="h-8 w-8" /></AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm" className="rounded-xl">
                  <Camera className="mr-2 h-4 w-4" /> ছবি পরিবর্তন
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">পূর্ণ নাম</Label>
                  <Input id="name" value={profile.name} onChange={update("name")} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল</Label>
                  <Input id="email" type="email" value={profile.email} disabled className="h-11 rounded-xl bg-muted" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">মোবাইল নম্বর</Label>
                  <Input id="phone" value={profile.phone} onChange={update("phone")} placeholder="01XXXXXXXXX" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">সংক্ষিপ্ত পরিচয়</Label>
                  <Textarea id="bio" value={profile.bio} onChange={update("bio")} rows={4} placeholder="নিজের সম্পর্কে কিছু লিখুন..." />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link to="/account/change-password" className="text-sm text-primary hover:underline">
                  পাসওয়ার্ড পরিবর্তন
                </Link>
                <Button type="submit" disabled={saving} className="rounded-xl bg-gradient-hero">
                  {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> আমার সার্টিফিকেট
            </CardTitle>
            <CardDescription>কুইজে উত্তীর্ণ হয়ে অর্জিত সকল সনদপত্র দেখুন ও ডাউনলোড করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/certificates">
              <Button variant="outline" className="rounded-xl">সার্টিফিকেট দেখুন</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfileSettingsPage;

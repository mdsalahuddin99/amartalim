"use client";

import { useState, useEffect } from "react";
import { Save, Globe, Bell, Shield, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getSiteConfig, saveSiteConfig, getAdminProfile, updateAdminProfile } from "@/server/actions/site-settings.actions";

const SectionCard = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
    <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border/50 flex items-center gap-2.5">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      <h2 className="font-semibold text-sm sm:text-base">{title}</h2>
    </div>
    <div className="p-4 sm:p-5 space-y-4">{children}</div>
  </div>
);

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  const [site, setSite] = useState({
    siteName: "Amar Talim একাডেমি",
    tagline: "বাংলায় শিখুন, বিশ্বে জয় করুন",
    contactEmail: "info@amartalim.com",
    footerText: "© ২০২৪ Amar Talim একাডেমি। সর্বস্বত্ব সংরক্ষিত।",
  });

  const [notifications, setNotifications] = useState({
    emailOnEnroll: true,
    emailOnComplete: true,
    emailOnQuizPass: false,
    dailyDigest: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAdminProfile(), getSiteConfig()])
      .then(([adminProfile, siteConfig]) => {
        if (adminProfile) {
          setProfile(prev => ({
            ...prev,
            name: adminProfile.name || "",
            email: adminProfile.email || "",
          }));
        }
        if (siteConfig) {
          setSite({
            siteName: siteConfig.siteName || site.siteName,
            tagline: siteConfig.tagline || site.tagline,
            contactEmail: siteConfig.contactEmail || site.contactEmail,
            footerText: siteConfig.footerText || site.footerText,
          });
          if (siteConfig.notifications) {
            setNotifications(siteConfig.notifications);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) return toast.error("নাম এবং ইমেইল আবশ্যক");
    setIsSaving(true);
    try {
      await updateAdminProfile({ name: profile.name, email: profile.email });
      toast.success("প্রোফাইল সংরক্ষিত হয়েছে");
    } catch {
      toast.error("প্রোফাইল সংরক্ষণ করা যায়নি");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSite = async () => {
    if (!site.siteName.trim()) return toast.error("সাইটের নাম আবশ্যক");
    setIsSaving(true);
    try {
      await saveSiteConfig({ ...site, notifications });
      toast.success("সাইট সেটিংস সংরক্ষিত হয়েছে");
    } catch {
      toast.error("সাইট সেটিংস সংরক্ষণ করা যায়নি");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await saveSiteConfig({ ...site, notifications });
      toast.success("নোটিফিকেশন সেটিংস সংরক্ষিত হয়েছে");
    } catch {
      toast.error("সংরক্ষণ করা যায়নি");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    if (!security.currentPassword || !security.newPassword) return toast.error("সকল ক্ষেত্র পূরণ করুন");
    if (security.newPassword !== security.confirmPassword) return toast.error("নতুন পাসওয়ার্ড মেলেনি");
    if (security.newPassword.length < 6) return toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success("পাসওয়ার্ড পরিবর্তন হয়েছে");
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      <span>লোড হচ্ছে...</span>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">সেটিংস</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">প্রোফাইল, সাইট এবং নিরাপত্তা ব্যবস্থাপনা</p>
      </div>

      {/* Profile */}
      <SectionCard icon={User} title="প্রোফাইল">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-lg sm:text-xl font-bold text-primary-foreground">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base">{profile.name}</div>
            <div className="text-xs text-muted-foreground">{profile.email}</div>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <Label>নাম</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>ইমেইল</Label>
            <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>ফোন</Label>
            <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>বায়ো</Label>
          <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="rounded-xl" rows={3} />
        </div>
        <Button onClick={handleSaveProfile} className="rounded-xl w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" /> প্রোফাইল সংরক্ষণ
        </Button>
      </SectionCard>

      {/* Site Settings */}
      <SectionCard icon={Globe} title="সাইট সেটিংস">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>সাইটের নাম</Label>
            <Input value={site.siteName} onChange={(e) => setSite({ ...site, siteName: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>যোগাযোগ ইমেইল</Label>
            <Input type="email" value={site.contactEmail} onChange={(e) => setSite({ ...site, contactEmail: e.target.value })} className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>ট্যাগলাইন</Label>
          <Input value={site.tagline} onChange={(e) => setSite({ ...site, tagline: e.target.value })} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>ফুটার টেক্সট</Label>
          <Textarea value={site.footerText} onChange={(e) => setSite({ ...site, footerText: e.target.value })} className="rounded-xl" rows={2} />
        </div>
        <Button onClick={handleSaveSite} className="rounded-xl w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" /> সাইট সেটিংস সংরক্ষণ
        </Button>
      </SectionCard>

      {/* Notifications */}
      <SectionCard icon={Bell} title="নোটিফিকেশন">
        <div className="space-y-4">
          {[
            { key: "emailOnEnroll" as const, label: "নতুন ভর্তি", desc: "শিক্ষার্থী কোর্সে ভর্তি হলে ইমেইল পান" },
            { key: "emailOnComplete" as const, label: "কোর্স সম্পন্ন", desc: "শিক্ষার্থী কোর্স শেষ করলে ইমেইল পান" },
            { key: "emailOnQuizPass" as const, label: "কুইজ উত্তীর্ণ", desc: "শিক্ষার্থী কুইজে পাস করলে ইমেইল পান" },
            { key: "dailyDigest" as const, label: "দৈনিক সারাংশ", desc: "প্রতিদিনের কার্যক্রমের সারাংশ" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSaveNotifications} variant="outline" className="rounded-xl w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" /> নোটিফিকেশন সংরক্ষণ
        </Button>
      </SectionCard>

      {/* Security */}
      <SectionCard icon={Shield} title="নিরাপত্তা">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>বর্তমান পাসওয়ার্ড</Label>
            <Input type="password" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} className="rounded-xl" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>নতুন পাসওয়ার্ড</Label>
              <Input type="password" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} className="rounded-xl" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>পাসওয়ার্ড নিশ্চিত করুন</Label>
              <Input type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} className="rounded-xl" placeholder="••••••••" />
            </div>
          </div>
        </div>
        <Button onClick={handleChangePassword} variant="destructive" className="rounded-xl w-full sm:w-auto">
          <Shield className="mr-2 h-4 w-4" /> পাসওয়ার্ড পরিবর্তন
        </Button>
      </SectionCard>
    </div>
  );
};

export default AdminSettings;

"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import { MenuBuilder } from "./MenuBuilder";
import { saveHeaderFooterSettings } from "@/server/actions/settings";

export default function PageClient({ initialSettings }: { initialSettings: any }) {
  const [isSaving, setIsSaving] = useState(false);

  // Example state for Header
  const [headerLinks, setHeaderLinks] = useState(initialSettings?.headerLinks || []);

  // Example state for Footer
  const [footerLogo, setFooterLogo] = useState<string | null>(initialSettings?.footerLogo || null);
  const [footerAbout, setFooterAbout] = useState(initialSettings?.footerAbout || "");
  
  const [socialLinks, setSocialLinks] = useState(initialSettings?.socialLinks || {
    facebook: "",
    youtube: "",
    twitter: "",
  });

  const [footerSections, setFooterSections] = useState(initialSettings?.footerSections || []);
  const [footerQuickLinks, setFooterQuickLinks] = useState(initialSettings?.footerQuickLinks || []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        headerLinks,
        footerLogo,
        footerAbout,
        socialLinks,
        footerSections,
        footerQuickLinks,
      };
      await saveHeaderFooterSettings(data);
      toast({ title: "সফলভাবে সেভ করা হয়েছে!" });
    } catch (e) {
      toast({ title: "সেভ করতে সমস্যা হয়েছে!", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFooterLogo(url);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">হেডার ও ফুটার সেটিংস</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              ওয়েবসাইটের মেইন নেভিগেশন মেনু এবং ফুটারের তথ্য পরিবর্তন করুন।
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="rounded-xl w-full sm:w-auto bg-gradient-hero">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "সেভ হচ্ছে..." : "পরিবর্তন সেভ করুন"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* Header Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <h2 className="text-xl font-bold">হেডার সেটিংস (Header)</h2>
            </div>
            <MenuBuilder links={headerLinks as any} setLinks={setHeaderLinks as any} title="হেডার মেনু (Navigation)" description="ওয়েবসাইটের মেইন মেনু আইটেমগুলো নির্ধারণ করুন।" />
          </div>

          {/* Footer Settings */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <h2 className="text-xl font-bold">ফুটার সেটিংস (Footer)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-3">লোগো (Logo)</h2>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl border border-dashed flex items-center justify-center bg-secondary/20 overflow-hidden">
                      {footerLogo ? (
                        <img src={footerLogo} alt="Logo preview" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground text-center px-2">লোগো নেই</span>
                      )}
                    </div>
                    <div>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="text-sm rounded-xl cursor-pointer file:cursor-pointer file:bg-secondary file:text-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3" 
                      />
                      <p className="text-xs text-muted-foreground mt-2">Recommended: PNG or SVG with transparent background</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-3">ফুটার বিবরণ (About)</h2>
                  <textarea 
                    className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                    value={footerAbout}
                    onChange={(e) => setFooterAbout(e.target.value)}
                    placeholder="আমাদের সম্পর্কে কিছু লিখুন..."
                  />
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-4">সোশ্যাল মিডিয়া (Social Links)</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">ফেসবুক পেজ ইউআরএল</label>
                      <Input 
                        value={socialLinks.facebook}
                        onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                        placeholder="https://facebook.com/..."
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">ইউটিউব চ্যানেল</label>
                      <Input 
                        value={socialLinks.youtube}
                        onChange={(e) => setSocialLinks({...socialLinks, youtube: e.target.value})}
                        placeholder="https://youtube.com/..."
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">টুইটার / এক্স (Twitter/X)</label>
                      <Input 
                        value={socialLinks.twitter}
                        onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                        placeholder="https://twitter.com/..."
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 mt-8">
              <MenuBuilder links={footerSections as any} setLinks={setFooterSections as any} title="ফুটার মেনু ১: বিভাগ (Sections)" description="ফুটারের 'বিভাগ' কলামের লিংকগুলো সাজান।" />
              <MenuBuilder links={footerQuickLinks as any} setLinks={setFooterQuickLinks as any} title="ফুটার মেনু ২: দ্রুত লিংক (Quick Links)" description="ফুটারের 'দ্রুত লিংক' কলামের লিংকগুলো সাজান।" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

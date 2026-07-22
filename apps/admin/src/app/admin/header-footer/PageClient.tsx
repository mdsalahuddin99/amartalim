"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";

export default function PageClient() {
  const [isSaving, setIsSaving] = useState(false);

  // Example state for Header
  const [headerLinks, setHeaderLinks] = useState([
    { id: 1, label: "হোম", url: "/" },
    { id: 2, label: "কোর্সসমূহ", url: "/courses" },
    { id: 3, label: "লাইব্রেরি", url: "/library" },
    { id: 4, label: "ব্লগ", url: "/blogs" },
  ]);

  // Example state for Footer
  const [footerAbout, setFooterAbout] = useState("আমার তালিম একটি উন্মুক্ত ইসলামিক জ্ঞানভাণ্ডার। এখানে আপনি পাবেন কুরআন, হাদিস, ফিকহ এবং আধুনিক প্রযুক্তির সমন্বয়ে যুগোপযোগী শিক্ষা।");
  const [contactInfo, setContactInfo] = useState({
    email: "info@amartalim.com",
    phone: "+880 1234 567890",
    address: "ঢাকা, বাংলাদেশ",
  });
  
  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://facebook.com/amartalim",
    youtube: "https://youtube.com/amartalim",
    twitter: "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      toast({ title: "সফলভাবে সেভ করা হয়েছে!" });
      setIsSaving(false);
    }, 1000);
  };

  const addHeaderLink = () => {
    setHeaderLinks([...headerLinks, { id: Date.now(), label: "", url: "" }]);
  };

  const removeHeaderLink = (id: number) => {
    setHeaderLinks(headerLinks.filter(l => l.id !== id));
  };

  const updateHeaderLink = (id: number, field: string, value: string) => {
    setHeaderLinks(headerLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header Settings */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold">হেডার মেনু (Navigation)</h2>
              <p className="text-sm text-muted-foreground mb-4">ওয়েবসাইটের উপরের দিকের মেনু আইটেমগুলো নির্ধারণ করুন।</p>
              
              <div className="space-y-3">
                {headerLinks.map((link, index) => (
                  <div key={link.id} className="flex items-center gap-2 bg-background border rounded-xl p-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <Input 
                        placeholder="মেনুর নাম (উদাঃ হোম)" 
                        value={link.label}
                        onChange={(e) => updateHeaderLink(link.id, 'label', e.target.value)}
                        className="h-9"
                      />
                      <Input 
                        placeholder="ইউআরএল (উদাঃ /about)" 
                        value={link.url}
                        onChange={(e) => updateHeaderLink(link.id, 'url', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeHeaderLink(link.id)} className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addHeaderLink} className="mt-4 rounded-xl border-dashed w-full">
                <Plus className="h-4 w-4 mr-1" /> নতুন মেনু যোগ করুন
              </Button>
            </div>
          </div>

          {/* Footer Settings */}
          <div className="space-y-6">
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-semibold">ফুটার বিবরণ (About)</h2>
                <p className="text-sm text-muted-foreground mb-3">ফুটারের বাম পাশে ওয়েবসাইটের সংক্ষিপ্ত পরিচিতি।</p>
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
                <h2 className="text-lg font-semibold mb-4">যোগাযোগের তথ্য (Contact)</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">ইমেইল এড্রেস</label>
                    <Input 
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                      placeholder="info@example.com"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">ফোন নম্বর</label>
                    <Input 
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                      placeholder="+880..."
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">ঠিকানা</label>
                    <Input 
                      value={contactInfo.address}
                      onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                      placeholder="অফিসের ঠিকানা..."
                      className="rounded-xl"
                    />
                  </div>
                </div>
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
        </div>
      </div>
    </AdminLayout>
  );
}

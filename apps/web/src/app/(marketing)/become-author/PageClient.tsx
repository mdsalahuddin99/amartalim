"use client";

import { useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import PageShell from "@/components/shared/page-shell";
import SharedNavbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { EXPERTISE_OPTIONS } from "@/types/author";
import { authorApplicationSchema } from "@/lib/validators/author";
import { applyAsAuthor } from "@/server/actions/author.actions";
import { CloudinaryUploader } from "@/components/admin/CloudinaryUploader";

type Errors = Partial<Record<string, string>>;

const BecomeAuthorPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    bio: "",
    shortBio: "",
    facebook: "",
    twitter: "",
    website: "",
  });
  const [expertise, setExpertise] = useState<string[]>([]);

  const toggleExpertise = (tag: string) =>
    setExpertise((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = { ...form, expertise };
    const parsed = authorApplicationSchema.safeParse(payload);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: Errors = {};
      Object.entries(flat).forEach(([k, v]) => {
        if (v && v[0]) next[k] = v[0];
      });
      setErrors(next);
      return;
    }

    setSubmitting(true);
    const res = await applyAsAuthor(parsed.data);
    setSubmitting(false);

    if (!res.ok) {
      toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SharedNavbar showAuth />
        
        <PageShell>
          <Card className="max-w-xl mx-auto p-10 text-center">
            <CheckCircle2 className="h-14 w-14 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3">আপনার আবেদন পেয়েছি</h1>
            <p className="text-muted-foreground leading-relaxed">
              জাযাকাল্লাহু খাইরান। আমাদের সম্পাদনা দল আপনার আবেদন
              পর্যালোচনা করবেন। শীঘ্রই ইমেইলে যোগাযোগ করা হবে ইনশাআল্লাহ।
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <Button onClick={() => navigate("/")}>হোমে ফিরে যান</Button>
              <Button variant="outline" onClick={() => navigate("/blogs")}>ব্লগ পড়ুন</Button>
            </div>
          </Card>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedNavbar showAuth />
      
      <PageShell>
        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">লেখক হিসেবে আবেদন</h1>
          <p className="text-muted-foreground leading-relaxed">
            আপনার দক্ষতা ও লেখার অভিজ্ঞতা শেয়ার করুন। আবেদন অনুমোদিত হলে
            আপনার নামে প্রকাশিত লেখাগুলোর একটি পাবলিক প্রোফাইল তৈরি হবে।
          </p>
        </header>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Basic */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold">মূল তথ্য</h2>

            <div className="space-y-1.5">
              <Label htmlFor="name">নাম *</Label>
              <Input id="name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">ইমেইল *</Label>
                <Input id="email" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">ফোন</Label>
                <Input id="phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <CloudinaryUploader
                label="প্রোফাইল ছবি"
                value={form.avatar}
                onChange={(url) => setForm({ ...form, avatar: url })}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                আপনার একটি সুন্দর ছবি আপলোড করুন
              </p>
            </div>
          </Card>

          {/* Bio */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold">পরিচয়</h2>

            <div className="space-y-1.5">
              <Label htmlFor="shortBio">সংক্ষিপ্ত পরিচয় (২-৩ লাইন)</Label>
              <Textarea id="shortBio" rows={2} maxLength={220}
                value={form.shortBio}
                onChange={(e) => setForm({ ...form, shortBio: e.target.value })} />
              <p className="text-xs text-muted-foreground">
                কার্ডে ও পোস্টের নিচে দেখানো হবে।
              </p>
              {errors.shortBio && <p className="text-xs text-destructive">{errors.shortBio}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">বিস্তারিত পরিচয় *</Label>
              <Textarea id="bio" rows={6}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
            </div>

            <div className="space-y-2">
              <Label>দক্ষতার ক্ষেত্র *</Label>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.map((tag) => {
                  const active = expertise.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleExpertise(tag)}
                      className="focus:outline-none"
                    >
                      <Badge
                        variant={active ? "default" : "outline"}
                        className="cursor-pointer text-sm py-1.5 px-3"
                      >
                        {tag}
                      </Badge>
                    </button>
                  );
                })}
              </div>
              {errors.expertise && <p className="text-xs text-destructive">{errors.expertise}</p>}
            </div>
          </Card>

          {/* Social */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold">সোশ্যাল লিংক (ঐচ্ছিক)</h2>
            <div className="space-y-1.5">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" placeholder="https://facebook.com/..."
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
              {errors.facebook && <p className="text-xs text-destructive">{errors.facebook}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input id="twitter" placeholder="https://x.com/..."
                value={form.twitter}
                onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
              {errors.twitter && <p className="text-xs text-destructive">{errors.twitter}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">ওয়েবসাইট</Label>
              <Input id="website" placeholder="https://..."
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })} />
              {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
            </div>
          </Card>

          <Button type="submit" disabled={submitting} size="lg" className="w-full sm:w-auto">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            আবেদন জমা দিন
          </Button>
        </form>
      </PageShell>
    </div>
  );
};

export default BecomeAuthorPage;

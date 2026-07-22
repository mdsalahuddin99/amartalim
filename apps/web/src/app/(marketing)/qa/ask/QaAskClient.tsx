"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createQaPost } from "@/server/actions/qa.actions";
import type { QaCategory } from "@prisma/client";

export default function QaAskClient({ categories }: { categories: QaCategory[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: "",
    questionDetails: "",
    categoryId: "",
    askerName: "",
    askerEmail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      return toast.error("অনুগ্রহ করে প্রশ্নের মূল বিষয়টি লিখুন।");
    }

    setIsSubmitting(true);
    try {
      const res = await createQaPost(form);
      if (res.ok) {
        setSuccess(true);
      } else {
        toast.error(res.error || "প্রশ্ন জমা দিতে সমস্যা হয়েছে।");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">জাযাকাল্লাহু খাইরান!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          আপনার প্রশ্নটি সফলভাবে জমা দেওয়া হয়েছে। আমাদের মুফতি সাহেবগণ শীঘ্রই আপনার প্রশ্নের উত্তর প্রদান করবেন ইনশাআল্লাহ।
        </p>
        <div className="pt-6">
          <Button onClick={() => router.push("/qa")} variant="outline">
            ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-base font-semibold">প্রশ্নের বিষয় (সংক্ষেপে) <span className="text-destructive">*</span></Label>
        <Input 
          placeholder="যেমন: সফর অবস্থায় নামাজ কসর করার বিধান" 
          value={form.title}
          onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">বিস্তারিত প্রশ্ন</Label>
        <Textarea 
          placeholder="আপনার প্রশ্নটি বিস্তারিতভাবে লিখুন..." 
          rows={6}
          value={form.questionDetails}
          onChange={(e) => setForm(p => ({ ...p, questionDetails: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">ক্যাটাগরি (ঐচ্ছিক)</Label>
        <Select 
          value={form.categoryId || "__none__"} 
          onValueChange={(v) => setForm(p => ({ ...p, categoryId: v === "__none__" ? "" : v }))}
        >
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="ক্যাটাগরি বাছাই করুন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">— কোনোটি নয় —</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
        <div className="space-y-2">
          <Label className="text-base font-semibold">আপনার নাম (ঐচ্ছিক)</Label>
          <Input 
            placeholder="নাম লিখুন" 
            value={form.askerName}
            onChange={(e) => setForm(p => ({ ...p, askerName: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-base font-semibold">আপনার ইমেইল (ঐচ্ছিক)</Label>
          <Input 
            type="email"
            placeholder="email@example.com" 
            value={form.askerEmail}
            onChange={(e) => setForm(p => ({ ...p, askerEmail: e.target.value }))}
          />
          <p className="text-[11px] text-muted-foreground">উত্তর পাবলিশ হলে আপনাকে ইমেইলে জানানো হবে (ভবিষ্যতে)।</p>
        </div>
      </div>

      <div className="pt-6">
        <Button type="submit" size="lg" className="w-full sm:w-auto px-10" disabled={isSubmitting}>
          {isSubmitting ? (
             <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> জমা হচ্ছে...</>
          ) : "প্রশ্ন জমা দিন"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Plus, Edit, Eye, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createQaPost, updateQaPost } from "@/server/actions/qa.actions";
import type { QaCategory, Mufti, QaStatus } from "@prisma/client";


const STATUS_LABEL: Record<QaStatus, string> = {
  PENDING: "অপেক্ষমাণ",
  ANSWERED: "উত্তরিত",
  PUBLISHED: "প্রকাশিত",
  REJECTED: "প্রত্যাখ্যাত",
};

const STATUS_VARIANT: Record<QaStatus, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  ANSWERED: "outline",
  PUBLISHED: "default",
  REJECTED: "destructive",
};

export default function MuftiQaPosts({ 
  initialPosts, categories, currentMufti 
}: { 
  initialPosts: any[], categories: QaCategory[], currentMufti: Mufti 
}) {
  const router = useRouter();
  const [tab, setTab] = useState<QaStatus | "ALL">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  
  // Editor modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    questionDetails: "",
    answer: "",
    categoryId: "",
    tagsText: "",
  });

  const filtered = useMemo(() => {
    return initialPosts.filter(p => tab === "ALL" ? true : p.status === tab);
  }, [initialPosts, tab]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: initialPosts.length, PENDING: 0, ANSWERED: 0, PUBLISHED: 0, REJECTED: 0 };
    initialPosts.forEach((p) => { c[p.status] += 1; });
    return c;
  }, [initialPosts]);

  const openCreateForm = () => {
    setEditingPost(null);
    setFormData({
      title: "", questionDetails: "", answer: "", categoryId: "", tagsText: ""
    });
    setIsFormOpen(true);
  };

  const openEditForm = (p: any) => {
    setEditingPost(p);
    setFormData({ 
      title: p.title, 
      questionDetails: p.questionDetails || "", 
      answer: p.answer || "", 
      categoryId: p.categoryId || "", 
      tagsText: p.tags?.join(", ") || "",
    });
    setIsFormOpen(true);
  };

  const submitForm = async () => {
    setBusyId("form");
    try {
      const tags = formData.tagsText.split(",").map(t => t.trim()).filter(Boolean);
      const payload: any = {
        title: formData.title,
        questionDetails: formData.questionDetails,
        answer: formData.answer,
        categoryId: formData.categoryId || null,
        muftiId: currentMufti.id, // Enforce own mufti ID
        status: "ANSWERED" as QaStatus, // Enforce ANSWERED status
        tags,
      };

      if (editingPost) {
        const res = await updateQaPost(editingPost.id, payload);
        if (res.ok) {
          toast({ title: "আপডেট সফল হয়েছে", description: "উত্তর সংরক্ষিত হয়েছে।" });
          setIsFormOpen(false);
          router.refresh();
        } else {
          toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
        }
      } else {
        const res = await createQaPost({
          title: payload.title,
          questionDetails: payload.questionDetails,
          categoryId: payload.categoryId,
        });
        if (res.ok && res.data) {
          // Immediately update answer & status
          await updateQaPost(res.data.id, {
            answer: payload.answer,
            muftiId: payload.muftiId,
            status: payload.status,
            tags: payload.tags,
          });
          toast({ title: "নতুন জিজ্ঞাসা যোগ করা হয়েছে" });
          setIsFormOpen(false);
          router.refresh();
        } else {
          toast({ title: "ত্রুটি", description: res.error || "Failed to create", variant: "destructive" });
        }
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">আপনার প্রশ্নোত্তর</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            আপনাকে অ্যাসাইন করা প্রশ্নগুলোর উত্তর দিন।
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" /> নতুন প্রশ্ন যুক্ত করুন
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          {(["ALL", "PENDING", "ANSWERED", "PUBLISHED"] as (QaStatus | "ALL")[]).map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs sm:text-sm">
              {s === "ALL" ? "সকল" : STATUS_LABEL[s]} ({counts[s]})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {filtered.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              কোনো ডেটা পাওয়া যায়নি।
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => {
                const isBusy = busyId === p.id;
                return (
                  <Card key={p.id} className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold truncate">{p.title}</h3>
                          <Badge variant={STATUS_VARIANT[p.status as QaStatus]} className="text-[10px]">
                            {STATUS_LABEL[p.status as QaStatus]}
                          </Badge>
                          {p.category && <Badge variant="outline" className="text-[10px]">{p.category.name}</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-[800px]">
                          {p.questionDetails || "বিস্তারিত নেই"}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                          {p.askerName && <span>প্রশ্নকারী: {p.askerName}</span>}
                          {p.asker?.name && <span>প্রশ্নকারী: {p.asker.name}</span>}
                          <span>তারিখ: {new Date(p.createdAt).toLocaleDateString("bn-BD")}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:shrink-0">
                        <Button size="sm" variant="outline" disabled={isBusy} onClick={() => openEditForm(p)}>
                          <Edit className="h-3.5 w-3.5 mr-1" /> {p.status === "PENDING" ? "উত্তর দিন" : "এডিট"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Editor Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "প্রশ্নোত্তর সম্পাদনা" : "নতুন প্রশ্নোত্তর যোগ করুন"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <Label>প্রশ্ন (টাইটেল) *</Label>
                <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>বিস্তারিত প্রশ্ন</Label>
                <Textarea rows={4} value={formData.questionDetails} onChange={(e) => setFormData(p => ({ ...p, questionDetails: e.target.value }))} readOnly={!!editingPost} className={editingPost ? "bg-muted" : ""} />
              </div>
              <div className="space-y-1.5">
                <Label>শরয়ি সমাধান (উত্তর)</Label>
                <Textarea rows={8} value={formData.answer} onChange={(e) => setFormData(p => ({ ...p, answer: e.target.value }))} placeholder="উত্তর লিখুন..." />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>ক্যাটাগরি</Label>
                <Select value={formData.categoryId || "__none__"} onValueChange={(v) => setFormData(p => ({ ...p, categoryId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— কোনোটি নয় —</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)</Label>
                <Input value={formData.tagsText} onChange={(e) => setFormData(p => ({ ...p, tagsText: e.target.value }))} placeholder="নামাজ, রোজা..." />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>বাতিল</Button>
            <Button onClick={submitForm} disabled={busyId === "form"}>
              {busyId === "form" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              সাবমিট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}

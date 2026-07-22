"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Mail, Loader2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  createMufti, updateMufti, deleteMufti
} from "@/server/actions/mufti.actions";
import type { Mufti } from "@prisma/client";
import { Link } from "@/lib/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" });

export default function AdminMuftis({ initialMuftis }: { initialMuftis: Mufti[] }) {
  const router = useRouter();
  const [muftis, setMuftis] = useState<Mufti[]>(initialMuftis);
  const [busyId, setBusyId] = useState<string | null>(null);
  
  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMufti, setEditingMufti] = useState<Mufti | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", bio: "", avatar: "", shortBio: "", expertise: "" });

  const openCreateForm = () => {
    setEditingMufti(null);
    setFormData({ name: "", email: "", bio: "", avatar: "", shortBio: "", expertise: "" });
    setIsFormOpen(true);
  };

  const openEditForm = (m: Mufti) => {
    setEditingMufti(m);
    setFormData({ 
      name: m.name, 
      email: m.email || "", 
      bio: m.bio, 
      avatar: m.avatar || "",
      shortBio: m.shortBio || "",
      expertise: m.expertise.join(", ")
    });
    setIsFormOpen(true);
  };

  const submitForm = async () => {
    setBusyId("form");
    try {
      const expertiseArr = formData.expertise.split(",").map(e => e.trim()).filter(Boolean);
      
      const payload = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        avatar: formData.avatar,
        shortBio: formData.shortBio,
        expertise: expertiseArr,
      };

      if (editingMufti) {
        const res = await updateMufti(editingMufti.id, payload);
        if (res.ok) {
          toast({ title: "আপডেট সফল হয়েছে" });
          setIsFormOpen(false);
          router.refresh();
        } else {
          toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
        }
      } else {
        const res = await createMufti(payload);
        if (res.ok) {
          toast({ title: "নতুন মুফতি যোগ করা হয়েছে" });
          setIsFormOpen(false);
          router.refresh();
        } else {
          toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
        }
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে মুছে ফেলতে চান?")) return;
    setBusyId(id);
    const res = await deleteMufti(id);
    setBusyId(null);
    if (res.ok) {
      toast({ title: "মুছে ফেলা হয়েছে" });
      router.refresh();
    } else {
      toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">মুফতি সাহেবগণ</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            আপনার জিজ্ঞাসার উত্তর দেওয়ার জন্য মুফতি সাহেবদের তালিকা।
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" /> নতুন মুফতি যোগ করুন
        </Button>
      </div>

      {muftis.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          কোন মুফতি সাহেবের প্রোফাইল নেই।
        </Card>
      ) : (
        <div className="space-y-3">
          {muftis.map((m) => {
            const initials = m.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("");
            const isBusy = busyId === m.id;
            return (
              <Card key={m.id} className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <Avatar className="h-12 w-12 shrink-0">
                    {m.avatar ? <AvatarImage src={m.avatar} alt={m.name} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{m.name}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      {m.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>}
                      <span>যোগদানের তারিখ: {formatDate(m.createdAt.toString())}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:shrink-0">
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/qa/muftis/${m.slug}`}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> প্রোফাইল
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" disabled={isBusy} onClick={() => openEditForm(m)}>
                      <Edit className="h-3.5 w-3.5 mr-1" /> এডিট
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" disabled={isBusy} onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMufti ? "মুফতি আপডেট করুন" : "নতুন মুফতি সাহেব"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>নাম *</Label>
              <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>ইমেইল</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>দক্ষতা (কমা দিয়ে আলাদা করুন)</Label>
              <Input value={formData.expertise} onChange={(e) => setFormData(p => ({ ...p, expertise: e.target.value }))} placeholder="ফিকহ, তাফসির..." />
            </div>
            <div className="space-y-1.5">
              <Label>সংক্ষিপ্ত পরিচিতি (Short Bio)</Label>
              <Input value={formData.shortBio} onChange={(e) => setFormData(p => ({ ...p, shortBio: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>বিস্তারিত পরিচিতি (Bio) *</Label>
              <Textarea rows={3} value={formData.bio} onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>ছবি (Avatar URL)</Label>
              <Input value={formData.avatar} onChange={(e) => setFormData(p => ({ ...p, avatar: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>বাতিল</Button>
            <Button onClick={submitForm} disabled={busyId === "form"}>
              {busyId === "form" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              সংরক্ষণ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}

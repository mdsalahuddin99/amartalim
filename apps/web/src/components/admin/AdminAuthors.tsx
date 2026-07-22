import { useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Mail, Phone, ShieldOff, XCircle, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  approveAuthor, rejectAuthor, suspendAuthor, createAuthorAdmin, updateAuthorAdmin, deleteAuthorAdmin
} from "@/server/actions/author.actions";
import type { AuthorStatus } from "@/types/author";
import type { Author } from "@prisma/client";
import { slugify } from "@/types/blog"; // You can use slugify for author slug too

const STATUS_LABEL: Record<AuthorStatus, string> = {
  PENDING: "অপেক্ষমাণ",
  APPROVED: "অনুমোদিত",
  REJECTED: "প্রত্যাখ্যাত",
  SUSPENDED: "স্থগিত",
};

const STATUS_VARIANT: Record<AuthorStatus, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  SUSPENDED: "outline",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" });

export default function AdminAuthors({ initialAuthors }: { initialAuthors: Author[] }) {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>(initialAuthors);
  const [tab, setTab] = useState<AuthorStatus>("APPROVED");
  const [rejecting, setRejecting] = useState<Author | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  
  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", bio: "", slug: "", avatar: "" });

  const filtered = useMemo(
    () => authors.filter((a) => a.status === tab),
    [authors, tab],
  );

  const counts = useMemo(() => {
    const c: Record<AuthorStatus, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0, SUSPENDED: 0 };
    authors.forEach((a) => { c[a.status as AuthorStatus] += 1; });
    return c;
  }, [authors]);

  const updateLocal = (id: string, patch: Partial<Author>) => {
    setAuthors((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const handleApprove = async (id: string) => {
    setBusyId(id);
    const res = await approveAuthor(id);
    setBusyId(null);
    if (res.ok) {
      toast({ title: "অনুমোদিত হয়েছে" });
      updateLocal(id, { status: "APPROVED" });
      router.refresh();
    } else toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
  };

  const handleSuspend = async (id: string) => {
    setBusyId(id);
    const res = await suspendAuthor(id);
    setBusyId(null);
    if (res.ok) {
      toast({ title: "স্থগিত করা হয়েছে" });
      updateLocal(id, { status: "SUSPENDED" });
      router.refresh();
    }
  };

  const submitReject = async () => {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    const res = await rejectAuthor(rejecting.id, { reviewNote });
    setBusyId(null);
    if (res.ok) {
      toast({ title: "প্রত্যাখ্যান করা হয়েছে" });
      updateLocal(rejecting.id, { status: "REJECTED", reviewNote });
      setRejecting(null);
      setReviewNote("");
      router.refresh();
    } else {
      toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই লেখককে মুছে ফেলতে চান?")) return;
    setBusyId(id);
    const res = await deleteAuthorAdmin(id);
    setBusyId(null);
    if (res.ok) {
      toast({ title: "লেখক মুছে ফেলা হয়েছে" });
      setAuthors(prev => prev.filter(a => a.id !== id));
      router.refresh();
    } else {
      toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
    }
  };

  const openCreateForm = () => {
    setEditingAuthor(null);
    setFormData({ name: "", email: "", bio: "", slug: "", avatar: "" });
    setIsFormOpen(true);
  };

  const openEditForm = (a: Author) => {
    setEditingAuthor(a);
    setFormData({ name: a.name, email: a.email, bio: a.bio, slug: a.slug, avatar: a.avatar || "" });
    setIsFormOpen(true);
  };

  const submitForm = async () => {
    setBusyId("form");
    try {
      if (editingAuthor) {
        const res = await updateAuthorAdmin(editingAuthor.id, formData);
        if (res.ok && res.data) {
          updateLocal(editingAuthor.id, res.data);
          toast({ title: "আপডেট সফল হয়েছে" });
          setIsFormOpen(false);
        } else {
          toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
        }
      } else {
        const res = await createAuthorAdmin(formData);
        if (res.ok && res.data) {
          setAuthors([res.data, ...authors]);
          toast({ title: "নতুন লেখক যোগ করা হয়েছে" });
          setIsFormOpen(false);
          setTab("APPROVED");
        } else {
          toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
        }
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">লেখক ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            আবেদন পর্যালোচনা, অনুমোদন, এবং ম্যানুয়ালি লেখক তৈরি করুন।
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" /> নতুন লেখক যোগ করুন
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AuthorStatus)}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          {(["APPROVED", "PENDING", "REJECTED", "SUSPENDED"] as AuthorStatus[]).map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs sm:text-sm">
              {STATUS_LABEL[s]} ({counts[s]})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {filtered.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              এই অবস্থায় কোনো লেখক নেই।
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => {
                const initials = a.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("");
                const isBusy = busyId === a.id;
                return (
                  <Card key={a.id} className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                      <Avatar className="h-12 w-12 shrink-0">
                        {a.avatar ? <AvatarImage src={a.avatar} alt={a.name} /> : null}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold truncate">{a.name}</h3>
                          <Badge variant={STATUS_VARIANT[a.status as AuthorStatus]} className="text-[10px]">
                            {STATUS_LABEL[a.status as AuthorStatus]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{a.email}</span>
                          {a.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{a.phone}</span>}
                          <span>তারিখ: {formatDate(a.createdAt.toString())}</span>
                        </div>
                        {a.status === "REJECTED" && a.reviewNote && (
                          <p className="text-xs mt-2 text-destructive">কারণ: {a.reviewNote}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 lg:shrink-0">
                        {a.status === "APPROVED" && (
                          <Button asChild size="sm" variant="ghost">
                            <Link to={`/author/${a.slug}`}>
                              <ExternalLink className="h-3.5 w-3.5 mr-1" /> প্রোফাইল
                            </Link>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" disabled={isBusy} onClick={() => openEditForm(a)}>
                          <Edit className="h-3.5 w-3.5 mr-1" /> এডিট
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" disabled={isBusy} onClick={() => handleDelete(a.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        {a.status !== "APPROVED" && (
                          <Button size="sm" disabled={isBusy} onClick={() => handleApprove(a.id)}>
                            {isBusy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                            অনুমোদন
                          </Button>
                        )}
                        {a.status === "PENDING" && (
                          <Button size="sm" variant="destructive" disabled={isBusy}
                            onClick={() => { setRejecting(a); setReviewNote(""); }}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> প্রত্যাখ্যান
                          </Button>
                        )}
                        {a.status === "APPROVED" && (
                          <Button size="sm" variant="outline" disabled={isBusy} onClick={() => handleSuspend(a.id)}>
                            <ShieldOff className="h-3.5 w-3.5 mr-1" /> স্থগিত
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>আবেদন প্রত্যাখ্যান</DialogTitle>
            <DialogDescription>
              {rejecting?.name}-কে কেন প্রত্যাখ্যান করা হচ্ছে তা সংক্ষেপে লিখুন।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reviewNote">কারণ *</Label>
            <Textarea id="reviewNote" rows={4} value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>বাতিল</Button>
            <Button variant="destructive" onClick={submitReject} disabled={!!busyId}>
              {busyId && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              প্রত্যাখ্যান নিশ্চিত করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAuthor ? "লেখক আপডেট করুন" : "নতুন লেখক তৈরি করুন"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>নাম *</Label>
              <Input value={formData.name} onChange={(e) => {
                  const val = e.target.value;
                  setFormData(p => ({ ...p, name: val, slug: !editingAuthor ? slugify(val) : p.slug }));
              }} />
            </div>
            <div className="space-y-1.5">
              <Label>ইমেইল *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>স্লাগ *</Label>
              <Input value={formData.slug} onChange={(e) => setFormData(p => ({ ...p, slug: slugify(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>পরিচিতি (Bio) *</Label>
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
  );
}

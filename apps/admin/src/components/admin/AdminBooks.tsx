"use client";

import { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Save, ArrowLeft, Search, BookOpen, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CloudinaryUploader from "./CloudinaryUploader";
import { toast } from "@/hooks/use-toast";
import SmartImage from "@/components/shared/SmartImage";
import { useRouter } from "next/navigation";
import { createBook, updateBook, deleteBook } from "@/server/actions/book.actions";

// Define local types matching Prisma structure
type BookCategory = any;
type BookChapter = any;
type BookRecord = any;

const empty = (): Partial<BookRecord> => ({
  title: "", author: "", cover: "", categoryId: "", subcategory: "",
  description: "", pages: 0, rating: 0, readers: 0,
  publishDate: String(new Date().getFullYear()), language: "বাংলা",
  isFree: true, status: "published", chapters: [],
});

const AdminBooks = ({ initialBooks, categories }: { initialBooks: BookRecord[], categories: BookCategory[] }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<BookRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Partial<BookRecord>>(empty());
  const [confirmDelete, setConfirmDelete] = useState<BookRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roots = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const subcats = useMemo(() => {
    if (!draft.categoryId) return [];
    return categories.filter((c) => c.parentId === draft.categoryId);
  }, [categories, draft.categoryId]);

  const filtered = useMemo(() => {
    return initialBooks
      .filter((b) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      });
  }, [initialBooks, query]);

  const openCreate = () => { setDraft(empty()); setEditing(null); setCreating(true); };
  const openEdit = (b: BookRecord) => { setDraft({ ...b, categoryId: b.categoryId || "", subcategory: b.subcategory || "" }); setCreating(false); setEditing(b); };
  const close = () => { setCreating(false); setEditing(null); };

  const validate = (): boolean => {
    if (!draft.title?.trim()) { toast({ title: "শিরোনাম প্রয়োজন", variant: "destructive" }); return false; }
    if (!draft.author?.trim()) { toast({ title: "লেখকের নাম প্রয়োজন", variant: "destructive" }); return false; }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (editing) {
        const res = await updateBook(editing.id, draft);
        if (!res.ok) throw new Error(res.error || "Failed to update");
        toast({ title: "বই আপডেট হয়েছে" });
      } else {
        const res = await createBook(draft);
        if (!res.ok) throw new Error(res.error || "Failed to create");
        toast({ title: "নতুন বই যোগ হয়েছে" });
      }
      close();
      router.refresh();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Error saving book", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (b: BookRecord) => {
    const next = (b.status ?? "published") === "published" ? "draft" : "published";
    try {
      await updateBook(b.id, { status: next });
      toast({ title: next === "published" ? "প্রকাশিত হয়েছে" : "ড্রাফট করা হয়েছে" });
      router.refresh();
    } catch (err) {
      toast({ title: "Error toggling status", variant: "destructive" });
    }
  };

  const addChapter = () => {
    setDraft({ ...draft, chapters: [...(draft.chapters || []), { title: "নতুন অধ্যায়", content: "" }] });
  };
  const updateChapter = (i: number, patch: Partial<BookChapter>) => {
    const next = [...(draft.chapters || [])];
    next[i] = { ...next[i], ...patch };
    setDraft({ ...draft, chapters: next });
  };
  const removeChapter = (i: number) => {
    setDraft({ ...draft, chapters: (draft.chapters || []).filter((_, j) => j !== i) });
  };

  // ───────── Editor View ─────────
  if (creating || editing) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50 sticky top-0 bg-background z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={close} className="shrink-0" disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
                {editing ? "বই এডিট" : "নতুন বই"}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {draft.title || "শিরোনামহীন"} · {(draft.chapters || []).length} অধ্যায়
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={isSubmitting} className="gap-2">
              <Save className="h-4 w-4" /> {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main */}
          <div className="space-y-5 min-w-0">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">শিরোনাম *</Label>
              <Input
                value={draft.title || ""}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="text-xl font-semibold"
                placeholder="বইয়ের শিরোনাম..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">লেখক *</Label>
                <Input value={draft.author || ""} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">প্রকাশকাল</Label>
                <Input value={draft.publishDate || ""} onChange={(e) => setDraft({ ...draft, publishDate: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">বিবরণ</Label>
              <Textarea rows={4} value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>

            {/* Chapters */}
            <div className="p-4 rounded-xl border border-border/50 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">অধ্যায়সমূহ ({(draft.chapters || []).length})</h3>
                </div>
                <Button size="sm" variant="outline" onClick={addChapter} className="h-7 gap-1">
                  <Plus className="h-3 w-3" /> অধ্যায় যোগ
                </Button>
              </div>
              <div className="space-y-3">
                {(draft.chapters || []).map((ch, i) => (
                  <div key={i} className="rounded-lg border border-border/60 p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">অধ্যায় #{i + 1}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeChapter(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={ch.title}
                      onChange={(e) => updateChapter(i, { title: e.target.value })}
                      placeholder="অধ্যায়ের শিরোনাম"
                      className="text-sm font-medium"
                    />
                    <CloudinaryUploader
                      value={ch.image}
                      onChange={(url) => updateChapter(i, { image: url })}
                      label="অধ্যায়ের ছবি (ঐচ্ছিক)"
                    />
                    <Textarea
                      rows={6}
                      value={ch.content}
                      onChange={(e) => updateChapter(i, { content: e.target.value })}
                      placeholder="অধ্যায়ের কন্টেন্ট..."
                      className="text-sm"
                    />
                  </div>
                ))}
                {(draft.chapters || []).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">কোনো অধ্যায় নেই — উপরে "অধ্যায় যোগ" বাটনে ক্লিক করুন</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="p-4 rounded-xl border border-border/50 bg-card">
              <CloudinaryUploader
                value={draft.cover}
                onChange={(url) => setDraft({ ...draft, cover: url })}
                label="কভার ইমেজ"
              />
            </div>

            <div className="p-4 rounded-xl border border-border/50 bg-card space-y-4">
              <h3 className="text-sm font-semibold">ক্যাটাগরি</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">প্রধান ক্যাটাগরি</Label>
                <Select value={draft.categoryId || "none"} onValueChange={(v) => setDraft({ ...draft, categoryId: v === "none" ? null : v, subcategory: "" })}>
                  <SelectTrigger><SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">কোনোটি নয়</SelectItem>
                    {roots.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">উপ-ক্যাটাগরি</Label>
                <Select disabled={!draft.categoryId} value={draft.subcategory || "none"} onValueChange={(v) => setDraft({ ...draft, subcategory: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="উপ-ক্যাটাগরি" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">কোনোটি নয়</SelectItem>
                    {subcats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/50 bg-card space-y-4">
              <h3 className="text-sm font-semibold">তথ্য</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">পৃষ্ঠা</Label>
                  <Input type="number" value={draft.pages ?? 0} onChange={(e) => setDraft({ ...draft, pages: +e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">রেটিং</Label>
                  <Input type="number" step="0.1" max="5" value={draft.rating ?? 0} onChange={(e) => setDraft({ ...draft, rating: +e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">পাঠক</Label>
                  <Input type="number" value={draft.readers ?? 0} onChange={(e) => setDraft({ ...draft, readers: +e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">ভাষা</Label>
                  <Input value={draft.language || ""} onChange={(e) => setDraft({ ...draft, language: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <Label className="text-xs cursor-pointer" htmlFor="free-toggle">ফ্রি বই</Label>
                <Switch id="free-toggle" checked={!!draft.isFree} onCheckedChange={(v) => setDraft({ ...draft, isFree: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs cursor-pointer" htmlFor="pub-toggle">প্রকাশিত</Label>
                <Switch
                  id="pub-toggle"
                  checked={(draft.status ?? "published") === "published"}
                  onCheckedChange={(v) => setDraft({ ...draft, status: v ? "published" : "draft" })}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // ───────── List View ─────────
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">লাইব্রেরি বইসমূহ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">মোট {initialBooks.length} টি বই</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> নতুন বই</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="শিরোনাম বা লেখক দিয়ে খুঁজুন..." className="pl-9" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((b) => (
          <div key={b.id} className="rounded-xl border border-border/50 bg-card overflow-hidden flex">
            <SmartImage src={b.cover || "/placeholder.svg"} alt={b.title} className="w-24 h-32 object-cover shrink-0" />
            <div className="p-3 flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm line-clamp-2 flex-1">{b.title}</h3>
                <Badge variant={(b.status ?? "published") === "published" ? "default" : "secondary"} className="text-[9px] shrink-0">
                  {(b.status ?? "published") === "published" ? "প্রকাশিত" : "ড্রাফট"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{b.author}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{b.category?.name || "No Category"} · {(b.chapters || []).length} অধ্যায়</p>
              <div className="flex gap-1 mt-auto pt-2">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openEdit(b)}>
                  <Edit2 className="h-3 w-3" /> এডিট
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleStatus(b)} title="স্ট্যাটাস টগল">
                  {(b.status ?? "published") === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setConfirmDelete(b)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 border rounded-xl">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">কোনো বই পাওয়া যায়নি</p>
        </div>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>বইটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>"{confirmDelete?.title}" — এই কাজটি বাতিল করা যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={async () => {
                if (confirmDelete) {
                  setIsSubmitting(true);
                  try {
                    await deleteBook(confirmDelete.id);
                    toast({ title: "মুছে ফেলা হয়েছে" });
                    router.refresh();
                  } catch(e) {
                    toast({ title: "Error deleting", variant: "destructive" });
                  }
                  setIsSubmitting(false);
                }
                setConfirmDelete(null);
              }}
            >
              {isSubmitting ? "মুছছে..." : "মুছুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBooks;

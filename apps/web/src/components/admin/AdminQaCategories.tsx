"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FolderOpen, ChevronRight, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { type QaCategory } from "@prisma/client";
import { useRouter } from "next/navigation";
import { createQaCategory, updateQaCategory, deleteQaCategory } from "@/server/actions/qa-category.actions";
import AdminLayout from "@/components/admin/AdminLayout";

interface FormState {
  name: string;
  description: string;
  parentId: string; // "" = none
}
const empty: FormState = { name: "", description: "", parentId: "" };

const AdminQaCategories = ({ initialCategories }: { initialCategories: QaCategory[] }) => {
  const router = useRouter();
  const cats = initialCategories;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [editing, setEditing] = useState<QaCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roots = useMemo(() => cats.filter((c) => !c.parentId), [cats]);
  const childrenOf = (id: string) => cats.filter((c) => c.parentId === id);

  const openCreate = (parentId?: string) => {
    setForm({ ...empty, parentId: parentId || "" });
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (c: QaCategory) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || "",
      parentId: c.parentId || "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("নাম আবশ্যক");
    if (editing && form.parentId === editing.id) return toast.error("নিজেকে parent বানানো যাবে না");
    
    setIsSubmitting(true);
    const payload = {
      name: form.name,
      description: form.description,
      parentId: form.parentId || null,
    };
    
    try {
      if (editing) {
        const res = await updateQaCategory(editing.id, payload);
        if (!res.ok) throw new Error(res.error || "Failed to update");
        toast.success("ক্যাটাগরি আপডেট হয়েছে");
      } else {
        const res = await createQaCategory(payload);
        if (!res.ok) throw new Error(res.error || "Failed to create");
        toast.success("ক্যাটাগরি তৈরি হয়েছে");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available parents: exclude self and its descendants
  const parentOptions = useMemo(() => {
    if (!editing) return cats;
    const blocked = new Set([editing.id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const c of cats) {
        if (c.parentId && blocked.has(c.parentId) && !blocked.has(c.id)) {
          blocked.add(c.id); grew = true;
        }
      }
    }
    return cats.filter((c) => !blocked.has(c.id));
  }, [cats, editing]);

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteQaCategory(id);
      if (!res.ok) throw new Error(res.error || "Failed to delete");
      toast.success("মুছে ফেলা হয়েছে");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting");
    }
  };

  const Row = ({ c, depth }: { c: QaCategory; depth: number }) => {
    const kids = childrenOf(c.id);
    const [expanded, setExpanded] = useState(true);

    return (
      <>
        <div
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/40 rounded-lg group"
          style={{ paddingLeft: 12 + depth * 22 }}
        >
          {kids.length > 0 ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 -ml-2 rounded-md hover:bg-foreground/10 text-muted-foreground transition-colors"
              title={expanded ? "কলাপস করুন" : "এক্সপান্ড করুন"}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          ) : depth > 0 ? (
            <div className="w-4 h-4 ml-0 flex items-center justify-center shrink-0">
               <div className="w-1.5 h-1.5 rounded-full bg-border" />
            </div>
          ) : null}

          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate cursor-pointer hover:underline" onClick={() => kids.length > 0 && setExpanded(!expanded)}>{c.name}</span>
              {kids.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>{kids.length} সাব</Badge>
              )}
              <span className="text-[11px] text-muted-foreground font-mono">/{c.slug}</span>
            </div>
            {c.description && <div className="text-xs text-muted-foreground truncate">{c.description}</div>}
          </div>
          <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" title="সাব-ক্যাটাগরি যোগ" onClick={() => openCreate(c.id)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)} title="এডিট">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="মুছুন">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>"{c.name}" মুছবেন?</AlertDialogTitle>
                  <AlertDialogDescription>
                    এর সব সাব-ক্যাটাগরিও মুছে যাবে। এই কাজ ফেরানো যাবে না।
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDelete(c.id)}
                  >মুছুন</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {expanded && kids.map((k) => <Row key={k.id} c={k} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">জিজ্ঞাসা ক্যাটাগরি</h1>
          <p className="text-muted-foreground text-sm mt-1">{cats.length}টি ক্যাটাগরি · সাব-ক্যাটাগরি সমর্থিত</p>
        </div>
        <Button onClick={() => openCreate()} className="gap-2"><Plus className="h-4 w-4" /> নতুন ক্যাটাগরি</Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
        {roots.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <FolderTree className="h-8 w-8 mx-auto mb-3 opacity-50" />
            কোন ক্যাটাগরি নেই — উপরে "নতুন ক্যাটাগরি" দিয়ে শুরু করুন
          </div>
        ) : (
          <div className="p-2 divide-y divide-border/40">
            {roots.map((c) => <div key={c.id} className="py-1"><Row c={c} depth={0} /></div>)}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "ক্যাটাগরি এডিট" : "নতুন ক্যাটাগরি"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>নাম *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>প্যারেন্ট ক্যাটাগরি (ঐচ্ছিক)</Label>
              <Select
                value={form.parentId || "__none__"}
                onValueChange={(v) => setForm({ ...form, parentId: v === "__none__" ? "" : v })}
              >
                <SelectTrigger><SelectValue placeholder="কোনটা নয় (মূল ক্যাটাগরি)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— কোনটা নয় (মূল ক্যাটাগরি) —</SelectItem>
                  {parentOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.parentId ? "↳ " : ""}{p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">প্যারেন্ট দিলে এটি সাব-ক্যাটাগরি হিসেবে কাজ করবে।</p>
            </div>
            <div className="space-y-1.5">
              <Label>বিবরণ</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>বাতিল</Button></DialogClose>
            <Button onClick={save} disabled={isSubmitting}>
              {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminQaCategories;

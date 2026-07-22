import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ChevronRight, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdmin } from "@/contexts/AdminContext";
import type { Category } from "@/types/course";
import { toast } from "sonner";

const ICONS = ["📁", "🌐", "📊", "📱", "🎨", "☁️", "🔒", "🎯", "🧠", "🛠️", "💡", "🚀"];

interface FormState {
  name: string;
  description: string;
  icon: string;
  parentId: string; // "" = none
}
const emptyForm: FormState = { name: "", description: "", icon: "📁", parentId: "" };

const AdminCategories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdmin();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Category | null>(null);

  const roots = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);

  const openCreate = (parentId?: string) => {
    setEditing(null);
    setForm({ ...emptyForm, parentId: parentId || "" });
    setOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      parentId: cat.parentId || "",
    });
    setOpen(true);
  };

  // exclude self and descendants from parent options
  const parentOptions = useMemo(() => {
    if (!editing) return categories;
    const blocked = new Set([editing.id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const c of categories) {
        if (c.parentId && blocked.has(c.parentId) && !blocked.has(c.id)) {
          blocked.add(c.id); grew = true;
        }
      }
    }
    return categories.filter((c) => !blocked.has(c.id));
  }, [categories, editing]);

  const save = () => {
    if (!form.name.trim()) return toast.error("নাম আবশ্যক");
    if (editing && form.parentId === editing.id) return toast.error("নিজেকে parent বানানো যাবে না");
    const payload = {
      name: form.name,
      description: form.description,
      icon: form.icon,
      parentId: form.parentId || null,
    };
    if (editing) {
      updateCategory(editing.id, payload);
      toast.success("ক্যাটাগরি আপডেট হয়েছে");
    } else {
      addCategory({ ...payload, courseCount: 0 });
      toast.success("ক্যাটাগরি তৈরি হয়েছে");
    }
    setOpen(false);
  };

  const handleDelete = (cat: Category) => {
    // cascade delete children
    const toDelete = new Set([cat.id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const c of categories) {
        if (c.parentId && toDelete.has(c.parentId) && !toDelete.has(c.id)) {
          toDelete.add(c.id); grew = true;
        }
      }
    }
    toDelete.forEach((id) => deleteCategory(id));
    toast.success("ক্যাটাগরি মুছে ফেলা হয়েছে");
  };

  const Row = ({ c, depth }: { c: Category; depth: number }) => {
    const kids = childrenOf(c.id);
    return (
      <>
        <div
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/40 rounded-lg group"
          style={{ paddingLeft: 12 + depth * 22 }}
        >
          {depth > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground -ml-1 shrink-0" />}
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
            {c.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm truncate">{c.name}</span>
              {kids.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{kids.length} সাব</Badge>
              )}
              <span className="text-[11px] text-muted-foreground">{c.courseCount}টি কোর্স</span>
            </div>
            {c.description && (
              <div className="text-xs text-muted-foreground truncate">{c.description}</div>
            )}
          </div>
          <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" title="সাব-ক্যাটাগরি যোগ করুন" onClick={() => openCreate(c.id)}>
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
              <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>"{c.name}" মুছে ফেলবেন?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {kids.length > 0
                      ? `এর ${kids.length}টি সাব-ক্যাটাগরিও মুছে যাবে। এই কাজ ফেরানো যাবে না।`
                      : "এই কাজ ফেরানো যাবে না।"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">বাতিল</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(c)}
                    className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >মুছুন</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {kids.map((k) => <Row key={k.id} c={k} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">কোর্স ক্যাটাগরি</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            {categories.length}টি ক্যাটাগরি · সাব-ক্যাটাগরি সমর্থিত
          </p>
        </div>
        <Button onClick={() => openCreate()} className="rounded-xl gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> নতুন ক্যাটাগরি
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
        {roots.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <FolderTree className="h-8 w-8 mx-auto mb-3 opacity-50" />
            কোন ক্যাটাগরি নেই — উপরে "নতুন ক্যাটাগরি" দিয়ে শুরু করুন
          </div>
        ) : (
          <div className="p-2 divide-y divide-border/40">
            {roots.map((c) => (
              <div key={c.id} className="py-1"><Row c={c} depth={0} /></div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>আইকন</Label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-lg sm:text-xl flex items-center justify-center transition-all ${
                      form.icon === icon ? "bg-primary/10 ring-2 ring-primary" : "bg-secondary hover:bg-accent"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>নাম *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="যেমন: ওয়েব ডেভেলপমেন্ট"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>প্যারেন্ট ক্যাটাগরি (ঐচ্ছিক)</Label>
              <Select
                value={form.parentId || "__none__"}
                onValueChange={(v) => setForm({ ...form, parentId: v === "__none__" ? "" : v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="— কোনটা নয় (মূল ক্যাটাগরি) —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— কোনটা নয় (মূল ক্যাটাগরি) —</SelectItem>
                  {parentOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.parentId ? "↳ " : ""}{p.icon} {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                প্যারেন্ট দিলে এটি সাব-ক্যাটাগরি হিসেবে কাজ করবে।
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>বিবরণ</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="সংক্ষিপ্ত বিবরণ"
                className="rounded-xl"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl w-full sm:w-auto">বাতিল</Button>
            </DialogClose>
            <Button onClick={save} className="rounded-xl w-full sm:w-auto">
              {editing ? "সংরক্ষণ করুন" : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;

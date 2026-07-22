import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Ticket, Percent, BadgeDollarSign } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getAllCouponsAction, upsertCouponAction, deleteCouponAction } from "@/server/actions/coupon.actions";

type Coupon = {
  code: string;
  kind: "PERCENT" | "FLAT";
  value: number;
  maxDiscount?: number;
  minSubtotal?: number;
  expiresAt?: string;
  active: boolean;
};

const empty: Coupon = {
  code: "",
  kind: "PERCENT",
  value: 10,
  active: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Coupon>(empty);

  useEffect(() => {
    const fetchCoupons = async () => {
      const data = await getAllCouponsAction();
      setCoupons(data.map((c: any) => ({
        code: c.code,
        kind: c.type,
        value: c.value,
        minSubtotal: c.minOrderAmount || undefined,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : undefined,
        active: c.active,
      })));
    };
    fetchCoupons();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm(c);
    setOpen(true);
  };

  const save = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) return toast.error("কোড দিন।");
    if (form.value <= 0) return toast.error("মান ০ এর বেশি হতে হবে।");
    if (form.kind === "PERCENT" && form.value > 100)
      return toast.error("শতাংশ ১০০ এর বেশি হতে পারে পণ্ডিত না।");
    if (!editing && coupons.find((x) => x.code === code))
      return toast.error("এই কোডটি আগে থেকেই আছে।");
    
    const res = await upsertCouponAction({
      code,
      type: form.kind,
      value: form.value,
      minOrderAmount: form.minSubtotal,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
      active: form.active
    });
    
    if (res.ok) {
      if (editing) {
        setCoupons(coupons.map(c => c.code === editing.code ? { ...form, code } : c));
      } else {
        setCoupons([{ ...form, code }, ...coupons]);
      }
      toast.success(editing ? "কুপন আপডেট হয়েছে।" : "নতুন কুপন যোগ হয়েছে।");
      setOpen(false);
    } else {
      toast.error(res.error || "Error saving coupon");
    }
  };

  const remove = async (code: string) => {
    if (!confirm(`"${code}" মুছবেন?`)) return;
    const res = await deleteCouponAction(code);
    if (res.ok) {
      setCoupons(coupons.filter(c => c.code !== code));
      toast.success("মুছে ফেলা হয়েছে।");
    } else {
      toast.error(res.error || "Error deleting coupon");
    }
  };

  const totalActive = coupons.filter((c) => c.active).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" /> কুপন ম্যানেজার
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            ডিসকাউন্ট কোড তৈরি ও পরিচালনা করুন — চেকআউটে স্বয়ংক্রিয়ভাবে কাজ করবে।
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> নতুন কুপন
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="text-2xl font-bold">{coupons.length}</div>
          <div className="text-xs text-muted-foreground">মোট কুপন</div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="text-2xl font-bold text-primary">{totalActive}</div>
          <div className="text-xs text-muted-foreground">সক্রিয়</div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/50 col-span-2 sm:col-span-1">
          <div className="text-2xl font-bold">
            {coupons.filter((c) => c.kind === "PERCENT").length}
            <span className="text-sm text-muted-foreground">/{coupons.filter((c) => c.kind === "FLAT").length}</span>
          </div>
          <div className="text-xs text-muted-foreground">শতাংশ / ফ্ল্যাট</div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-2xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>কোড</TableHead>
              <TableHead>ধরন</TableHead>
              <TableHead>মান</TableHead>
              <TableHead>শর্ত</TableHead>
              <TableHead>মেয়াদ</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  কোনো কুপন নেই।
                </TableCell>
              </TableRow>
            ) : coupons.map((c) => (
              <TableRow key={c.code}>
                <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1">
                    {c.kind === "PERCENT" ? <Percent className="h-3 w-3" /> : <BadgeDollarSign className="h-3 w-3" />}
                    {c.kind === "PERCENT" ? "শতাংশ" : "ফ্ল্যাট"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {c.kind === "PERCENT" ? `${c.value}%` : `৳${c.value.toLocaleString("bn-BD")}`}
                  {c.maxDiscount ? (
                    <div className="text-xs text-muted-foreground">সর্বোচ্চ ৳{c.maxDiscount.toLocaleString("bn-BD")}</div>
                  ) : null}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.minSubtotal ? `মিন ৳${c.minSubtotal.toLocaleString("bn-BD")}` : "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("bn-BD") : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={c.active ? "default" : "outline"}>
                    {c.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)} className="h-8 w-8">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.code)} className="h-8 w-8 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {coupons.map((c) => (
          <div key={c.code} className="p-4 rounded-2xl bg-card border border-border/50 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-mono font-semibold">{c.code}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {c.kind === "PERCENT" ? `${c.value}%` : `৳${c.value.toLocaleString("bn-BD")}`}
                  {c.maxDiscount ? ` · সর্বোচ্চ ৳${c.maxDiscount.toLocaleString("bn-BD")}` : ""}
                </div>
              </div>
              <Badge variant={c.active ? "default" : "outline"}>{c.active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(c)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> এডিট
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => remove(c.code)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "কুপন এডিট করুন" : "নতুন কুপন"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>কোড</Label>
              <Input
                value={form.code}
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME10"
                className="font-mono uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ধরন</Label>
                <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">শতাংশ (%)</SelectItem>
                    <SelectItem value="FLAT">ফ্ল্যাট (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>মান</Label>
                <Input type="number" min={1} value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">সর্বোচ্চ ছাড় (৳)</Label>
                <Input type="number" min={0} value={form.maxDiscount ?? ""}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <Label className="text-xs">মিন. সাবটোটাল (৳)</Label>
                <Input type="number" min={0} value={form.minSubtotal ?? ""}
                  onChange={(e) => setForm({ ...form, minSubtotal: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">মেয়াদ শেষ</Label>
              <Input type="date" value={form.expiresAt ? form.expiresAt.slice(0, 10) : ""}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
              <div>
                <div className="text-sm font-medium">সক্রিয়</div>
                <div className="text-xs text-muted-foreground">নিষ্ক্রিয় করলে চেকআউটে কাজ করবে না</div>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button onClick={save}>সেভ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminCoupons;

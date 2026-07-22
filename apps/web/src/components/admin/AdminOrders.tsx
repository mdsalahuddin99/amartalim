import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Search, RotateCcw, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { getAdminOrders, updateOrderStatus } from "@/server/actions/order.actions";
import type { OrderStatus } from "@/types/order";

const useAllOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getAdminOrders();
      setOrders(data);
    };
    fetchOrders();
  }, []);

  return { orders, setOrders };
};

const statusMeta: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ComponentType<{ className?: string }> }> = {
  PAID: { label: "পেইড", variant: "default", icon: CheckCircle2 },
  PENDING: { label: "পেন্ডিং", variant: "secondary", icon: Clock },
  FAILED: { label: "ব্যর্থ", variant: "destructive", icon: XCircle },
  REFUNDED: { label: "রিফান্ড", variant: "outline", icon: RotateCcw },
};

const AdminOrders = () => {
  const { orders, setOrders } = useAllOrders();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [provider, setProvider] = useState<string>("ALL");
  const [selected, setSelected] = useState<any | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (provider !== "ALL" && o.provider !== provider) return false;
      if (!term) return true;
      return (
        o.id.toLowerCase().includes(term) ||
        o.courseTitle.toLowerCase().includes(term) ||
        (o.trxId ?? "").toLowerCase().includes(term) ||
        (o.couponCode ?? "").toLowerCase().includes(term)
      );
    });
  }, [orders, q, status, provider]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "PAID");
    return {
      total: orders.length,
      revenue: paid.reduce((s, o) => s + o.total, 0),
      paid: paid.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      refunded: orders.filter((o) => o.status === "REFUNDED").length,
    };
  }, [orders]);

  const update = async (id: string, patch: any) => {
    const res = await updateOrderStatus(id, patch);
    if (res.ok) {
      toast.success("অর্ডার আপডেট হয়েছে।");
      setOrders(orders.map(o => o.id === id ? { ...o, ...patch } : o));
      if (selected?.id === id) setSelected({ ...selected, ...patch });
    } else {
      toast.error(res.error || "Update failed.");
    }
  };

  const refund = (o: any) => {
    if (!confirm(`অর্ডার ${o.id} রিফান্ড করবেন?`)) return;
    update(o.id, { status: "REFUNDED" });
  };
  const markPaid = (o: any) =>
    update(o.id, { status: "PAID" }); // Ignoring paymentStatus in patch as Prisma doesn't have it explicitly right now on Payment except status. Oh wait, Payment status is what we are updating.
  const markFailed = (o: any) =>
    update(o.id, { status: "FAILED" });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" /> অর্ডার ও পেমেন্ট
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          সব অর্ডার দেখুন, পেমেন্ট যাচাই করুন এবং রিফান্ড প্রসেস করুন।
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="মোট অর্ডার" value={stats.total.toLocaleString("bn-BD")} />
        <Stat label="আয় (৳)" value={`৳${stats.revenue.toLocaleString("bn-BD")}`} primary />
        <Stat label="পেইড" value={stats.paid.toLocaleString("bn-BD")} />
        <Stat label="পেন্ডিং" value={stats.pending.toLocaleString("bn-BD")} />
        <Stat label="রিফান্ড" value={stats.refunded.toLocaleString("bn-BD")} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="অর্ডার ID, কোর্স, TRX..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="PAID">পেইড</SelectItem>
            <SelectItem value="PENDING">পেন্ডিং</SelectItem>
            <SelectItem value="FAILED">ব্যর্থ</SelectItem>
            <SelectItem value="REFUNDED">রিফান্ড</SelectItem>
          </SelectContent>
        </Select>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব মাধ্যম</SelectItem>
            <SelectItem value="BKASH">বিকাশ</SelectItem>
            <SelectItem value="NAGAD">নগদ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-card rounded-2xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>অর্ডার</TableHead>
              <TableHead>কোর্স</TableHead>
              <TableHead>মাধ্যম</TableHead>
              <TableHead>মোট</TableHead>
              <TableHead>তারিখ</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">কোনো অর্ডার পাওয়া যায়নি।</TableCell></TableRow>
            ) : filtered.map((o) => {
              const meta = statusMeta[o.status];
              const Icon = meta.icon;
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id.slice(0, 16)}…</TableCell>
                  <TableCell className="max-w-[220px] truncate">{o.courseTitle}</TableCell>
                  <TableCell><Badge variant="outline">{o.provider}</Badge></TableCell>
                  <TableCell className="font-semibold">৳{o.total.toLocaleString("bn-BD")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("bn-BD")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={meta.variant} className="gap-1">
                      <Icon className="h-3 w-3" /> {meta.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelected(o)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {filtered.map((o) => {
          const meta = statusMeta[o.status];
          return (
            <button key={o.id} onClick={() => setSelected(o)}
              className="w-full text-left p-4 rounded-2xl bg-card border border-border/50 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{o.courseTitle}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{o.id.slice(0, 18)}…</div>
                </div>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{o.provider} · {new Date(o.createdAt).toLocaleDateString("bn-BD")}</span>
                <span className="font-semibold">৳{o.total.toLocaleString("bn-BD")}</span>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>অর্ডার ডিটেইলস</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="অর্ডার ID" value={selected.id} mono />
                <Field label="TRX ID" value={selected.trxId ?? "—"} mono />
                <Field label="ইউজার" value={selected.userId} mono />
                <Field label="মাধ্যম" value={selected.provider} />
                <Field label="সাবটোটাল" value={`৳${selected.subtotal.toLocaleString("bn-BD")}`} />
                <Field label="ছাড়" value={`৳${selected.discount.toLocaleString("bn-BD")}`} />
                <Field label="মোট" value={`৳${selected.total.toLocaleString("bn-BD")}`} />
                <Field label="কুপন" value={selected.couponCode ?? "—"} />
                <Field label="তৈরি" value={new Date(selected.createdAt).toLocaleString("bn-BD")} />
                <Field label="পেইড" value={selected.paidAt ? new Date(selected.paidAt).toLocaleString("bn-BD") : "—"} />
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <div className="text-xs text-muted-foreground mb-1">কোর্স</div>
                <div className="font-medium text-sm">{selected.courseTitle}</div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {selected.status !== "PAID" && (
                  <Button size="sm" onClick={() => markPaid(selected)} className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> পেইড মার্ক করুন
                  </Button>
                )}
                {selected.status === "PENDING" && (
                  <Button size="sm" variant="outline" onClick={() => markFailed(selected)} className="gap-1">
                    <XCircle className="h-3.5 w-3.5" /> ব্যর্থ মার্ক করুন
                  </Button>
                )}
                {selected.status === "PAID" && (
                  <Button size="sm" variant="outline" className="text-destructive gap-1" onClick={() => refund(selected)}>
                    <RotateCcw className="h-3.5 w-3.5" /> রিফান্ড
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const Stat = ({ label, value, primary }: { label: string; value: string; primary?: boolean }) => (
  <div className="p-4 rounded-2xl bg-card border border-border/50">
    <div className={`text-xl sm:text-2xl font-bold ${primary ? "text-primary" : ""}`}>{value}</div>
    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
  </div>
);

const Field = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div>
    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
    <div className={`text-sm ${mono ? "font-mono text-xs break-all" : "font-medium"}`}>{value}</div>
  </div>
);

export default AdminOrders;

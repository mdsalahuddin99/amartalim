"use client";

import { useMemo } from "react";
import { Link, useSearchParams } from "@/lib/navigation";
import { Receipt, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import { Button } from "@/components/ui/button";
import { useSession } from "@/server/auth/session";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

import SmartImage from "@/components/shared/SmartImage";
const STATUS_META: Record<OrderStatus, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  PAID: { label: "সফল", icon: CheckCircle2, cls: "text-primary bg-primary/10" },
  PENDING: { label: "অপেক্ষমান", icon: Clock, cls: "text-warning bg-warning/10" },
  FAILED: { label: "ব্যর্থ", icon: XCircle, cls: "text-destructive bg-destructive/10" },
  REFUNDED: { label: "ফেরত", icon: RefreshCw, cls: "text-muted-foreground bg-muted" },
};

const OrdersPage = ({ initialOrders = [] }: { initialOrders?: any[] }) => {
  const { isAuthenticated } = useSession();
  const orders = initialOrders;
  const [params] = useSearchParams();
  const highlight = params.get("highlight");

  const total = useMemo(
    () => orders.filter((o) => o.status === "PAID").reduce((s, o) => s + o.total, 0),
    [orders],
  );

  return (
    <UserDashboardLayout>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-10 pb-4 border-b-2 border-foreground flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">পেমেন্ট ও ক্রয়</p>
            <h1 className="font-serif-bn font-black text-3xl sm:text-5xl flex items-center gap-3">
              <Receipt className="w-8 h-8" /> অর্ডার ইতিহাস
            </h1>
          </div>
          {orders.length > 0 && (
            <p className="text-sm text-muted-foreground">
              মোট পরিশোধ:{" "}
              <span className="font-bold text-foreground tabular-nums">
                ৳{total.toLocaleString("bn-BD")}
              </span>
            </p>
          )}
        </header>

        {!isAuthenticated ? (
          <div className="text-center py-16 border border-dashed">
            <p className="font-serif-bn text-lg mb-4">অর্ডার ইতিহাস দেখতে লগইন করুন।</p>
            <Link to="/login?from=/orders">
              <Button className="rounded-none">লগইন</Button>
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-dashed">
            <Receipt className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-serif-bn text-lg mb-4">কোনো অর্ডার পাওয়া যায়নি।</p>
            <Link to="/courses">
              <Button className="rounded-none">কোর্স ব্রাউজ করুন</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border border rounded-lg overflow-hidden">
            {orders.map((o) => {
              const meta = STATUS_META[o.status];
              const Icon = meta.icon;
              const isHighlighted = highlight === o.id;
              return (
                <li
                  key={o.id}
                  className={cn(
                    "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors",
                    isHighlighted ? "bg-primary/5" : "bg-card",
                  )}
                >
                  <div className="w-20 h-14 rounded overflow-hidden bg-muted shrink-0">
                    {o.courseThumbnail && (
                      <SmartImage src={o.courseThumbnail} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                          meta.cls,
                        )}
                      >
                        <Icon className="w-3 h-3" /> {meta.label}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{o.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <Link
                      to={`/courses/${o.courseId}`}
                      className="font-serif-bn font-bold text-base hover:text-primary transition-colors line-clamp-1"
                    >
                      {o.courseTitle}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(o.createdAt).toLocaleString("bn-BD")} · {o.provider}
                      {o.couponCode && <> · কুপন: {o.couponCode}</>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg tabular-nums">
                      ৳{o.total.toLocaleString("bn-BD")}
                    </p>
                    {o.discount > 0 && (
                      <p className="text-xs text-muted-foreground tabular-nums">
                        − ৳{o.discount.toLocaleString("bn-BD")} ছাড়
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </UserDashboardLayout>
  );
};

export default OrdersPage;

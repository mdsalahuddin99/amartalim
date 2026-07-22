"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Download, BookOpen, Receipt, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ordersStore } from "@/lib/stores/orders-store";
import type { Order } from "@/types/order";

const providerLabel: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad"
};

const PaymentSuccessPage = () => {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const trxId = params.get("trxId");
  const provider = (params.get("provider") || "").toLowerCase();
  const courseId = params.get("courseId");

  const [order, setOrder] = useState<Order | undefined>(undefined);

  useEffect(() => {
    if (orderId) setOrder(ordersStore.get(orderId));
  }, [orderId]);

  const display = useMemo(() => {
    return {
      provider: providerLabel[order?.provider ?? provider] ?? "পেমেন্ট গেটওয়ে",
      trxId: order?.trxId ?? trxId ?? "—",
      total: order?.total,
      courseTitle: order?.courseTitle,
      courseId: order?.courseId ?? courseId,
    };
  }, [order, provider, trxId, courseId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="rounded-3xl border border-border/50 bg-card shadow-card overflow-hidden">
          {/* Top hero */}
          <div className="relative bg-gradient-hero px-6 py-8 text-center text-primary-foreground">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <Sparkles className="absolute top-4 left-6 h-4 w-4" />
              <Sparkles className="absolute top-8 right-10 h-3 w-3" />
              <Sparkles className="absolute bottom-6 left-12 h-3 w-3" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3"
            >
              <CheckCircle2 className="h-9 w-9" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-bold">পেমেন্ট সফল হয়েছে</h1>
            <p className="text-sm text-primary-foreground/90 mt-1">আপনাকে কোর্সে এনরোল করা হয়েছে</p>
          </div>

          {/* Details */}
          <div className="p-5 sm:p-6 space-y-4">
            {display.courseTitle && (
              <div className="rounded-2xl bg-secondary/40 p-4">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">কোর্স</div>
                <div className="font-semibold text-sm mt-0.5">{display.courseTitle}</div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">পেমেন্ট গেটওয়ে</span>
                <Badge variant="secondary" className="text-xs">{display.provider}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ট্রানজেকশন আইডি</span>
                <span className="font-mono text-xs">{display.trxId}</span>
              </div>
              {orderId && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">অর্ডার আইডি</span>
                  <span className="font-mono text-xs truncate max-w-[60%]">{orderId}</span>
                </div>
              )}
              {typeof display.total === "number" && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">মোট পরিশোধিত</span>
                    <span className="font-bold text-base text-primary">৳{display.total.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {display.courseId ? (
                <Link to={`/courses/${display.courseId}`} className="w-full">
                  <Button className="w-full rounded-xl bg-gradient-hero hover:opacity-90">
                    <BookOpen className="mr-2 h-4 w-4" /> কোর্স শুরু করুন
                  </Button>
                </Link>
              ) : (
                <Link to="/my-courses" className="w-full">
                  <Button className="w-full rounded-xl bg-gradient-hero hover:opacity-90">
                    <BookOpen className="mr-2 h-4 w-4" /> আমার কোর্স
                  </Button>
                </Link>
              )}
              <Link to="/orders" className="w-full">
                <Button variant="outline" className="w-full rounded-xl">
                  <Receipt className="mr-2 h-4 w-4" /> অর্ডার দেখুন
                </Button>
              </Link>
            </div>

            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <Home className="h-3 w-3" /> হোমে ফিরে যান
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          একটি কনফার্মেশন ইমেইল পাঠানো হয়েছে। প্রশ্ন থাকলে support@amartalim.com-এ যোগাযোগ করুন।
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;

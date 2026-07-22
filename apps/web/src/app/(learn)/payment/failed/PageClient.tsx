"use client";

import { useMemo } from "react";
import { Link, useSearchParams } from "@/lib/navigation";
import { motion } from "framer-motion";
import { XCircle, RefreshCcw, MessageCircle, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const providerLabel: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad"
};

const reasonText: Record<string, string> = {
  cancelled: "আপনি পেমেন্ট বাতিল করেছেন।",
  insufficient: "অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।",
  timeout: "পেমেন্টের সময় শেষ হয়ে গেছে।",
  declined: "ব্যাংক/গেটওয়ে পেমেন্ট প্রত্যাখ্যান করেছে।",
  invalid_otp: "ভুল OTP দেওয়া হয়েছে।",
  network: "নেটওয়ার্ক সমস্যার কারণে পেমেন্ট সম্পন্ন হয়নি।",
};

const PaymentFailedPage = () => {
  const [params] = useSearchParams();
  const provider = (params.get("provider") || "").toLowerCase();
  const reason = params.get("reason") || "";
  const courseId = params.get("courseId");
  const orderId = params.get("orderId");

  const message = useMemo(() => reasonText[reason] || "কোনো অজানা কারণে পেমেন্ট সম্পন্ন হয়নি।", [reason]);
  const providerName = providerLabel[provider] || "পেমেন্ট গেটওয়ে";

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
          <div className="relative bg-gradient-to-br from-destructive/90 to-destructive px-6 py-8 text-center text-destructive-foreground">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3"
            >
              <XCircle className="h-9 w-9" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-bold">পেমেন্ট ব্যর্থ হয়েছে</h1>
            <p className="text-sm text-destructive-foreground/90 mt-1">আপনার অ্যাকাউন্ট থেকে কোনো টাকা কাটা হয়নি</p>
          </div>

          {/* Details */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-foreground">কারণ</div>
                <div className="text-muted-foreground mt-0.5">{message}</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">পেমেন্ট গেটওয়ে</span>
                <Badge variant="secondary" className="text-xs">{providerName}</Badge>
              </div>
              {orderId && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">অর্ডার আইডি</span>
                  <span className="font-mono text-xs truncate max-w-[60%]">{orderId}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {courseId ? (
                <Link to={`/checkout/${courseId}`} className="w-full">
                  <Button className="w-full rounded-xl bg-gradient-hero hover:opacity-90">
                    <RefreshCcw className="mr-2 h-4 w-4" /> আবার চেষ্টা করুন
                  </Button>
                </Link>
              ) : (
                <Link to="/courses" className="w-full">
                  <Button className="w-full rounded-xl bg-gradient-hero hover:opacity-90">
                    <RefreshCcw className="mr-2 h-4 w-4" /> কোর্স দেখুন
                  </Button>
                </Link>
              )}
              <Link to="/contact" className="w-full">
                <Button variant="outline" className="w-full rounded-xl">
                  <MessageCircle className="mr-2 h-4 w-4" /> সাপোর্টে যোগাযোগ
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
          যদি আপনার অ্যাকাউন্ট থেকে টাকা কাটা হয়ে থাকে, ২৪ ঘণ্টার মধ্যে স্বয়ংক্রিয়ভাবে রিফান্ড হবে।
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentFailedPage;

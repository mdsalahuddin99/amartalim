"use client";

import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@/lib/navigation";
import { ArrowLeft, ShieldCheck, Wallet, CreditCard, Loader2, CheckCircle2, Lock, Smartphone } from "lucide-react";
import SharedNavbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/server/auth/session";
import { createCheckoutOrder } from "@/server/actions/order.actions";
import { toast } from "@/hooks/use-toast";
import CouponInput from "@/components/lms/CouponInput";
import PaymentConfirmDialog from "@/components/lms/PaymentConfirmDialog";
import type { CouponResult } from "@/types/order";
import type { PaymentProvider } from "@/server/payments";
import { cn } from "@/lib/utils";

import SmartImage from "@/components/shared/SmartImage";
const PROVIDERS: { id: PaymentProvider; label: string; sub: string; icon: typeof Wallet }[] = [
  { id: "BKASH", label: "bKash", sub: "মোবাইল ব্যাংকিং", icon: Wallet },
  { id: "NAGAD", label: "Nagad", sub: "মোবাইল ব্যাংকিং", icon: Smartphone },
];

const CheckoutPage = ({
  course,
}: {
  course: {
    id: string;
    title: string;
    thumbnail: string | null;
    price: number;
    categoryName: string;
  } | null;
}) => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSession();

  const [provider, setProvider] = useState<PaymentProvider>("BKASH");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <SharedNavbar showAuth />
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <h1 className="font-serif-bn text-3xl font-bold mb-3">কোর্স পাওয়া যায়নি</h1>
          <Link to="/courses">
            <Button variant="outline" className="rounded-none">
              <ArrowLeft className="w-4 h-4 mr-2" /> সব কোর্স
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = course.price;
  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const openConfirm = () => {
    if (!isAuthenticated) {
      navigate(`/login?from=/checkout/${courseId}`);
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPay = async () => {
    setBusy(true);
    const res = await createCheckoutOrder(
      user,
      { id: course.id, title: course.title, thumbnail: course.thumbnail, price: course.price },
      { courseId: course.id, provider, couponCode: coupon?.code ?? "" },
    );
    setBusy(false);
    setConfirmOpen(false);
    if ("error" in res) {
      toast({ title: "পেমেন্ট ব্যর্থ", description: res.error, variant: "destructive" });
      navigate(`/payment/failed?provider=${provider.toLowerCase()}&courseId=${course.id}&reason=declined`);
      return;
    }
    toast({ title: "পেমেন্ট সফল!", description: "আপনি এখন কোর্সে এনরোলড।" });
    navigate(
      `/payment/success?orderId=${res.data.id}&trxId=${res.data.trxId}&provider=${provider.toLowerCase()}&courseId=${course.id}`,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      
      <SharedNavbar showAuth />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Link
          to={`/courses/${course.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> কোর্সে ফিরুন
        </Link>

        <h1 className="font-serif-bn font-black text-3xl sm:text-4xl mb-8 pb-3 border-b-2 border-foreground">
          চেকআউট
        </h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-10">
          {/* Left — payment method */}
          <section aria-labelledby="pay-method">
            <h2 id="pay-method" className="eyebrow mb-3">
              পেমেন্ট পদ্ধতি
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {PROVIDERS.map((p) => {
                const active = provider === p.id;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    aria-pressed={active}
                    className={cn(
                      "text-left rounded-lg border p-4 transition-all",
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-foreground/30",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-muted-foreground")} />
                      {active && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="font-serif-bn font-bold mt-2">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.sub}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-md border bg-muted/30 p-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                আপনার পেমেন্ট তথ্য এনক্রিপ্টেড গেটওয়ের মাধ্যমে প্রসেস হবে। সফল পেমেন্টের পর তাৎক্ষণিকভাবে কোর্স অ্যাক্সেস পাবেন।
              </p>
            </div>
          </section>

          {/* Right — order summary */}
          <aside aria-labelledby="order-summary" className="lg:sticky lg:top-24 self-start">
            <div className="rounded-lg border bg-card overflow-hidden">
              <header className="p-4 border-b">
                <h2 id="order-summary" className="font-serif-bn font-bold text-lg">
                  অর্ডার সামারি
                </h2>
              </header>

              <div className="p-4 flex gap-3 border-b">
                <div className="w-20 h-14 rounded overflow-hidden bg-muted shrink-0">
                  {course.thumbnail && (
                    <SmartImage src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{course.categoryName}</p>
                  <p className="font-medium text-sm leading-snug line-clamp-2">{course.title}</p>
                </div>
              </div>

              <div className="p-4 border-b">
                <CouponInput
                  courseId={course.id}
                  subtotal={subtotal}
                  applied={coupon}
                  onApply={setCoupon}
                  onClear={() => setCoupon(null)}
                />
              </div>

              <dl className="p-4 space-y-2 text-sm border-b">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">সাবটোটাল</dt>
                  <dd className="tabular-nums">৳{subtotal.toLocaleString("bn-BD")}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <dt>ছাড় ({coupon?.code})</dt>
                    <dd className="tabular-nums">− ৳{discount.toLocaleString("bn-BD")}</dd>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-bold text-base">
                  <dt>মোট</dt>
                  <dd className="tabular-nums">৳{total.toLocaleString("bn-BD")}</dd>
                </div>
              </dl>

              <div className="p-4">
                <Button
                  type="button"
                  className="w-full rounded-xl h-12 font-semibold bg-gradient-hero hover:opacity-90"
                  onClick={openConfirm}
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      ৳{total.toLocaleString("bn-BD")} পরিশোধ করুন
                    </>
                  )}
                </Button>
                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    চেকআউট সম্পন্ন করতে লগইন প্রয়োজন।
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <PaymentConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        provider={provider}
        amount={total}
        onConfirm={handleConfirmPay}
      />
    </div>
  );
};

export default CheckoutPage;

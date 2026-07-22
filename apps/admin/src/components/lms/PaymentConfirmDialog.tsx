import { useEffect, useState } from "react";
import { Loader2, Smartphone, ShieldCheck, CreditCard } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import type { PaymentProvider } from "@/server/payments";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: PaymentProvider;
  amount: number;
  onConfirm: () => Promise<void> | void;
}

const META: Record<PaymentProvider, { label: string; color: string; mobile: boolean; logo: string }> = {
  BKASH: { label: "bKash", color: "from-pink-500 to-pink-600", mobile: true, logo: "bK" },
  NAGAD: { label: "Nagad", color: "from-orange-500 to-red-500", mobile: true, logo: "N" },
};

type Step = "details" | "otp" | "processing";

const PaymentConfirmDialog = ({ open, onOpenChange, provider, amount, onConfirm }: Props) => {
  const meta = META[provider];
  const [step, setStep] = useState<Step>("details");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("details");
      setMobile("");
      setOtp("");
      setError(null);
    }
  }, [open]);

  const goToOtp = () => {
    setError(null);
    if (meta.mobile && !/^01[3-9]\d{8}$/.test(mobile)) {
      setError("সঠিক বাংলাদেশি মোবাইল নম্বর দিন (১১ ডিজিট)।");
      return;
    }
    setStep("otp");
  };

  const finalize = async () => {
    if (otp.length !== 6) {
      setError("৬ ডিজিটের OTP দিন।");
      return;
    }
    setStep("processing");
    setError(null);
    // Simulated gateway delay
    await new Promise((r) => setTimeout(r, 1400));
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (step !== "processing") onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        {/* Branded header */}
        <div className={cn("relative px-6 py-5 text-white bg-gradient-to-br", meta.color)}>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">
              {meta.logo}
            </div>
            <div>
              <DialogHeader className="space-y-0">
                <DialogTitle className="text-white text-lg">{meta.label} পেমেন্ট</DialogTitle>
                <DialogDescription className="text-white/85 text-xs">
                  মোট ৳{amount.toLocaleString("bn-BD")} পরিশোধ করুন
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("font-semibold", step === "details" && "text-primary")}>১. তথ্য</span>
            <span className="h-px flex-1 bg-border" />
            <span className={cn("font-semibold", step === "otp" && "text-primary")}>২. OTP</span>
            <span className="h-px flex-1 bg-border" />
            <span className={cn("font-semibold", step === "processing" && "text-primary")}>৩. সম্পন্ন</span>
          </div>

          {step === "details" && (
            <div className="space-y-4">
              {meta.mobile ? (
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm">{meta.label} অ্যাকাউন্ট নম্বর</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mobile"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="01XXXXXXXXX"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      className="pl-9 h-11 rounded-xl tabular-nums"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border bg-muted/30 p-4 flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    পরবর্তী ধাপে আপনাকে {meta.label} সিকিউর গেটওয়েতে নিয়ে যাওয়া হবে।
                  </p>
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {meta.mobile ? (
                  <>
                    <strong className="text-foreground">{mobile}</strong> নম্বরে পাঠানো ৬ ডিজিটের কোড দিন
                  </>
                ) : (
                  "আপনার ইমেইল/SMS-এ পাঠানো কোড দিন"
                )}
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="w-10 h-12 text-base border first:rounded-l-lg last:rounded-r-lg"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              <p className="text-xs text-muted-foreground text-center">
                ডেমো: যেকোনো ৬ ডিজিট কাজ করবে।
              </p>
            </div>
          )}

          {step === "processing" && (
            <div className="py-6 flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">পেমেন্ট ভেরিফাই হচ্ছে...</p>
              <p className="text-xs text-muted-foreground">পেজ বন্ধ করবেন না</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> 256-bit SSL এনক্রিপ্টেড
          </div>
        </div>

        {step !== "processing" && (
          <DialogFooter className="px-6 pb-5 pt-0 flex-row gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            {step === "details" ? (
              <Button className="flex-1 rounded-xl bg-gradient-hero" onClick={goToOtp}>
                পরবর্তী
              </Button>
            ) : (
              <Button className="flex-1 rounded-xl bg-gradient-hero" onClick={finalize}>
                নিশ্চিত করুন
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmDialog;

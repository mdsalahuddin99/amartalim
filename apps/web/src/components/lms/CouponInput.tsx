import { useState } from "react";
import { Tag, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyCoupon } from "@/server/actions/order.actions";
import type { CouponResult } from "@/types/order";
import { cn } from "@/lib/utils";

interface Props {
  courseId: string;
  subtotal: number;
  applied?: CouponResult | null;
  onApply: (result: CouponResult) => void;
  onClear: () => void;
}

const CouponInput = ({ courseId, subtotal, applied, onApply, onClear }: Props) => {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await applyCoupon({ code, courseId, subtotal });
    setBusy(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    onApply(res.data);
    setCode("");
  };

  if (applied) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5",
        )}
      >
        <div className="flex items-center gap-2 text-sm min-w-0">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold tabular-nums">{applied.code}</span>
          <span className="text-muted-foreground truncate">
            — সাশ্রয় ৳{applied.discount.toLocaleString("bn-BD")}
          </span>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onClear} aria-label="সরান">
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5" /> কুপন কোড
      </label>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          placeholder="WELCOME10"
          className="font-mono uppercase tracking-wider"
          maxLength={40}
        />
        <Button type="submit" disabled={busy || code.trim().length < 2} className="rounded-none shrink-0">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "প্রয়োগ"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
};

export default CouponInput;

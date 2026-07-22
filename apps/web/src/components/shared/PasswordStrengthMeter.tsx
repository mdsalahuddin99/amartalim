import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  password: string;
}

interface Rule {
  test: (p: string) => boolean;
  label: string;
}

const rules: Rule[] = [
  { test: (p) => p.length >= 8, label: "কমপক্ষে ৮ অক্ষর" },
  { test: (p) => /[A-Z]/.test(p) || /[\u0980-\u09FF]/.test(p), label: "বড় হাতের / বাংলা অক্ষর" },
  { test: (p) => /\d/.test(p), label: "একটি সংখ্যা" },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: "একটি বিশেষ চিহ্ন" },
];

const colors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-warning", "bg-primary"];
const labels = ["খুবই দুর্বল", "দুর্বল", "মাঝারি", "ভালো", "শক্তিশালী"];

const PasswordStrengthMeter = ({ password }: Props) => {
  if (!password) return null;
  const score = rules.reduce((s, r) => s + (r.test(password) ? 1 : 0), 0);

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < score ? colors[score] : "bg-border",
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">পাসওয়ার্ডের শক্তি</span>
        <span className={cn(
          "text-xs font-medium",
          score <= 1 && "text-destructive",
          score === 2 || score === 3 ? "text-warning" : "",
          score === 4 && "text-primary",
        )}>
          {labels[score]}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
        {rules.map((r) => {
          const ok = r.test(password);
          return (
            <li
              key={r.label}
              className={cn(
                "flex items-center gap-1.5 text-[11px]",
                ok ? "text-primary" : "text-muted-foreground",
              )}
            >
              {ok ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;

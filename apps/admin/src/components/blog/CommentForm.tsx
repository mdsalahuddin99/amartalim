import { Link } from "@/lib/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/server/auth/session";

interface Props {
  redirectTo: string;
  message?: string;
}

const CommentLoginGate = ({ redirectTo, message }: Props) => {
  return (
    <div className="rounded-md border border-foreground/15 bg-muted/30 p-5 sm:p-6 text-center">
      <p className="font-serif-bn text-base sm:text-lg text-foreground/85 mb-4">
        {message ?? "মন্তব্য করতে দয়া করে আপনার অ্যাকাউন্টে লগইন করুন।"}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link to={`/login?from=${encodeURIComponent(redirectTo)}`}>
          <Button size="sm" className="rounded-none">
            <LogIn className="w-4 h-4" /> লগইন
          </Button>
        </Link>
        <Link to={`/register?from=${encodeURIComponent(redirectTo)}`}>
          <Button size="sm" variant="outline" className="rounded-none">
            রেজিস্টার করুন
          </Button>
        </Link>
      </div>
    </div>
  );
};

interface FormProps {
  blogId: string;
  parentId?: string | null;
  autoFocus?: boolean;
  placeholder?: string;
  submitLabel?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
}

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createComment } from "@/server/actions/comment.actions";

const CommentForm = ({
  blogId,
  parentId = null,
  autoFocus,
  placeholder,
  submitLabel,
  onSubmitted,
  onCancel,
}: FormProps) => {
  const { user, isAuthenticated } = useSession();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isAuthenticated) {
    return <CommentLoginGate redirectTo={`/blogs`} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await createComment({ blogId, parentId, body });
    setBusy(false);
    if ("data" in res) {
      setBody("");
      toast({ title: "ধন্যবাদ!", description: "আপনার মন্তব্য প্রকাশ করা হয়েছে।" });
      onSubmitted?.();
    } else {
      toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center font-serif-bn font-bold shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <div className="flex-1">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder ?? "আপনার মতামত লিখুন…"}
            rows={parentId ? 3 : 4}
            autoFocus={autoFocus}
            className="resize-y"
            maxLength={2000}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">
              {body.trim().length}/2000
            </span>
            <div className="flex gap-2">
              {onCancel && (
                <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
                  বাতিল
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={busy || body.trim().length < 2}
                className="rounded-none"
              >
                {submitLabel ?? "প্রকাশ করুন"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
export { CommentLoginGate };

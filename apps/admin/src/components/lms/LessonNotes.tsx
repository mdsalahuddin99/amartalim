import { useEffect, useRef, useState } from "react";
import { NotebookPen, Check, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSession } from "@/server/auth/session";
import { useLessonNote } from "@/lib/stores/notes-store";
import { saveLessonNote, deleteLessonNote } from "@/server/actions/note.actions";
import { toast } from "@/hooks/use-toast";

interface Props {
  courseId: string;
  lessonId: string;
}

type SaveState = "idle" | "saving" | "saved";

const AUTOSAVE_MS = 1200;

/**
 * Per-lesson, per-user notes panel with debounced autosave.
 * Falls back to a login gate when no session.
 */
const LessonNotes = ({ courseId, lessonId }: Props) => {
  const { user, isAuthenticated } = useSession();
  const note = useLessonNote(user?.id, lessonId);
  const [body, setBody] = useState(note?.body ?? "");
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<number | null>(null);
  const lastSaved = useRef<string>(note?.body ?? "");

  // Sync when lesson changes or external update happens
  useEffect(() => {
    setBody(note?.body ?? "");
    lastSaved.current = note?.body ?? "";
  }, [lessonId, note?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthenticated) return;
    if (body === lastSaved.current) return;
    if (timer.current) window.clearTimeout(timer.current);
    setState("saving");
    timer.current = window.setTimeout(async () => {
      const res = await saveLessonNote(user, { courseId, lessonId, body });
      if ("error" in res) {
        setState("idle");
        toast({ title: "সংরক্ষণ ব্যর্থ", description: res.error, variant: "destructive" });
        return;
      }
      lastSaved.current = body;
      setState("saved");
      window.setTimeout(() => setState("idle"), 1200);
    }, AUTOSAVE_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [body, isAuthenticated, user, courseId, lessonId]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-md border bg-muted/30 p-5 text-center">
        <NotebookPen className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-3">
          নোট সংরক্ষণ করতে লগইন করুন।
        </p>
      </div>
    );
  }

  const handleClear = async () => {
    if (!confirm("এই পাঠের নোট মুছে ফেলবেন?")) return;
    await deleteLessonNote(user, lessonId);
    setBody("");
    lastSaved.current = "";
    toast({ title: "নোট মুছে ফেলা হয়েছে" });
  };

  return (
    <section aria-labelledby="lesson-notes-title" className="rounded-lg border bg-card">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <h3
          id="lesson-notes-title"
          className="font-serif-bn font-bold text-base flex items-center gap-2"
        >
          <NotebookPen className="w-4 h-4" /> আমার নোট
        </h3>
        <span
          className="text-xs flex items-center gap-1 text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {state === "saving" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> সংরক্ষণ হচ্ছে…
            </>
          )}
          {state === "saved" && (
            <>
              <Check className="w-3 h-3 text-primary" /> সংরক্ষিত
            </>
          )}
          {state === "idle" && note && <>আপডেটেড {new Date(note.updatedAt).toLocaleTimeString("bn-BD")}</>}
        </span>
      </header>
      <div className="p-4">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          maxLength={5000}
          placeholder="এই পাঠ থেকে যা শিখলেন তা এখানে লিখে রাখুন…"
          className="resize-y"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">{body.length}/5000</span>
          {body.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              মুছুন
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default LessonNotes;

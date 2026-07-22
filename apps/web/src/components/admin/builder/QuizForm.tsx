import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Save, FileQuestion, Plus, CheckCircle2, Circle, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { QuizMeta, QuizQuestion } from "@/types/course";

interface Props {
  initial?: QuizMeta;
  quizQuestions: QuizQuestion[];
  onSaveMeta: (v: Partial<QuizMeta>) => string;
  onAddQuestion: (quizId: string, q: Omit<QuizQuestion, "id" | "lessonId">) => void;
  onUpdateQuestion: (id: string, q: Partial<QuizQuestion>) => void;
  onDeleteQuestion: (id: string) => void;
  onClose: () => void;
}

const emptyQ = { question: "", options: ["", "", "", ""], correctAnswer: 0, type: "mcq" as const };

export const QuizForm = ({
  initial, quizQuestions, onSaveMeta, onAddQuestion, onUpdateQuestion, onDeleteQuestion, onClose,
}: Props) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [timeLimit, setTimeLimit] = useState<number | "">(initial?.timeLimit ?? "");
  const [passingScore, setPassingScore] = useState<number | "">(initial?.passingScore ?? 60);
  const [attempts, setAttempts] = useState<number | "">(initial?.attempts ?? 3);
  const [currentQuizId, setCurrentQuizId] = useState<string | undefined>(initial?.id);

  const [qForm, setQForm] = useState<Omit<QuizQuestion, "id" | "lessonId">>(emptyQ);
  const [editingQId, setEditingQId] = useState<string | null>(null);

  const saveMeta = (showToast = true) => {
    if (!title.trim()) {
      if (showToast) toast.error("শিরোনাম আবশ্যক");
      return null;
    }
    const id = onSaveMeta({
      title: title.trim(),
      timeLimit: timeLimit === "" ? undefined : Number(timeLimit),
      passingScore: passingScore === "" ? undefined : Number(passingScore),
      attempts: attempts === "" ? undefined : Number(attempts),
    });
    setCurrentQuizId(id);
    return id;
  };

  const setOpt = (i: number, v: string) => {
    const opts = [...qForm.options]; opts[i] = v;
    setQForm({ ...qForm, options: opts });
  };

  const saveQuestion = () => {
    let id = currentQuizId;
    if (!id) {
      id = saveMeta(false) || undefined;
      if (!id) { toast.error("আগে কুইজের শিরোনাম দিন"); return; }
    }
    if (!qForm.question.trim()) return toast.error("প্রশ্ন আবশ্যক");
    if (qForm.type === "mcq" && qForm.options.some((o) => !o.trim())) return toast.error("সকল অপশন পূরণ করুন");
    if (editingQId) {
      onUpdateQuestion(editingQId, qForm);
      toast.success("প্রশ্ন আপডেট হয়েছে");
    } else {
      onAddQuestion(id, qForm);
      toast.success("প্রশ্ন যোগ হয়েছে");
    }
    setQForm(emptyQ);
    setEditingQId(null);
  };

  const editQuestion = (q: QuizQuestion) => {
    setEditingQId(q.id);
    setQForm({ question: q.question, options: [...q.options], correctAnswer: q.correctAnswer, type: q.type || "mcq" });
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <FileQuestion className="h-4 w-4 text-primary" />
          {initial ? "কুইজ সম্পাদনা" : "নতুন কুইজ"}
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-4 py-4">
        <div className="rounded-xl border p-3 space-y-3 bg-secondary/20">
          <div className="space-y-2">
            <Label>কুইজের শিরোনাম</Label>
            <Input className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: অধ্যায় ১ মূল্যায়ন" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">সময় (মিনিট)</Label>
              <Input type="number" className="rounded-xl h-9 text-xs" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">পাশ মার্ক (%)</Label>
              <Input type="number" className="rounded-xl h-9 text-xs" value={passingScore} onChange={(e) => setPassingScore(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">সর্বোচ্চ চেষ্টা</Label>
              <Input type="number" className="rounded-xl h-9 text-xs" value={attempts} onChange={(e) => setAttempts(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl w-full text-xs h-8" onClick={() => { saveMeta(); toast.success("সেটিংস সংরক্ষিত"); }}>
            <Save className="mr-1 h-3 w-3" /> সেটিংস সংরক্ষণ
          </Button>
        </div>

        {/* Questions list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">প্রশ্নসমূহ ({quizQuestions.length})</Label>
          </div>
          {quizQuestions.map((q, idx) => (
            <div key={q.id} className="rounded-xl border p-2.5 bg-card">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-semibold text-primary shrink-0 mt-0.5">#{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">{q.question}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    সঠিক: {q.options[q.correctAnswer]}
                  </div>
                </div>
                <button onClick={() => editQuestion(q)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => onDeleteQuestion(q.id)} className="text-destructive"><X className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/edit question */}
        <div className="rounded-xl border-2 border-dashed p-3 space-y-3">
          <div className="text-xs font-semibold flex items-center gap-2">
            <Plus className="h-3 w-3" /> {editingQId ? "প্রশ্ন সম্পাদনা" : "নতুন প্রশ্ন"}
          </div>
          <Select value={qForm.type} onValueChange={(v) => setQForm({ ...qForm, type: v as QuizQuestion["type"] })}>
            <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">MCQ (চারটি অপশন)</SelectItem>
              <SelectItem value="true-false">সত্য / মিথ্যা</SelectItem>
              <SelectItem value="fill">শূন্যস্থান পূরণ</SelectItem>
              <SelectItem value="short">সংক্ষিপ্ত উত্তর</SelectItem>
            </SelectContent>
          </Select>
          <Input className="rounded-xl text-sm" value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} placeholder="প্রশ্ন লিখুন" />

          {qForm.type === "mcq" && (
            <div className="space-y-2">
              {qForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQForm({ ...qForm, correctAnswer: i })}
                    className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${i === qForm.correctAnswer ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {i === qForm.correctAnswer ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                  </button>
                  <Input className="rounded-xl h-9 text-xs flex-1" value={opt} onChange={(e) => setOpt(i, e.target.value)} placeholder={`অপশন ${i + 1}`} />
                </div>
              ))}
            </div>
          )}

          {qForm.type === "true-false" && (
            <div className="grid grid-cols-2 gap-2">
              {["সত্য", "মিথ্যা"].map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQForm({ ...qForm, options: ["সত্য", "মিথ্যা"], correctAnswer: i })}
                  className={`rounded-xl border p-2 text-xs ${qForm.correctAnswer === i ? "border-primary bg-primary/10 font-semibold" : "border-border"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {(qForm.type === "fill" || qForm.type === "short") && (
            <Input className="rounded-xl text-sm" value={qForm.options[0] || ""} onChange={(e) => setQForm({ ...qForm, options: [e.target.value], correctAnswer: 0 })} placeholder="সঠিক উত্তর লিখুন" />
          )}

          <div className="flex gap-2">
            {editingQId && (
              <Button variant="outline" size="sm" className="rounded-xl text-xs h-8 flex-1" onClick={() => { setEditingQId(null); setQForm(emptyQ); }}>
                বাতিল
              </Button>
            )}
            <Button size="sm" className="rounded-xl bg-gradient-hero hover:opacity-90 text-xs h-8 flex-1" onClick={saveQuestion}>
              {editingQId ? "আপডেট" : "প্রশ্ন যোগ"}
            </Button>
          </div>
        </div>

        <Button variant="outline" className="rounded-xl w-full" onClick={onClose}>সম্পন্ন</Button>
      </div>
    </>
  );
};

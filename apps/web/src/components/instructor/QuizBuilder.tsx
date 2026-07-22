import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, Circle, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

const emptyForm = { lessonId: "", question: "", options: ["", "", "", ""], correctAnswer: 0 };

interface QuizBuilderProps {
  allowedCourseIds: string[];
}

const QuizBuilder = ({ allowedCourseIds }: QuizBuilderProps) => {
  const { courses, lessons, quizQuestions, addQuizQuestion, updateQuizQuestion, deleteQuizQuestion } = useAdmin();

  const myCourses = courses.filter((c) => allowedCourseIds.includes(c.id));
  const myLessons = lessons.filter((l) => allowedCourseIds.includes(l.courseId));
  const myLessonIds = new Set(myLessons.map((l) => l.id));
  const myQuestions = quizQuestions.filter((q) => myLessonIds.has(q.lessonId));

  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = filterCourse === "all"
    ? myQuestions
    : myQuestions.filter((q) => {
        const l = lessons.find((x) => x.id === q.lessonId);
        return l?.courseId === filterCourse;
      });

  const setOption = (i: number, v: string) => {
    const opts = [...form.options];
    opts[i] = v;
    setForm({ ...form, options: opts });
  };

  const validate = () => {
    if (!form.lessonId) return toast.error("পাঠ নির্বাচন করুন"), false;
    if (!form.question.trim()) return toast.error("প্রশ্ন আবশ্যক"), false;
    if (form.options.some((o) => !o.trim())) return toast.error("সকল অপশন পূরণ করুন"), false;
    return true;
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, lessonId: myLessons[0]?.id ?? "" });
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const q = quizQuestions.find((x) => x.id === id);
    if (!q) return;
    setEditingId(id);
    setForm({ lessonId: q.lessonId, question: q.question, options: [...q.options], correctAnswer: q.correctAnswer });
    setOpen(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      updateQuizQuestion(editingId, form);
      toast.success("প্রশ্ন আপডেট হয়েছে");
    } else {
      addQuizQuestion(form);
      toast.success("প্রশ্ন যোগ হয়েছে");
    }
    setOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteQuizQuestion(id);
    toast.success("প্রশ্ন মুছে ফেলা হয়েছে");
  };

  const lessonLabel = (lessonId: string) => {
    const l = lessons.find((x) => x.id === lessonId);
    const c = l ? courses.find((x) => x.id === l.courseId) : undefined;
    return { lesson: l?.title ?? "—", course: c?.title ?? "—" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">কুইজ ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground text-sm mt-1">আপনার পাঠগুলোর জন্য MCQ প্রশ্ন তৈরি ও পরিচালনা করুন</p>
        </div>
        <Button size="sm" className="rounded-xl bg-gradient-hero hover:opacity-90 shrink-0" onClick={openCreate} disabled={myLessons.length === 0}>
          <Plus className="mr-1.5 h-4 w-4" /> নতুন প্রশ্ন
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "মোট প্রশ্ন", value: myQuestions.length },
          { label: "পাঠসমূহ", value: myLessons.length },
          { label: "কোর্স", value: myCourses.length },
          { label: "গড় প্রশ্ন/পাঠ", value: myLessons.length ? (myQuestions.length / myLessons.length).toFixed(1) : "0" },
        ].map((s) => (
          <div key={s.label} className="p-3 sm:p-4 rounded-2xl bg-card border border-border/50 shadow-card">
            <FileQuestion className="h-4 w-4 text-primary mb-1.5" />
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-xs shrink-0">কোর্স ফিল্টার:</Label>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="rounded-xl w-full sm:max-w-xs h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব কোর্স</SelectItem>
            {myCourses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {myLessons.length === 0 ? "প্রশ্ন যোগ করতে আগে পাঠ তৈরি করুন" : "কোনো প্রশ্ন পাওয়া যায়নি"}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, idx) => {
            const { lesson, course } = lessonLabel(q.lessonId);
            return (
              <div key={q.id} className="rounded-2xl bg-card border border-border/50 shadow-card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">প্রশ্ন #{idx + 1}</Badge>
                      <Badge variant="outline" className="text-[10px]">{course}</Badge>
                      <span className="text-[10px] text-muted-foreground truncate">{lesson}</span>
                    </div>
                    <p className="text-sm font-medium">{q.question}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(q.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>প্রশ্ন মুছবেন?</AlertDialogTitle>
                          <AlertDialogDescription>এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(q.id)}>মুছুন</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {q.options.map((opt, i) => {
                    const correct = i === q.correctAnswer;
                    return (
                      <div key={i} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs border ${correct ? "border-primary/40 bg-primary/5" : "border-border/50 bg-secondary/30"}`}>
                        {correct ? <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                        <span className={correct ? "font-medium" : "text-muted-foreground"}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "প্রশ্ন সম্পাদনা" : "নতুন কুইজ প্রশ্ন"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>পাঠ</Label>
              <Select value={form.lessonId} onValueChange={(v) => setForm({ ...form, lessonId: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="পাঠ নির্বাচন করুন" /></SelectTrigger>
                <SelectContent>
                  {myLessons.map((l) => {
                    const c = courses.find((x) => x.id === l.courseId);
                    return (
                      <SelectItem key={l.id} value={l.id}>
                        {c?.title} — {l.title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>প্রশ্ন</Label>
              <Input className="rounded-xl" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="প্রশ্ন লিখুন" />
            </div>
            <div className="space-y-2">
              <Label>অপশনসমূহ (সঠিক উত্তর নির্বাচন করুন)</Label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correctAnswer: i })}
                    className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${i === form.correctAnswer ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                    aria-label={`Option ${i + 1} correct`}
                  >
                    {i === form.correctAnswer ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </button>
                  <Input className="rounded-xl flex-1" value={opt} onChange={(e) => setOption(i, e.target.value)} placeholder={`অপশন ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" className="rounded-xl">বাতিল</Button></DialogClose>
            <Button className="rounded-xl bg-gradient-hero hover:opacity-90" onClick={handleSave}>
              {editingId ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizBuilder;

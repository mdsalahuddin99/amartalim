import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdmin } from "@/contexts/AdminContext";
import type { QuizQuestion } from "@/types/course";
import { toast } from "sonner";

const emptyForm = { lessonId: "", question: "", options: ["", "", "", ""], correctAnswer: 0 };

const AdminQuizzes = () => {
  const { courses, lessons, quizQuestions, addQuizQuestion, updateQuizQuestion, deleteQuizQuestion } = useAdmin();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState("all");

  const filteredQuestions = filterCourse === "all"
    ? quizQuestions
    : quizQuestions.filter((q) => {
        const lesson = lessons.find((l) => l.id === q.lessonId);
        return lesson?.courseId === filterCourse;
      });

  const setOption = (index: number, value: string) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  const validate = () => {
    if (!form.lessonId) { toast.error("একটি পাঠ নির্বাচন করুন"); return false; }
    if (!form.question.trim()) { toast.error("প্রশ্ন আবশ্যক"); return false; }
    if (form.options.some((o) => !o.trim())) { toast.error("সকল অপশন পূরণ করুন"); return false; }
    return true;
  };

  const handleCreate = () => {
    if (!validate()) return;
    addQuizQuestion({ lessonId: form.lessonId, question: form.question, options: form.options, correctAnswer: form.correctAnswer });
    setCreateOpen(false);
    toast.success("প্রশ্ন তৈরি হয়েছে");
  };

  const openEdit = (q: QuizQuestion) => {
    setEditingId(q.id);
    setForm({ lessonId: q.lessonId, question: q.question, options: [...q.options], correctAnswer: q.correctAnswer });
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId || !validate()) return;
    updateQuizQuestion(editingId, { lessonId: form.lessonId, question: form.question, options: form.options, correctAnswer: form.correctAnswer });
    setEditOpen(false);
    setEditingId(null);
    toast.success("প্রশ্ন আপডেট হয়েছে");
  };

  const handleDelete = (id: string) => {
    deleteQuizQuestion(id);
    toast.success("প্রশ্ন মুছে ফেলা হয়েছে");
  };

  const formFields = (
    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
      <div className="space-y-2">
        <Label>পাঠ</Label>
        <Select value={form.lessonId} onValueChange={(v) => setForm({ ...form, lessonId: v })}>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="একটি পাঠ নির্বাচন করুন" /></SelectTrigger>
          <SelectContent>
            {courses.map((course) => {
              const courseLessons = lessons.filter((l) => l.courseId === course.id);
              if (courseLessons.length === 0) return null;
              return (
                <div key={course.id}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{course.title}</div>
                  {courseLessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>
                  ))}
                </div>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>প্রশ্ন</Label>
        <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="প্রশ্নটি লিখুন" className="rounded-xl" />
      </div>

      <div className="space-y-3">
        <Label>অপশনসমূহ (সঠিক উত্তর চিহ্নিত করতে ক্লিক করুন)</Label>
        {form.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button type="button" onClick={() => setForm({ ...form, correctAnswer: i })} className="shrink-0">
              {form.correctAnswer === i ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground/40" />}
            </button>
            <Input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`অপশন ${String.fromCharCode(2453 + i)}`}
              className={`rounded-xl ${form.correctAnswer === i ? "border-success ring-1 ring-success/30" : ""}`}
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">সঠিক উত্তর চিহ্নিত করতে বৃত্তে ক্লিক করুন</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">কুইজসমূহ</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">{quizQuestions.length}টি প্রশ্ন</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (open) setForm(emptyForm); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> প্রশ্ন যোগ করুন</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader><DialogTitle>নতুন কুইজ প্রশ্ন</DialogTitle></DialogHeader>
            {formFields}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <DialogClose asChild><Button variant="outline" className="rounded-xl w-full sm:w-auto">বাতিল</Button></DialogClose>
              <Button onClick={handleCreate} className="rounded-xl w-full sm:w-auto">প্রশ্ন তৈরি করুন</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <Button variant={filterCourse === "all" ? "default" : "outline"} size="sm" className="rounded-full whitespace-nowrap shrink-0" onClick={() => setFilterCourse("all")}>
          সকল কোর্স
        </Button>
        {courses.map((c) => (
          <Button key={c.id} variant={filterCourse === c.id ? "default" : "outline"} size="sm" className="rounded-full whitespace-nowrap shrink-0 text-xs" onClick={() => setFilterCourse(c.id)}>
            {c.title}
          </Button>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
        {filteredQuestions.length === 0 ? (
          <div className="px-4 sm:px-5 py-12 text-center text-sm text-muted-foreground">
            কোনো কুইজ প্রশ্ন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredQuestions.map((q) => {
              const lesson = lessons.find((l) => l.id === q.lessonId);
              const course = courses.find((c) => c.id === lesson?.courseId);
              return (
                <div key={q.id} className="px-4 sm:px-5 py-3 sm:py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm">{q.question}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">{course?.title} → {lesson?.title}</div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                        {q.options.map((opt, i) => (
                          <span key={i} className={`text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full ${
                            i === q.correctAnswer ? "bg-success/10 text-success font-medium" : "bg-secondary text-secondary-foreground"
                          }`}>
                            {String.fromCharCode(2453 + i)}. {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(q)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>এই প্রশ্নটি মুছে ফেলবেন?</AlertDialogTitle>
                            <AlertDialogDescription>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">বাতিল</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(q.id)} className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">মুছে ফেলুন</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader><DialogTitle>প্রশ্ন সম্পাদনা</DialogTitle></DialogHeader>
          {formFields}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <DialogClose asChild><Button variant="outline" className="rounded-xl w-full sm:w-auto">বাতিল</Button></DialogClose>
            <Button onClick={handleUpdate} className="rounded-xl w-full sm:w-auto">সংরক্ষণ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuizzes;

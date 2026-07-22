import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Youtube } from "@/components/shared/BrandIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const emptyForm = { courseId: "", title: "", description: "", youtubeId: "", duration: "", order: 1 };

interface LessonBuilderProps {
  allowedCourseIds: string[];
}

const LessonBuilder = ({ allowedCourseIds }: LessonBuilderProps) => {
  const { courses, lessons, addLesson, updateLesson, deleteLesson } = useAdmin();
  const myCourses = courses.filter((c) => allowedCourseIds.includes(c.id));
  const myLessons = lessons.filter((l) => allowedCourseIds.includes(l.courseId));

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expanded, setExpanded] = useState<string | null>(myCourses[0]?.id ?? null);

  const validate = () => {
    if (!form.courseId) return toast.error("কোর্স নির্বাচন করুন"), false;
    if (!form.title.trim()) return toast.error("শিরোনাম আবশ্যক"), false;
    if (!form.youtubeId.trim()) return toast.error("YouTube ID আবশ্যক"), false;
    if (!form.duration.trim()) return toast.error("সময়কাল আবশ্যক"), false;
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      updateLesson(editingId, form);
      toast.success("পাঠ আপডেট হয়েছে");
    } else {
      addLesson(form);
      toast.success("পাঠ যোগ হয়েছে");
    }
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = (courseId?: string) => {
    const cid = courseId ?? myCourses[0]?.id ?? "";
    const nextOrder = (lessons.filter((l) => l.courseId === cid).length || 0) + 1;
    setEditingId(null);
    setForm({ ...emptyForm, courseId: cid, order: nextOrder });
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const l = lessons.find((x) => x.id === id);
    if (!l) return;
    setEditingId(id);
    setForm({
      courseId: l.courseId,
      title: l.title,
      description: l.description,
      youtubeId: l.youtubeId,
      duration: l.duration,
      order: l.order,
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteLesson(id);
    toast.success("পাঠ মুছে ফেলা হয়েছে");
  };

  const move = (id: string, dir: -1 | 1) => {
    const l = lessons.find((x) => x.id === id);
    if (!l) return;
    const siblings = lessons.filter((x) => x.courseId === l.courseId).sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((x) => x.id === id);
    const target = siblings[idx + dir];
    if (!target) return;
    updateLesson(l.id, { order: target.order });
    updateLesson(target.id, { order: l.order });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">পাঠ ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground text-sm mt-1">আপনার কোর্সে পাঠ যোগ, সম্পাদনা ও পুনর্বিন্যাস করুন</p>
        </div>
        <Button size="sm" className="rounded-xl bg-gradient-hero hover:opacity-90 shrink-0" onClick={() => openCreate()}>
          <Plus className="mr-1.5 h-4 w-4" /> নতুন পাঠ
        </Button>
      </div>

      {myCourses.length === 0 && (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          আপনার কোনো কোর্স নেই
        </div>
      )}

      <div className="space-y-3">
        {myCourses.map((course) => {
          const cls = myLessons
            .filter((l) => l.courseId === course.id)
            .sort((a, b) => a.order - b.order);
          const isOpen = expanded === course.id;
          return (
            <div key={course.id} className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : course.id)}
                className="w-full px-4 sm:px-5 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors"
              >
                <div className="min-w-0 flex-1 text-left">
                  <div className="font-semibold text-sm truncate">{course.title}</div>
                  <div className="text-[10px] text-muted-foreground">{cls.length}টি পাঠ</div>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">{course.categoryName}</Badge>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>

              {isOpen && (
                <div className="border-t divide-y divide-border/50">
                  {cls.length === 0 && (
                    <div className="px-4 sm:px-5 py-6 text-center text-xs text-muted-foreground">
                      এই কোর্সে এখনো কোনো পাঠ নেই
                    </div>
                  )}
                  {cls.map((lesson, i) => (
                    <div key={lesson.id} className="px-4 sm:px-5 py-3 flex items-center gap-3">
                      <div className="flex flex-col shrink-0">
                        <button type="button" onClick={() => move(lesson.id, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => move(lesson.id, 1)} disabled={i === cls.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{lesson.title}</div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <Youtube className="h-3 w-3" />
                          <span className="truncate">{lesson.youtubeId}</span>
                          <span>·</span>
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(lesson.id)}>
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
                              <AlertDialogTitle>পাঠ মুছবেন?</AlertDialogTitle>
                              <AlertDialogDescription>
                                এই পাঠ এবং এর সাথে যুক্ত কুইজ প্রশ্নগুলো মুছে যাবে।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(lesson.id)}>মুছুন</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 sm:px-5 py-3 bg-secondary/20">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs w-full" onClick={() => openCreate(course.id)}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> এই কোর্সে পাঠ যোগ করুন
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "পাঠ সম্পাদনা" : "নতুন পাঠ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>কোর্স</Label>
              <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="কোর্স নির্বাচন করুন" /></SelectTrigger>
                <SelectContent>
                  {myCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>পাঠের শিরোনাম</Label>
              <Input className="rounded-xl" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="যেমন: সূরা ফাতিহার তাফসীর" />
            </div>
            <div className="space-y-2">
              <Label>বিবরণ</Label>
              <Textarea className="rounded-xl min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="পাঠ সম্পর্কে সংক্ষিপ্ত বিবরণ" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>YouTube Video ID</Label>
                <Input className="rounded-xl" value={form.youtubeId} onChange={(e) => setForm({ ...form, youtubeId: e.target.value })} placeholder="dQw4w9WgXcQ" />
              </div>
              <div className="space-y-2">
                <Label>সময়কাল</Label>
                <Input className="rounded-xl" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="১৫ মিনিট" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ক্রম (Order)</Label>
              <Input type="number" min={1} className="rounded-xl" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 1 })} />
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

export default LessonBuilder;

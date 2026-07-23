import { useState } from "react";
import { Link, useNavigate } from "@/lib/navigation";
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronUp, X, Layers } from "lucide-react";
import { Youtube } from "@/components/shared/BrandIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdmin } from "@/contexts/AdminContext";
import type { Course, Lesson } from "@/types/course";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SmartImage from "@/components/shared/SmartImage";
const emptyCourseForm = {
  title: "", description: "", categoryId: "", price: 0,
  duration: "", level: "শিক্ষানবিস" as Course["level"], instructor: "আমারা রুয়েল",
  instructorBio: "", thumbnail: "",
  whatYouLearn: [] as string[],
  whoIsFor: [] as string[],
  benefits: [] as string[],
  problems: [] as { title: string; items: string[] }[],
};

const emptyLessonForm = { title: "", description: "", youtubeId: "", duration: "" };

// Reusable list editor for string arrays
const ListEditor = ({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (items: string[]) => void; placeholder: string }) => {
  const [newItem, setNewItem] = useState("");
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={placeholder} className="rounded-xl flex-1" onKeyDown={(e) => {
          if (e.key === "Enter" && newItem.trim()) { e.preventDefault(); onChange([...items, newItem.trim()]); setNewItem(""); }
        }} />
        <Button type="button" size="sm" variant="outline" className="rounded-xl shrink-0" onClick={() => { if (newItem.trim()) { onChange([...items, newItem.trim()]); setNewItem(""); } }}>যোগ</Button>
      </div>
      {items.length > 0 && (
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-secondary/50 rounded-lg px-3 py-2">
              <span className="flex-1">{item}</span>
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminCourses = () => {
  const { categories, courses, lessons, addCourse, updateCourse, deleteCourse, addLesson, updateLesson, deleteLesson } = useAdmin();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editLessonDialogOpen, setEditLessonDialogOpen] = useState(false);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [activeLessonCourseId, setActiveLessonCourseId] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreateCourse = () => {
    if (!courseForm.title.trim()) return toast.error("শিরোনাম আবশ্যক");
    if (!courseForm.categoryId) return toast.error("ক্যাটাগরি নির্বাচন করুন");
    const cat = categories.find((c) => c.id === courseForm.categoryId);
    addCourse({
      ...courseForm,
      categoryName: cat?.name || "",
      lessonsCount: 0, studentsCount: 0, rating: 0,
    });
    setCourseForm(emptyCourseForm);
    setCreateOpen(false);
    toast.success("কোর্স তৈরি হয়েছে");
  };

  const openEditCourse = (course: any) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title, description: course.description, categoryId: course.categoryId,
      price: course.price, duration: course.duration, level: course.level, instructor: course.instructorName || "",
      instructorBio: course.instructorBio || "", thumbnail: course.thumbnail || "",
      whatYouLearn: course.whatYouLearn || [], whoIsFor: course.whoIsFor || [],
      benefits: course.benefits || [], problems: course.problems || [],
    });
    setEditOpen(true);
  };

  const handleUpdateCourse = () => {
    if (!editingCourseId || !courseForm.title.trim()) return toast.error("শিরোনাম আবশ্যক");
    const cat = categories.find((c) => c.id === courseForm.categoryId);
    updateCourse(editingCourseId, { ...courseForm, categoryName: cat?.name || "" });
    setEditOpen(false);
    setEditingCourseId(null);
    toast.success("কোর্স আপডেট হয়েছে");
  };

  const handleDeleteCourse = (id: string) => {
    deleteCourse(id);
    toast.success("কোর্স ও পাঠসমূহ মুছে ফেলা হয়েছে");
  };

  const openAddLesson = (courseId: string) => {
    setActiveLessonCourseId(courseId);
    setLessonForm(emptyLessonForm);
    setLessonDialogOpen(true);
  };

  const handleCreateLesson = () => {
    if (!activeLessonCourseId || !lessonForm.title.trim()) return toast.error("শিরোনাম আবশ্যক");
    if (!lessonForm.youtubeId.trim()) return toast.error("YouTube ID আবশ্যক");
    const courseLessons = lessons.filter((l) => l.courseId === activeLessonCourseId);
    addLesson({ ...lessonForm, courseId: activeLessonCourseId, order: courseLessons.length + 1 });
    updateCourse(activeLessonCourseId, { lessonsCount: courseLessons.length + 1 });
    setLessonDialogOpen(false);
    toast.success("পাঠ যোগ হয়েছে");
  };

  const openEditLesson = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setLessonForm({ title: lesson.title || "", description: lesson.description || "", youtubeId: lesson.youtubeId || "", duration: lesson.duration ? String(lesson.duration) : "" });
    setEditLessonDialogOpen(true);
  };

  const handleUpdateLesson = () => {
    if (!editingLessonId || !lessonForm.title.trim()) return toast.error("শিরোনাম আবশ্যক");
    updateLesson(editingLessonId, lessonForm);
    setEditLessonDialogOpen(false);
    setEditingLessonId(null);
    toast.success("পাঠ আপডেট হয়েছে");
  };

  const handleDeleteLesson = (lessonId: string, courseId: string) => {
    deleteLesson(lessonId);
    const remaining = lessons.filter((l) => l.courseId === courseId && l.id !== lessonId);
    updateCourse(courseId, { lessonsCount: remaining.length });
    toast.success("পাঠ মুছে ফেলা হয়েছে");
  };

  // Problem editor helpers
  const addProblem = () => {
    setCourseForm({ ...courseForm, problems: [...courseForm.problems, { title: "", items: [] }] });
  };
  const updateProblem = (index: number, field: "title", value: string) => {
    const updated = [...courseForm.problems];
    updated[index] = { ...updated[index], [field]: value };
    setCourseForm({ ...courseForm, problems: updated });
  };
  const removeProblem = (index: number) => {
    setCourseForm({ ...courseForm, problems: courseForm.problems.filter((_, i) => i !== index) });
  };
  const addProblemItem = (pIndex: number, item: string) => {
    const updated = [...courseForm.problems];
    updated[pIndex] = { ...updated[pIndex], items: [...updated[pIndex].items, item] };
    setCourseForm({ ...courseForm, problems: updated });
  };
  const removeProblemItem = (pIndex: number, iIndex: number) => {
    const updated = [...courseForm.problems];
    updated[pIndex] = { ...updated[pIndex], items: updated[pIndex].items.filter((_, i) => i !== iIndex) };
    setCourseForm({ ...courseForm, problems: updated });
  };

  const courseFormFields = (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-4">
        <TabsTrigger value="basic" className="text-xs">মৌলিক তথ্য</TabsTrigger>
        <TabsTrigger value="content" className="text-xs">কন্টেন্ট</TabsTrigger>
        <TabsTrigger value="marketing" className="text-xs">মার্কেটিং</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 max-h-[50vh] overflow-y-auto">
        <div className="space-y-2">
          <Label>শিরোনাম</Label>
          <Input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="যেমন: রিয়্যাক্ট মাস্টারক্লাস" className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>বিবরণ</Label>
          <Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="কোর্সের বিবরণ" className="rounded-xl" rows={3} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>ক্যাটাগরি</Label>
            <Select value={courseForm.categoryId} onValueChange={(v) => setCourseForm({ ...courseForm, categoryId: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>স্তর</Label>
            <Select value={courseForm.level} onValueChange={(v) => setCourseForm({ ...courseForm, level: v as Course["level"] })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="শিক্ষানবিস">শিক্ষানবিস</SelectItem>
                <SelectItem value="মধ্যবর্তী">মধ্যবর্তী</SelectItem>
                <SelectItem value="উন্নত">উন্নত</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>মূল্য (৳)</Label>
            <Input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>সময়কাল</Label>
            <Input value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} placeholder="যেমন: ১২ ঘণ্টা ৩০ মি." className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>প্রশিক্ষক</Label>
          <Input value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>প্রশিক্ষক পরিচিতি</Label>
          <Textarea value={courseForm.instructorBio} onChange={(e) => setCourseForm({ ...courseForm, instructorBio: e.target.value })} placeholder="প্রশিক্ষকের সংক্ষিপ্ত পরিচিতি" className="rounded-xl" rows={2} />
        </div>
        <div className="space-y-2">
          <Label>থাম্বনেইল URL</Label>
          <Input value={courseForm.thumbnail} onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })} placeholder="https://example.com/image.jpg" className="rounded-xl" />
          {courseForm.thumbnail && (
            <div className="rounded-xl overflow-hidden border aspect-video max-h-32">
              <SmartImage src={courseForm.thumbnail} alt="থাম্বনেইল" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="content" className="space-y-4 max-h-[50vh] overflow-y-auto">
        <ListEditor
          label="এই কোর্সে যা শিখবেন"
          items={courseForm.whatYouLearn}
          onChange={(items) => setCourseForm({ ...courseForm, whatYouLearn: items })}
          placeholder="যেমন: React কম্পোনেন্ট আর্কিটেকচার"
        />
        <ListEditor
          label="কার জন্য এই কোর্স?"
          items={courseForm.whoIsFor}
          onChange={(items) => setCourseForm({ ...courseForm, whoIsFor: items })}
          placeholder="যেমন: ওয়েব ডেভেলপমেন্ট শিখতে আগ্রহী"
        />
        <ListEditor
          label="কেন এই কোর্সটি সেরা? (সুবিধাসমূহ)"
          items={courseForm.benefits}
          onChange={(items) => setCourseForm({ ...courseForm, benefits: items })}
          placeholder="যেমন: এক্সক্লুসিভ ভিডিও ক্লাস"
        />
      </TabsContent>

      <TabsContent value="marketing" className="space-y-4 max-h-[50vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <Label>সমস্যা চিহ্নিতকরণ সেকশন</Label>
          <Button type="button" size="sm" variant="outline" className="rounded-xl text-xs" onClick={addProblem}>
            <Plus className="mr-1 h-3 w-3" /> সমস্যা যোগ
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">শিক্ষার্থীদের সাধারণ সমস্যা যোগ করুন যাতে তারা relate করতে পারে।</p>
        {courseForm.problems.map((problem, pIndex) => (
          <div key={pIndex} className="p-3 rounded-xl border border-border/50 space-y-2 bg-secondary/20">
            <div className="flex items-center gap-2">
              <Input
                value={problem.title}
                onChange={(e) => updateProblem(pIndex, "title", e.target.value)}
                placeholder="সমস্যার শিরোনাম"
                className="rounded-xl flex-1 text-xs"
              />
              <button type="button" onClick={() => removeProblem(pIndex)} className="text-destructive"><X className="h-4 w-4" /></button>
            </div>
            {problem.items.map((item, iIndex) => (
              <div key={iIndex} className="flex items-center gap-2 text-xs bg-background rounded-lg px-2 py-1.5 ml-2">
                <span className="flex-1">{item}</span>
                <button type="button" onClick={() => removeProblemItem(pIndex, iIndex)} className="text-destructive"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <ProblemItemAdder onAdd={(item) => addProblemItem(pIndex, item)} />
          </div>
        ))}
        {courseForm.problems.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">কোনো সমস্যা সেকশন নেই। যোগ করলে কোর্স ডিটেইলস পেজে দেখাবে।</p>
        )}
      </TabsContent>
    </Tabs>
  );

  const lessonFormFields = (
    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
      <div className="space-y-2">
        <Label>শিরোনাম</Label>
        <Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="যেমন: রিয়্যাক্ট পরিচিতি" className="rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label>বিবরণ</Label>
        <Textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="পাঠের বিবরণ" className="rounded-xl" rows={2} />
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2"><Youtube className="h-4 w-4 text-destructive" /> YouTube ভিডিও ID</Label>
        <Input value={lessonForm.youtubeId} onChange={(e) => setLessonForm({ ...lessonForm, youtubeId: e.target.value })} placeholder="যেমন: dQw4w9WgXcQ" className="rounded-xl" />
        <p className="text-xs text-muted-foreground">YouTube URL থেকে শুধু ID অংশটি দিন</p>
      </div>
      <div className="space-y-2">
        <Label>সময়কাল</Label>
        <Input value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} placeholder="যেমন: ১২:৩০" className="rounded-xl" />
      </div>
      {lessonForm.youtubeId && (
        <div className="rounded-xl overflow-hidden border aspect-video">
          <iframe src={`https://www.youtube.com/embed/${lessonForm.youtubeId}`} title="প্রিভিউ" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">কোর্সসমূহ</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">{courses.length}টি কোর্স</p>
        </div>
        <Button
          className="rounded-xl w-full sm:w-auto"
          onClick={async () => {
            const defaultCat = categories[0];
            const id = await addCourse({
              title: "নতুন কোর্স",
              description: "",
              categoryId: defaultCat?.id || "",
              categoryName: defaultCat?.name || "",
              price: 0,
              duration: "",
              level: "শিক্ষানবিস",
              instructor: "আমারা রুয়েল",
              instructorBio: "",
              thumbnail: "",
              whatYouLearn: [],
              whoIsFor: [],
              benefits: [],
              problems: [],
              lessonsCount: 0,
              studentsCount: 0,
              rating: 0,
            });
            toast.success("খালি কোর্স তৈরি — বিল্ডারে নিয়ে যাওয়া হচ্ছে");
            navigate(`/admin/course-builder/${id}`);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> কোর্স যোগ করুন
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="কোর্স খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
      </div>

      <div className="space-y-3">
        {filtered.map((course) => {
          const courseLessons = lessons.filter((l) => l.courseId === course.id).sort((a, b) => a.order - b.order);
          const isExpanded = expandedCourse === course.id;

          return (
            <div key={course.id} className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
              <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-2">
                <button onClick={() => setExpandedCourse(isExpanded ? null : course.id)} className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 text-left">
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <div className="min-w-0">
                    <div className="font-medium text-xs sm:text-sm truncate">{course.title}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                      {course.categoryName} · ৳{course.price.toLocaleString()} · {courseLessons.length}টি পাঠ
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <Link to={`/admin/course-builder/${course.id}`}>
                    <Button size="sm" variant="outline" className="rounded-xl h-7 sm:h-8 text-[10px] sm:text-xs gap-1 px-2">
                      <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> বিল্ডার
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => openEditCourse(course)}><Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive"><Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm sm:text-base">"{course.title}" মুছে ফেলবেন?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs sm:text-sm">এটি স্থায়ীভাবে এই কোর্স এবং সকল পাঠ মুছে ফেলবে।</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">বাতিল</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCourse(course.id)} className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">মুছে ফেলুন</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border/50">
                  <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between bg-secondary/50">
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">পাঠ মডিউল</span>
                    <Button size="sm" variant="outline" className="rounded-xl h-7 text-[10px] sm:text-xs" onClick={() => openAddLesson(course.id)}>
                      <Plus className="mr-1 h-3 w-3" /> পাঠ যোগ
                    </Button>
                  </div>
                  {courseLessons.length === 0 ? (
                    <div className="px-4 sm:px-5 py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">
                      এখনো কোনো পাঠ নেই।
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {courseLessons.map((lesson, i) => (
                        <div key={lesson.id} className="px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
                          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-secondary flex items-center justify-center text-[10px] sm:text-xs font-medium shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm font-medium truncate">{lesson.title}</div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 sm:gap-2 mt-0.5">
                              <span className="truncate">{lesson.duration}</span>
                            </div>
                          </div>
                          <div className="flex gap-0.5 shrink-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" onClick={() => openEditLesson(lesson)}><Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3" /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 text-destructive"><Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-sm">"{lesson.title}" মুছে ফেলবেন?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-xs">এই পাঠের কুইজ প্রশ্নগুলোও মুছে যাবে।</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                  <AlertDialogCancel className="w-full sm:w-auto">বাতিল</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteLesson(lesson.id, course.id)} className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">মুছে ফেলুন</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">কোনো কোর্স পাওয়া যায়নি।</div>}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader><DialogTitle>কোর্স সম্পাদনা</DialogTitle></DialogHeader>
          {courseFormFields}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <DialogClose asChild><Button variant="outline" className="rounded-xl w-full sm:w-auto">বাতিল</Button></DialogClose>
            <Button onClick={handleUpdateCourse} className="rounded-xl w-full sm:w-auto">সংরক্ষণ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader><DialogTitle>পাঠ যোগ করুন</DialogTitle></DialogHeader>
          {lessonFormFields}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <DialogClose asChild><Button variant="outline" className="rounded-xl w-full sm:w-auto">বাতিল</Button></DialogClose>
            <Button onClick={handleCreateLesson} className="rounded-xl w-full sm:w-auto">পাঠ যোগ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editLessonDialogOpen} onOpenChange={setEditLessonDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader><DialogTitle>পাঠ সম্পাদনা</DialogTitle></DialogHeader>
          {lessonFormFields}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <DialogClose asChild><Button variant="outline" className="rounded-xl w-full sm:w-auto">বাতিল</Button></DialogClose>
            <Button onClick={handleUpdateLesson} className="rounded-xl w-full sm:w-auto">সংরক্ষণ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Small helper component for adding items to a problem
const ProblemItemAdder = ({ onAdd }: { onAdd: (item: string) => void }) => {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2 ml-2">
      <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="সমস্যার আইটেম" className="rounded-xl text-xs flex-1" onKeyDown={(e) => {
        if (e.key === "Enter" && val.trim()) { e.preventDefault(); onAdd(val.trim()); setVal(""); }
      }} />
      <Button type="button" size="sm" variant="outline" className="rounded-xl text-xs shrink-0" onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}>যোগ</Button>
    </div>
  );
};

export default AdminCourses;

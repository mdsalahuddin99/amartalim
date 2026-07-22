import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/navigation";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, GripVertical, ChevronDown, ChevronUp, Pencil, Trash2,
  FileQuestion, ClipboardList, BookOpen, Eye, Settings,
  FileText, Video, Radio, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdmin } from "@/contexts/AdminContext";
import type { Topic, QuizQuestion } from "@/types/course";
import { toast } from "sonner";

import { Item, ItemKind, itemId, parseItemId } from "./builder/types";
import { TopicForm } from "./builder/TopicForm";
import { LessonForm } from "./builder/LessonForm";
import { QuizForm } from "./builder/QuizForm";
import { AssignmentForm } from "./builder/AssignmentForm";
import { CourseSettingsPanel } from "./builder/CourseSettingsPanel";
import { useCourseBuilderHistory } from "./builder/useCourseBuilderHistory";
import { BuilderToolbar } from "./builder/BuilderToolbar";

interface Props {
  courseId: string;
  backHref?: string;
}

type DrawerState =
  | { kind: "topic"; topicId?: string }
  | { kind: "lesson"; topicId: string; lessonId?: string }
  | { kind: "quiz"; topicId: string; quizId?: string }
  | { kind: "assignment"; topicId: string; assignmentId?: string }
  | null;

const CourseBuilder = ({ courseId, backHref = "/admin/courses" }: Props) => {
  const {
    courses, topics, lessons, quizzes, assignments, quizQuestions,
    updateCourse, ensureDefaultTopic,
    addTopic, updateTopic, deleteTopic, reorderTopics,
    addLesson, updateLesson, deleteLesson,
    addQuiz, updateQuiz, deleteQuiz,
    addAssignment, updateAssignment, deleteAssignment,
    reorderTopicItems,
    addQuizQuestion, updateQuizQuestion, deleteQuizQuestion,
  } = useAdmin();

  const course = courses.find((c) => c.id === courseId);

  useEffect(() => {
    if (course) ensureDefaultTopic(course.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const courseTopics = useMemo(
    () => topics.filter((t) => t.courseId === courseId).sort((a, b) => a.order - b.order),
    [topics, courseId],
  );

  const itemsByTopic = useMemo(() => {
    const map: Record<string, Item[]> = {};
    courseTopics.forEach((t) => {
      const ls: Item[] = lessons.filter((l) => l.topicId === t.id).map((l) => ({ kind: "lesson", data: l }));
      const qs: Item[] = quizzes.filter((q) => q.topicId === t.id).map((q) => ({ kind: "quiz", data: q }));
      const as: Item[] = assignments.filter((a) => a.topicId === t.id).map((a) => ({ kind: "assignment", data: a }));
      map[t.id] = [...ls, ...qs, ...as].sort((a, b) => a.data.order - b.data.order);
    });
    return map;
  }, [courseTopics, lessons, quizzes, assignments]);

  const [drawer, setDrawer] = useState<DrawerState>(null);
  const history = useCourseBuilderHistory(courseId);

  if (!course) {
    return <div className="p-8 text-center text-sm text-muted-foreground">কোর্স পাওয়া যায়নি</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 sticky top-0 z-30 bg-background border-b border-border/50 px-1 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={backHref}>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">কোর্স বিল্ডার</div>
            <h1 className="font-bold text-base sm:text-lg truncate">{course.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BuilderToolbar history={history} />
          <Badge variant={course.published ? "default" : "secondary"} className="text-[10px]">
            {course.published ? "প্রকাশিত" : "ড্রাফট"}
          </Badge>
          <Link to={`/courses/${course.id}`}>
            <Button variant="outline" size="sm" className="rounded-xl text-xs h-8">
              <Eye className="mr-1 h-3.5 w-3.5" /> প্রিভিউ
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Curriculum */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> পাঠ্যসূচি
            </h2>
            <Button size="sm" className="rounded-xl bg-gradient-hero hover:opacity-90 h-8 text-xs" onClick={() => setDrawer({ kind: "topic" })}>
              <Plus className="mr-1 h-3.5 w-3.5" /> নতুন টপিক
            </Button>
          </div>

          {courseTopics.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <p className="text-sm text-muted-foreground mb-3">কোনো টপিক নেই</p>
              <Button size="sm" onClick={() => setDrawer({ kind: "topic" })} className="rounded-xl">
                <Plus className="mr-1 h-4 w-4" /> প্রথম টপিক যোগ করুন
              </Button>
            </div>
          ) : (
            <TopicSortable topics={courseTopics} onReorder={(ids) => reorderTopics(courseId, ids)}>
              {courseTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  items={itemsByTopic[topic.id] || []}
                  quizQuestions={quizQuestions}
                  onEditTopic={() => setDrawer({ kind: "topic", topicId: topic.id })}
                  onDeleteTopic={() => { deleteTopic(topic.id); toast.success("টপিক মুছে ফেলা হয়েছে"); }}
                  onAddLesson={() => setDrawer({ kind: "lesson", topicId: topic.id })}
                  onAddQuiz={() => setDrawer({ kind: "quiz", topicId: topic.id })}
                  onAddAssignment={() => setDrawer({ kind: "assignment", topicId: topic.id })}
                  onEditItem={(item) => {
                    if (item.kind === "lesson") setDrawer({ kind: "lesson", topicId: topic.id, lessonId: item.data.id });
                    else if (item.kind === "quiz") setDrawer({ kind: "quiz", topicId: topic.id, quizId: item.data.id });
                    else setDrawer({ kind: "assignment", topicId: topic.id, assignmentId: item.data.id });
                  }}
                  onDeleteItem={(item) => {
                    if (item.kind === "lesson") deleteLesson(item.data.id);
                    else if (item.kind === "quiz") deleteQuiz(item.data.id);
                    else deleteAssignment(item.data.id);
                    toast.success("আইটেম মুছে ফেলা হয়েছে");
                  }}
                  onReorderItems={(orderedIds) =>
                    reorderTopicItems(topic.id, orderedIds.map((s) => parseItemId(s)))
                  }
                />
              ))}
            </TopicSortable>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" /> কোর্স সেটিংস
          </h2>
          <CourseSettingsPanel course={course} allCourses={courses} onChange={(patch) => updateCourse(course.id, patch)} />
        </div>
      </div>

      {/* Drawers */}
      <Sheet open={drawer !== null} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto">
          {drawer?.kind === "topic" && (
            <TopicForm
              initial={drawer.topicId ? topics.find((t) => t.id === drawer.topicId) : undefined}
              onSave={(values) => {
                if (drawer.topicId) {
                  updateTopic(drawer.topicId, values);
                  toast.success("টপিক আপডেট হয়েছে");
                } else {
                  addTopic({ courseId, order: courseTopics.length + 1, title: values.title || "", summary: values.summary });
                  toast.success("টপিক যোগ হয়েছে");
                }
                setDrawer(null);
              }}
            />
          )}
          {drawer?.kind === "lesson" && (
            <LessonForm
              initial={drawer.lessonId ? lessons.find((l) => l.id === drawer.lessonId) : undefined}
              onSave={(values) => {
                if (drawer.lessonId) {
                  updateLesson(drawer.lessonId, values);
                  toast.success("পাঠ আপডেট হয়েছে");
                } else {
                  const ord = (itemsByTopic[drawer.topicId]?.length || 0) + 1;
                  addLesson({
                    courseId, topicId: drawer.topicId, order: ord,
                    title: values.title || "", description: values.description || "",
                    youtubeId: values.youtubeId || "", duration: values.duration || "",
                    contentType: values.contentType, body: values.body,
                    isPreview: values.isPreview, dripDays: values.dripDays,
                  });
                  toast.success("পাঠ যোগ হয়েছে");
                }
                setDrawer(null);
              }}
            />
          )}
          {drawer?.kind === "quiz" && (
            <QuizForm
              initial={drawer.quizId ? quizzes.find((q) => q.id === drawer.quizId) : undefined}
              quizQuestions={drawer.quizId ? quizQuestions.filter((q) => q.lessonId === drawer.quizId) : []}
              onSaveMeta={(values) => {
                if (drawer.quizId) {
                  updateQuiz(drawer.quizId, values);
                  return drawer.quizId;
                }
                const ord = (itemsByTopic[drawer.topicId]?.length || 0) + 1;
                const newId = addQuiz({
                  courseId, topicId: drawer.topicId, order: ord,
                  title: values.title || "", timeLimit: values.timeLimit,
                  passingScore: values.passingScore, attempts: values.attempts,
                });
                toast.success("কুইজ তৈরি হয়েছে");
                setDrawer({ kind: "quiz", topicId: drawer.topicId, quizId: newId });
                return newId;
              }}
              onAddQuestion={(quizId, q) => addQuizQuestion({ ...q, lessonId: quizId } as Omit<QuizQuestion, "id">)}
              onUpdateQuestion={(id, q) => updateQuizQuestion(id, q)}
              onDeleteQuestion={(id) => deleteQuizQuestion(id)}
              onClose={() => setDrawer(null)}
            />
          )}
          {drawer?.kind === "assignment" && (
            <AssignmentForm
              initial={drawer.assignmentId ? assignments.find((a) => a.id === drawer.assignmentId) : undefined}
              onSave={(values) => {
                if (drawer.assignmentId) {
                  updateAssignment(drawer.assignmentId, values);
                  toast.success("অ্যাসাইনমেন্ট আপডেট হয়েছে");
                } else {
                  const ord = (itemsByTopic[drawer.topicId]?.length || 0) + 1;
                  addAssignment({
                    courseId, topicId: drawer.topicId, order: ord,
                    title: values.title || "", instructions: values.instructions,
                    maxPoints: values.maxPoints, dueDays: values.dueDays,
                  });
                  toast.success("অ্যাসাইনমেন্ট যোগ হয়েছে");
                }
                setDrawer(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

/* ============================================================ */
const TopicSortable = ({
  topics, onReorder, children,
}: { topics: Topic[]; onReorder: (ids: string[]) => void; children: React.ReactNode }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = topics.map((t) => t.id);
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    onReorder(arrayMove(ids, oldIdx, newIdx));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
      <SortableContext items={topics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">{children}</div>
      </SortableContext>
    </DndContext>
  );
};

const TopicCard = ({
  topic, items, quizQuestions,
  onEditTopic, onDeleteTopic,
  onAddLesson, onAddQuiz, onAddAssignment,
  onEditItem, onDeleteItem, onReorderItems,
}: {
  topic: Topic;
  items: Item[];
  quizQuestions: QuizQuestion[];
  onEditTopic: () => void;
  onDeleteTopic: () => void;
  onAddLesson: () => void;
  onAddQuiz: () => void;
  onAddAssignment: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onReorderItems: (orderedIds: string[]) => void;
}) => {
  const [open, setOpen] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: topic.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const sortableIds = items.map((it) => itemId(it.kind, it.data.id));
  const handleEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = sortableIds.indexOf(String(active.id));
    const newIdx = sortableIds.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    onReorderItems(arrayMove(sortableIds, oldIdx, newIdx));
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-3 bg-secondary/30">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes} {...listeners}
          aria-label="Reorder topic"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex-1 flex items-center gap-2 min-w-0 text-left">
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{topic.title}</div>
            {topic.summary && <div className="text-[10px] text-muted-foreground truncate">{topic.summary}</div>}
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">{items.length} আইটেম</Badge>
        </button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEditTopic}>
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
              <AlertDialogTitle>টপিক মুছবেন?</AlertDialogTitle>
              <AlertDialogDescription>এই টপিকের সব পাঠ, কুইজ ও অ্যাসাইনমেন্ট মুছে যাবে।</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>বাতিল</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteTopic}>মুছুন</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {open && (
        <div className="border-t">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">এই টপিকে এখনো কোনো আইটেম নেই</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <div className="divide-y divide-border/50">
                  {items.map((item) => (
                    <SortableItemRow
                      key={itemId(item.kind, item.data.id)}
                      item={item}
                      quizQuestions={quizQuestions}
                      onEdit={() => onEditItem(item)}
                      onDelete={() => onDeleteItem(item)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          <div className="px-3 py-3 bg-secondary/20 border-t flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-xl text-xs h-8" onClick={onAddLesson}>
              <Video className="mr-1 h-3 w-3" /> পাঠ
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl text-xs h-8" onClick={onAddQuiz}>
              <FileQuestion className="mr-1 h-3 w-3" /> কুইজ
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl text-xs h-8" onClick={onAddAssignment}>
              <ClipboardList className="mr-1 h-3 w-3" /> অ্যাসাইনমেন্ট
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const itemMeta = (item: Item, quizQuestions: QuizQuestion[]) => {
  if (item.kind === "lesson") {
    const l = item.data;
    const Icon = l.contentType === "text" ? FileText : l.contentType === "live" ? Radio : Video;
    return { Icon, label: "পাঠ", meta: l.duration || (l.contentType === "text" ? "টেক্সট" : "—") };
  }
  if (item.kind === "quiz") {
    const q = item.data;
    const count = quizQuestions.filter((x) => x.lessonId === q.id).length;
    return { Icon: FileQuestion, label: "কুইজ", meta: `${count} প্রশ্ন` };
  }
  const a = item.data;
  return { Icon: ClipboardList, label: "অ্যাসাইনমেন্ট", meta: a.maxPoints ? `${a.maxPoints} নম্বর` : "—" };
};

const SortableItemRow = ({
  item, quizQuestions, onEdit, onDelete,
}: { item: Item; quizQuestions: QuizQuestion[]; onEdit: () => void; onDelete: () => void }) => {
  const sid = itemId(item.kind, item.data.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sid });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const { Icon, label, meta } = itemMeta(item, quizQuestions);

  return (
    <div ref={setNodeRef} style={style} className="px-3 sm:px-4 py-3 flex items-center gap-2 bg-card">
      <button type="button" className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground" {...attributes} {...listeners}>
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-3 w-3 text-primary" />
      </span>
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <div className="text-sm font-medium truncate">{item.data.title || "শিরোনামহীন"}</div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{label}</Badge>
          <span>{meta}</span>
          {item.kind === "lesson" && item.data.isPreview && (
            <Badge variant="outline" className="text-[9px] h-4 px-1.5">প্রিভিউ</Badge>
          )}
        </div>
      </button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
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
            <AlertDialogTitle>মুছবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>মুছুন</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseBuilder;

"use client";

import { useMemo, useState } from "react";
import { Link } from "@/lib/navigation";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";

import { Item, ItemKind, itemId, parseItemId } from "./builder/types";
import { TopicForm } from "./builder/TopicForm";
import { LessonForm } from "./builder/LessonForm";
import { QuizForm } from "./builder/QuizForm";
import { AssignmentForm } from "./builder/AssignmentForm";
import { CourseSettingsPanel } from "./builder/CourseSettingsPanel";
// Import Server Actions
import {
  createTopic, updateTopic, deleteTopic, reorderTopics,
  createLesson, updateLesson, deleteLesson,
  createAssignment, updateAssignment, deleteAssignment,
  createQuiz, updateQuiz, deleteQuiz,
  reorderTopicItems,
} from "@/server/actions/admin-builder";
import { createQuizQuestion, updateQuizQuestion, deleteQuizQuestion } from "@/server/actions/admin-quizzes";
import { updateCourse } from "@/server/actions/admin-courses";

interface Props {
  initialCourse: any;
  categories: any[];
  backHref?: string;
}

type DrawerState =
  | { kind: "topic"; topicId?: string }
  | { kind: "lesson"; topicId: string; lessonId?: string }
  | { kind: "quiz"; topicId: string; quizId?: string }
  | { kind: "assignment"; topicId: string; assignmentId?: string }
  | null;

const CourseBuilder = ({ initialCourse, categories, backHref = "/admin/courses" }: Props) => {
  const router = useRouter();
  const [drawer, setDrawer] = useState<DrawerState>(null);
  
  const course = initialCourse;
  
  const courseTopics = useMemo(() => {
    return [...(course?.topics || [])].sort((a: any, b: any) => a.order - b.order);
  }, [course]);

  const itemsByTopic = useMemo(() => {
    const map: Record<string, Item[]> = {};
    courseTopics.forEach((t: any) => {
      const ls: Item[] = (t.lessons || []).map((l: any) => ({ kind: "lesson", data: l }));
      const qs: Item[] = (t.quizzes || []).map((q: any) => ({ kind: "quiz", data: q }));
      const as: Item[] = (t.assignments || []).map((a: any) => ({ kind: "assignment", data: a }));
      map[t.id] = [...ls, ...qs, ...as].sort((a, b) => a.data.order - b.data.order);
    });
    return map;
  }, [courseTopics]);

  const quizQuestions = useMemo(() => {
    let qs: any[] = [];
    courseTopics.forEach((t: any) => {
      (t.quizzes || []).forEach((q: any) => {
        qs = [...qs, ...(q.questions || [])];
      });
    });
    return qs;
  }, [courseTopics]);

  if (!course) {
    return <div className="p-8 text-center text-sm text-muted-foreground">কোর্স পাওয়া যায়নি</div>;
  }

  // Wrappers to handle actions and refresh
  const handleAddTopic = async (data: any) => {
    await createTopic(course.id, data.title || "");
    toast.success("টপিক যোগ হয়েছে");
    router.refresh();
  };
  
  const handleUpdateTopic = async (id: string, data: any) => {
    await updateTopic(id, data.title || "");
    toast.success("টপিক আপডেট হয়েছে");
    router.refresh();
  };
  
  const handleDeleteTopic = async (id: string) => {
    await deleteTopic(id, course.id);
    toast.success("টপিক মুছে ফেলা হয়েছে");
    router.refresh();
  };
  
  const handleReorderTopics = async (ids: string[]) => {
    await reorderTopics(course.id, ids);
    router.refresh();
  };

  const handleReorderItems = async (topicId: string, orderedIds: { kind: ItemKind, id: string }[]) => {
    const items = orderedIds.map((item, index) => ({ id: item.id, type: item.kind, order: index + 1 }));
    await reorderTopicItems(course.id, items);
    router.refresh();
  };
  
  const handleAddLesson = async (topicId: string, values: any) => {
    const ord = (itemsByTopic[topicId]?.length || 0) + 1;
    await createLesson({
      courseId: course.id, topicId, order: ord,
      title: values.title || "", description: values.description || "",
      youtubeId: values.youtubeId || "", duration: values.duration || "",
    });
    toast.success("পাঠ যোগ হয়েছে");
    router.refresh();
  };

  const handleUpdateLesson = async (id: string, values: any) => {
    await updateLesson(id, values);
    toast.success("পাঠ আপডেট হয়েছে");
    router.refresh();
  };
  
  const handleDeleteLesson = async (id: string) => {
    await deleteLesson(id, course.id);
    toast.success("পাঠ মুছে ফেলা হয়েছে");
    router.refresh();
  };

  const handleAddAssignment = async (topicId: string, values: any) => {
    const ord = (itemsByTopic[topicId]?.length || 0) + 1;
    await createAssignment({
      courseId: course.id, topicId, order: ord,
      title: values.title || "", description: values.instructions || "",
      totalMarks: values.maxPoints || 100, passMarks: values.passMarks || 33,
    });
    toast.success("অ্যাসাইনমেন্ট যোগ হয়েছে");
    router.refresh();
  };
  
  const handleUpdateAssignment = async (id: string, values: any) => {
    await updateAssignment(id, {
      title: values.title, description: values.instructions,
      totalMarks: values.maxPoints, passMarks: values.passMarks,
    });
    toast.success("অ্যাসাইনমেন্ট আপডেট হয়েছে");
    router.refresh();
  };
  
  const handleDeleteAssignment = async (id: string) => {
    await deleteAssignment(id, course.id);
    toast.success("অ্যাসাইনমেন্ট মুছে ফেলা হয়েছে");
    router.refresh();
  };

  const handleAddQuiz = async (topicId: string, values: any) => {
    const ord = (itemsByTopic[topicId]?.length || 0) + 1;
    const res = await createQuiz({
      courseId: course.id, topicId, order: ord,
      title: values.title || "", description: values.description || "",
    });
    toast.success("কুইজ তৈরি হয়েছে");
    router.refresh();
    return res.quiz.id;
  };
  
  const handleUpdateQuiz = async (id: string, values: any) => {
    await updateQuiz(id, values, course.id);
    toast.success("কুইজ আপডেট হয়েছে");
    router.refresh();
    return id;
  };

  const handleDeleteQuiz = async (id: string) => {
    await deleteQuiz(id, course.id);
    toast.success("কুইজ মুছে ফেলা হয়েছে");
    router.refresh();
  };

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
            <TopicSortable topics={courseTopics} onReorder={handleReorderTopics}>
              {courseTopics.map((topic: any) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  items={itemsByTopic[topic.id] || []}
                  quizQuestions={quizQuestions}
                  onEditTopic={() => setDrawer({ kind: "topic", topicId: topic.id })}
                  onDeleteTopic={() => handleDeleteTopic(topic.id)}
                  onAddLesson={() => setDrawer({ kind: "lesson", topicId: topic.id })}
                  onAddQuiz={() => setDrawer({ kind: "quiz", topicId: topic.id })}
                  onAddAssignment={() => setDrawer({ kind: "assignment", topicId: topic.id })}
                  onEditItem={(item) => {
                    if (item.kind === "lesson") setDrawer({ kind: "lesson", topicId: topic.id, lessonId: item.data.id });
                    else if (item.kind === "quiz") setDrawer({ kind: "quiz", topicId: topic.id, quizId: item.data.id });
                    else setDrawer({ kind: "assignment", topicId: topic.id, assignmentId: item.data.id });
                  }}
                  onDeleteItem={(item) => {
                    if (item.kind === "lesson") handleDeleteLesson(item.data.id);
                    else if (item.kind === "quiz") handleDeleteQuiz(item.data.id);
                    else handleDeleteAssignment(item.data.id);
                  }}
                  onReorderItems={(orderedIds) =>
                    handleReorderItems(topic.id, orderedIds.map((s) => parseItemId(s)))
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
          <CourseSettingsPanel
            course={course}
            allCourses={[course]}
            categories={categories}
            onChange={async (patch) => {
              await updateCourse(course.id, patch);
              toast.success("কোর্স সেটিংস আপডেট হয়েছে");
              router.refresh();
            }}
          />
        </div>
      </div>

      {/* Drawers */}
      <Sheet open={drawer !== null} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto">
          {drawer?.kind === "topic" && (
            <TopicForm
              initial={drawer.topicId ? courseTopics.find((t: any) => t.id === drawer.topicId) : undefined}
              onSave={(values) => {
                if (drawer.topicId) handleUpdateTopic(drawer.topicId, values);
                else handleAddTopic(values);
                setDrawer(null);
              }}
            />
          )}
          {drawer?.kind === "lesson" && (
            <LessonForm
              initial={drawer.lessonId ? itemsByTopic[drawer.topicId]?.find((i) => i.data.id === drawer.lessonId)?.data : undefined}
              onSave={(values) => {
                if (drawer.lessonId) handleUpdateLesson(drawer.lessonId, values);
                else handleAddLesson(drawer.topicId, values);
                setDrawer(null);
              }}
            />
          )}
          {drawer?.kind === "quiz" && (
            <QuizForm
              initial={drawer.quizId ? itemsByTopic[drawer.topicId]?.find((i) => i.data.id === drawer.quizId)?.data : undefined}
              quizQuestions={drawer.quizId ? quizQuestions.filter((q) => q.lessonId === drawer.quizId) : []}
              onSaveMeta={async (values) => {
                if (drawer.quizId) return await handleUpdateQuiz(drawer.quizId, values);
                const newId = await handleAddQuiz(drawer.topicId, values);
                setDrawer({ kind: "quiz", topicId: drawer.topicId, quizId: newId });
                return newId;
              }}
              onAddQuestion={async (quizId, q) => { await createQuizQuestion({ ...q, lessonId: quizId }); router.refresh(); }}
              onUpdateQuestion={async (id, q) => { await updateQuizQuestion(id, q); router.refresh(); }}
              onDeleteQuestion={async (id) => { await deleteQuizQuestion(id); router.refresh(); }}
              onClose={() => setDrawer(null)}
            />
          )}
          {drawer?.kind === "assignment" && (
            <AssignmentForm
              initial={drawer.assignmentId ? itemsByTopic[drawer.topicId]?.find((i) => i.data.id === drawer.assignmentId)?.data : undefined}
              onSave={(values) => {
                if (drawer.assignmentId) handleUpdateAssignment(drawer.assignmentId, values);
                else handleAddAssignment(drawer.topicId, values);
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
}: { topics: any[]; onReorder: (ids: string[]) => void; children: React.ReactNode }) => {
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
  topic: any;
  items: Item[];
  quizQuestions: any[];
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

const itemMeta = (item: Item, quizQuestions: any[]) => {
  if (item.kind === "lesson") {
    const l = item.data;
    const Icon = l.contentType === "text" ? FileText : l.contentType === "live" ? Radio : Video;
    return { Icon, label: "পাঠ", meta: l.duration ? `${Math.floor(l.duration/60)} মিনিট` : (l.contentType === "text" ? "টেক্সট" : "—") };
  }
  if (item.kind === "quiz") {
    const q = item.data;
    const count = quizQuestions.filter((x) => x.lessonId === q.id).length;
    return { Icon: FileQuestion, label: "কুইজ", meta: `${count} প্রশ্ন` };
  }
  const a = item.data;
  return { Icon: ClipboardList, label: "অ্যাসাইনমেন্ট", meta: a.totalMarks ? `${a.totalMarks} নম্বর` : "—" };
};

const SortableItemRow = ({
  item, quizQuestions, onEdit, onDelete,
}: { item: Item; quizQuestions: any[]; onEdit: () => void; onDelete: () => void }) => {
  const sid = itemId(item.kind, item.data.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sid });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const { Icon, label, meta } = itemMeta(item, quizQuestions);

  return (
    <div ref={setNodeRef} style={style} className="px-3 sm:px-4 py-3 flex items-center gap-2 bg-card z-10 relative">
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

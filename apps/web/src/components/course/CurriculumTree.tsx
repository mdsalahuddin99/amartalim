import { useState } from "react";
import { Link } from "@/lib/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronDown, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CurriculumLesson {
  id: string;
  title: string;
  duration?: string;
  isFreePreview?: boolean;
  completed?: boolean;
  /** Optional href; if absent the row is non-clickable (locked/preview-only) */
  href?: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  lessons: CurriculumLesson[];
}

interface Props {
  modules: CurriculumModule[];
  /** Index of module open by default (-1 = all closed). Default 0. */
  defaultOpen?: number;
  /** If true, allow multiple modules open at once. */
  multiple?: boolean;
  className?: string;
}

/**
 * Reusable collapsible curriculum tree.
 * Used by course detail page and student "my courses" expand view.
 * Locked lessons (no href, not preview) get a lock icon.
 */
const CurriculumTree = ({
  modules,
  defaultOpen = 0,
  multiple = false,
  className,
}: Props) => {
  const [open, setOpen] = useState<Set<number>>(
    () => new Set(defaultOpen >= 0 ? [defaultOpen] : []),
  );

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (modules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        এখনো কোনো মডিউল যুক্ত হয়নি।
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {modules.map((mod, i) => {
        const isOpen = open.has(i);
        const completedCount = mod.lessons.filter((l) => l.completed).length;
        return (
          <div
            key={mod.id}
            className="rounded-xl border border-border/60 overflow-hidden bg-card"
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-secondary/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {mod.lessons.length}টি পাঠ
                    {mod.duration ? ` • ${mod.duration}` : ""}
                    {completedCount > 0
                      ? ` • ${completedCount}/${mod.lessons.length} সম্পন্ন`
                      : ""}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border/50 overflow-hidden"
                >
                  <ul className="p-2 sm:p-3 space-y-0.5">
                    {mod.lessons.map((lesson) => (
                      <LessonRow key={lesson.id} lesson={lesson} />
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

const LessonRow = ({ lesson }: { lesson: CurriculumLesson }) => {
  const accessible = !!lesson.href || lesson.isFreePreview;
  const Icon = lesson.completed ? CheckCircle2 : accessible ? Play : Lock;

  const content = (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/40 transition-colors">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
          lesson.completed
            ? "bg-primary/15 text-primary"
            : accessible
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-3 w-3" />
      </div>
      <span
        className={cn(
          "text-sm flex-1 truncate",
          accessible ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {lesson.title}
      </span>
      {lesson.isFreePreview && (
        <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">
          ফ্রি
        </span>
      )}
      {lesson.duration && (
        <span className="text-xs text-muted-foreground shrink-0">
          {lesson.duration}
        </span>
      )}
    </div>
  );

  if (lesson.href) {
    return (
      <li>
        <Link to={lesson.href}>{content}</Link>
      </li>
    );
  }
  return <li aria-disabled={!accessible}>{content}</li>;
};

export default CurriculumTree;

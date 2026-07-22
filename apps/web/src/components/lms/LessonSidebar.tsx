import { Link } from "@/lib/navigation";
import { CheckCircle2, Circle, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import CourseProgressBar from "@/components/course/CourseProgressBar";

export interface SidebarLesson {
  id: string;
  title: string;
  duration?: string;
  isFreePreview?: boolean;
  locked?: boolean;
}

interface Props {
  courseId: string;
  courseTitle: string;
  lessons: SidebarLesson[];
  activeLessonId?: string;
  completedLessonIds?: string[];
  /** "aside" (default) renders the desktop sticky aside; "panel" renders flush content for a Sheet/Drawer. */
  variant?: "aside" | "panel";
  /** Called when a lesson link is tapped — useful for closing the mobile drawer. */
  onNavigate?: () => void;
}

/**
 * Vertical lesson navigator shown alongside the player on `/courses/:id/lessons/:lid`.
 * Pure presentational — progress data is passed in by the parent.
 */
const LessonSidebar = ({
  courseId,
  courseTitle,
  lessons,
  activeLessonId,
  completedLessonIds = [],
  variant = "aside",
  onNavigate,
}: Props) => {
  const completedCount = lessons.filter((l) => completedLessonIds.includes(l.id)).length;

  const isPanel = variant === "panel";

  return (
    <aside
      className={cn(
        isPanel
          ? "w-full h-full"
          : "hidden lg:block w-full lg:w-80 shrink-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]",
      )}
    >
      <div className={cn("overflow-hidden", isPanel ? "h-full flex flex-col" : "rounded-lg border bg-card")}>

        <header className="p-4 border-b">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">কোর্স</p>
          <h3 className="font-serif-bn font-bold text-sm leading-snug line-clamp-2">
            {courseTitle}
          </h3>
          <div className="mt-3">
            <CourseProgressBar
              completed={completedCount}
              total={lessons.length}
              size="sm"
              showLabel
            />
          </div>
        </header>

        <ol className={cn("divide-y divide-border", isPanel ? "flex-1 overflow-y-auto" : "lg:max-h-[60vh] lg:overflow-y-auto")}>

          {lessons.map((l, i) => {
            const isActive = l.id === activeLessonId;
            const isDone = completedLessonIds.includes(l.id);
            const isLocked = l.locked && !l.isFreePreview;

            const inner = (
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isLocked
                      ? "text-muted-foreground"
                      : "hover:bg-muted/50",
                )}
              >
                <span className="w-5 shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : isActive ? (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-medium">
                    {i + 1}. {l.title}
                  </span>
                  {l.duration && (
                    <span className="block text-xs text-muted-foreground">{l.duration}</span>
                  )}
                </span>
                {l.isFreePreview && (
                  <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
                    ফ্রি
                  </span>
                )}
              </div>
            );

            return (
              <li key={l.id}>
                {isLocked ? (
                  <div aria-disabled>{inner}</div>
                ) : (
                  <Link to={`/courses/${courseId}/lessons/${l.id}`} onClick={onNavigate}>{inner}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
};

export default LessonSidebar;

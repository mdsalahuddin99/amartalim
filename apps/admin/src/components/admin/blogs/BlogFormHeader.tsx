import { ArrowLeft, CalendarClock, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estimateReadTime } from "./constants";

interface Props {
  isEditing: boolean;
  title: string;
  content: string;
  canSchedule: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onSchedule: () => void;
  onPublish: () => void;
}

export const BlogFormHeader = ({
  isEditing, title, content, canSchedule, isSubmitting, onClose, onSaveDraft, onSchedule, onPublish,
}: Props) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50 sticky top-0 bg-background z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 py-3">
    <div className="flex items-center gap-3 min-w-0">
      <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0" disabled={isSubmitting}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
          {isEditing ? "ব্লগ এডিট" : "নতুন ব্লগ"}
        </h1>
        <p className="text-xs text-muted-foreground truncate">
          {title || "শিরোনামহীন"} · {estimateReadTime(content)} মিনিট পড়া
        </p>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onSaveDraft} disabled={isSubmitting} className="gap-2">
        <Save className="h-4 w-4" /> ড্রাফট
      </Button>
      <Button variant="outline" onClick={onSchedule} disabled={!canSchedule || isSubmitting} className="gap-2">
        <CalendarClock className="h-4 w-4" /> নির্ধারণ
      </Button>
      <Button onClick={onPublish} disabled={isSubmitting} className="gap-2">
        <Send className="h-4 w-4" /> {isSubmitting ? "সংরক্ষণ..." : "প্রকাশ"}
      </Button>
    </div>
  </div>
);

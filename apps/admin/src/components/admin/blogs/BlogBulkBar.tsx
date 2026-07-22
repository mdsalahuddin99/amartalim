import { Send, EyeOff, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  count: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onFeature: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export const BlogBulkBar = ({ count, onPublish, onUnpublish, onFeature, onDelete, onClear }: Props) => {
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/30">
      <span className="text-sm font-medium mr-2">{count} টি নির্বাচিত</span>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={onPublish}>
        <Send className="h-3.5 w-3.5" /> প্রকাশ
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={onUnpublish}>
        <EyeOff className="h-3.5 w-3.5" /> আনপাবলিশ
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={onFeature}>
        <Star className="h-3.5 w-3.5" /> ফিচার্ড
      </Button>
      <Button size="sm" variant="destructive" className="gap-1.5 ml-auto" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" /> মুছুন
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>বাতিল</Button>
    </div>
  );
};

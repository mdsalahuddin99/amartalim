import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  count: number;
  onDelete: () => void;
  onClear: () => void;
}

export const BlogBulkBar = ({ count, onDelete, onClear }: Props) => {
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/30">
      <span className="text-sm font-medium mr-2">{count} টি নির্বাচিত</span>
      <Button size="sm" variant="destructive" className="gap-1.5 ml-auto" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" /> মুছুন
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>বাতিল</Button>
    </div>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const TopicForm = ({
  initial, onSave,
}: { initial?: any; onSave: (v: any) => void }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  return (
    <>
      <SheetHeader>
        <SheetTitle>{initial ? "টপিক সম্পাদনা" : "নতুন টপিক"}</SheetTitle>
      </SheetHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>শিরোনাম</Label>
          <Input className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: প্রাথমিক পাঠ" />
        </div>
        <div className="space-y-2">
          <Label>সংক্ষিপ্ত বিবরণ</Label>
          <Textarea className="rounded-xl min-h-[80px]" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild><Button variant="outline" className="rounded-xl">বাতিল</Button></SheetClose>
        <Button
          className="rounded-xl bg-gradient-hero hover:opacity-90"
          onClick={() => {
            if (!title.trim()) return toast.error("শিরোনাম আবশ্যক");
            onSave({ title: title.trim(), summary });
          }}
        >
          <Save className="mr-1 h-4 w-4" /> সংরক্ষণ
        </Button>
      </SheetFooter>
    </>
  );
};

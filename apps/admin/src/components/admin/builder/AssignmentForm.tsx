import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { FileText, Save, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export const AssignmentForm = ({
  initial, onSave,
}: { initial?: any; onSave: (v: any) => void }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [instructions, setInstructions] = useState(initial?.instructions || "");
  const [maxPoints, setMaxPoints] = useState<number | "">(initial?.maxPoints ?? 100);
  const [dueDays, setDueDays] = useState<number | "">(initial?.dueDays ?? 7);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          {initial ? "অ্যাসাইনমেন্ট সম্পাদনা" : "নতুন অ্যাসাইনমেন্ট"}
        </SheetTitle>
      </SheetHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>শিরোনাম</Label>
          <Input className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>নির্দেশনা</Label>
          <Textarea className="rounded-xl min-h-[160px]" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="শিক্ষার্থীদের কী করতে হবে বিস্তারিত লিখুন" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>সর্বোচ্চ নম্বর</Label>
            <Input type="number" className="rounded-xl" value={maxPoints} onChange={(e) => setMaxPoints(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>সময়সীমা (দিন)</Label>
            <Input type="number" className="rounded-xl" value={dueDays} onChange={(e) => setDueDays(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild><Button variant="outline" className="rounded-xl">বাতিল</Button></SheetClose>
        <Button
          className="rounded-xl bg-gradient-hero hover:opacity-90"
          onClick={() => {
            if (!title.trim()) return toast.error("শিরোনাম আবশ্যক");
            onSave({
              title: title.trim(), instructions,
              maxPoints: maxPoints === "" ? undefined : Number(maxPoints),
              dueDays: dueDays === "" ? undefined : Number(dueDays),
            });
          }}
        >
          <Save className="mr-1 h-4 w-4" /> সংরক্ষণ
        </Button>
      </SheetFooter>
    </>
  );
};

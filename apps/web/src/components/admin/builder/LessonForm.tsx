import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Save, Video, FileText, Radio } from "lucide-react";
import { Youtube } from "@/components/shared/BrandIcons";
import { toast } from "sonner";
import type { Lesson } from "@/contexts/AdminContext";

export const LessonForm = ({
  initial, onSave,
}: { initial?: Lesson; onSave: (v: Partial<Lesson>) => void }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [contentType, setContentType] = useState<Lesson["contentType"]>(initial?.contentType || "video");
  const [youtubeId, setYoutubeId] = useState(initial?.youtubeId || "");
  const [duration, setDuration] = useState(initial?.duration || "");
  const [body, setBody] = useState(initial?.body || "");
  const [isPreview, setIsPreview] = useState(!!initial?.isPreview);
  const [dripDays, setDripDays] = useState<number | "">(initial?.dripDays ?? "");

  const submit = () => {
    if (!title.trim()) return toast.error("শিরোনাম আবশ্যক");
    if (contentType === "video" && !youtubeId.trim()) return toast.error("YouTube ID আবশ্যক");
    onSave({
      title: title.trim(), description, contentType, youtubeId, duration: duration === "" ? undefined : Number(duration), body,
      isPreview, dripDays: dripDays === "" ? undefined : Number(dripDays),
    });
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          {initial ? "পাঠ সম্পাদনা" : "নতুন পাঠ"}
        </SheetTitle>
      </SheetHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>শিরোনাম</Label>
          <Input className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="পাঠের শিরোনাম" />
        </div>
        <div className="space-y-2">
          <Label>সংক্ষিপ্ত বিবরণ</Label>
          <Textarea className="rounded-xl min-h-[60px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>কন্টেন্ট টাইপ</Label>
          <Select value={contentType} onValueChange={(v) => setContentType(v as Lesson["contentType"])}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="video"><span className="flex items-center gap-2"><Video className="h-3.5 w-3.5" /> ভিডিও</span></SelectItem>
              <SelectItem value="text"><span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> টেক্সট</span></SelectItem>
              <SelectItem value="live"><span className="flex items-center gap-2"><Radio className="h-3.5 w-3.5" /> লাইভ ক্লাস</span></SelectItem>
            </SelectContent>
          </Select>
        </div>

        {contentType === "video" && (
          <>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Youtube className="h-4 w-4 text-destructive" /> YouTube ID</Label>
              <Input className="rounded-xl" value={youtubeId} onChange={(e) => setYoutubeId(e.target.value)} placeholder="dQw4w9WgXcQ" />
            </div>
            {youtubeId && (
              <div className="rounded-xl overflow-hidden border aspect-video">
                <iframe src={`https://www.youtube.com/embed/${youtubeId}`} title="preview" className="w-full h-full" />
              </div>
            )}
          </>
        )}

        {contentType === "text" && (
          <div className="space-y-2">
            <Label>পাঠ্যবিষয়</Label>
            <Textarea className="rounded-xl min-h-[180px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="পাঠের বিস্তারিত লিখুন (Markdown সমর্থিত)" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>সময়কাল</Label>
            <Input className="rounded-xl" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="১৫ মিনিট" />
          </div>
          <div className="space-y-2">
            <Label>Drip (দিন পরে আনলক)</Label>
            <Input type="number" min={0} className="rounded-xl" value={dripDays} onChange={(e) => setDripDays(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border p-3">
          <div>
            <Label className="cursor-pointer">ফ্রি প্রিভিউ</Label>
            <p className="text-[10px] text-muted-foreground">এনরোলড না হয়েও দেখতে পারবে</p>
          </div>
          <Switch checked={isPreview} onCheckedChange={setIsPreview} />
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild><Button variant="outline" className="rounded-xl">বাতিল</Button></SheetClose>
        <Button className="rounded-xl bg-gradient-hero hover:opacity-90" onClick={submit}>
          <Save className="mr-1 h-4 w-4" /> সংরক্ষণ
        </Button>
      </SheetFooter>
    </>
  );
};

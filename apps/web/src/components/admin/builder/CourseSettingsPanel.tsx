import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/course";
import { useAdmin } from "@/contexts/AdminContext";

import SmartImage from "@/components/shared/SmartImage";
interface Props {
  course: Course;
  allCourses: Course[];
  onChange: (patch: Partial<Course>) => void;
}

export const CourseSettingsPanel = ({ course, allCourses, onChange }: Props) => {
  const { categories } = useAdmin();
  const others = allCourses.filter((c) => c.id !== course.id);

  const togglePrereq = (id: string) => {
    const cur = course.prerequisites || [];
    onChange({ prerequisites: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };
  const toggleBundle = (id: string) => {
    const cur = course.bundleCourseIds || [];
    onChange({ bundleCourseIds: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };

  return (
    <div className="rounded-2xl bg-card border border-border/50 shadow-card">
      <Accordion type="multiple" defaultValue={["general", "pricing"]} className="w-full">
        <AccordionItem value="general" className="border-b px-4">
          <AccordionTrigger className="text-xs font-semibold">সাধারণ</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-3">
            <div className="space-y-1.5">
              <Label className="text-[10px]">শিরোনাম</Label>
              <Input className="rounded-xl h-9 text-sm" value={course.title} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">বিবরণ</Label>
              <Textarea className="rounded-xl text-sm min-h-[80px]" value={course.description} onChange={(e) => onChange({ description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-[10px]">ক্যাটাগরি</Label>
                <Select value={course.categoryId} onValueChange={(v) => {
                  const cat = categories.find((c) => c.id === v);
                  onChange({ categoryId: v, categoryName: cat?.name || "" });
                }}>
                  <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px]">স্তর</Label>
                <Select value={course.level} onValueChange={(v) => onChange({ level: v as Course["level"] })}>
                  <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="শিক্ষানবিস">শিক্ষানবিস</SelectItem>
                    <SelectItem value="মধ্যবর্তী">মধ্যবর্তী</SelectItem>
                    <SelectItem value="উন্নত">উন্নত</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">থাম্বনেইল URL</Label>
              <Input className="rounded-xl h-9 text-xs" value={course.thumbnail} onChange={(e) => onChange({ thumbnail: e.target.value })} />
              {course.thumbnail && <SmartImage src={course.thumbnail} alt="" className="rounded-xl border aspect-video object-cover w-full max-h-32" />}
            </div>
            <div className="flex items-center justify-between rounded-xl border p-2.5">
              <Label className="text-xs">প্রকাশিত</Label>
              <Switch checked={!!course.published} onCheckedChange={(v) => onChange({ published: v })} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pricing" className="border-b px-4">
          <AccordionTrigger className="text-xs font-semibold">মূল্য</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-3">
            <div className="space-y-1.5">
              <Label className="text-[10px]">প্রাইসিং টাইপ</Label>
              <Select value={course.pricingType || (course.price > 0 ? "one-time" : "free")} onValueChange={(v) => onChange({ pricingType: v as Course["pricingType"] })}>
                <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">ফ্রি</SelectItem>
                  <SelectItem value="one-time">এককালীন</SelectItem>
                  <SelectItem value="subscription">সাবস্ক্রিপশন</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-[10px]">মূল্য (৳)</Label>
                <Input type="number" className="rounded-xl h-9 text-xs" value={course.price} onChange={(e) => onChange({ price: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px]">সেল মূল্য</Label>
                <Input type="number" className="rounded-xl h-9 text-xs" value={course.salePrice ?? ""} onChange={(e) => onChange({ salePrice: e.target.value === "" ? undefined : Number(e.target.value) })} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="access" className="border-b px-4">
          <AccordionTrigger className="text-xs font-semibold">এক্সেস কন্ট্রোল</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-3">
            <div className="space-y-1.5">
              <Label className="text-[10px]">এক্সেস টাইপ</Label>
              <Select value={course.accessType || "paid"} onValueChange={(v) => onChange({ accessType: v as Course["accessType"] })}>
                <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">পাবলিক (সবার জন্য)</SelectItem>
                  <SelectItem value="password">পাসওয়ার্ড সংরক্ষিত</SelectItem>
                  <SelectItem value="paid">পেইড</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {course.accessType === "password" && (
              <div className="space-y-1.5">
                <Label className="text-[10px]">পাসওয়ার্ড</Label>
                <Input className="rounded-xl h-9 text-xs" value={course.password || ""} onChange={(e) => onChange({ password: e.target.value })} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-[10px]">সর্বোচ্চ শিক্ষার্থী</Label>
              <Input type="number" className="rounded-xl h-9 text-xs" value={course.maxStudents ?? ""} onChange={(e) => onChange({ maxStudents: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="অসীমিত" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="drip" className="border-b px-4">
          <AccordionTrigger className="text-xs font-semibold">Drip কন্টেন্ট</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-3">
            <div className="flex items-center justify-between rounded-xl border p-2.5">
              <div>
                <Label className="text-xs">Drip চালু</Label>
                <p className="text-[10px] text-muted-foreground">প্রতিটি পাঠ নির্দিষ্ট দিন পরে আনলক</p>
              </div>
              <Switch checked={!!course.enableDrip} onCheckedChange={(v) => onChange({ enableDrip: v })} />
            </div>
            <p className="text-[10px] text-muted-foreground">প্রতিটি পাঠের Drip দিন পাঠের সম্পাদনা ড্রয়ার থেকে নির্ধারণ করুন।</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="prereq" className="border-b px-4">
          <AccordionTrigger className="text-xs font-semibold">পূর্বশর্ত কোর্স</AccordionTrigger>
          <AccordionContent className="space-y-2 pb-3">
            {others.length === 0 && <p className="text-[10px] text-muted-foreground">অন্য কোর্স নেই</p>}
            {others.map((c) => {
              const on = (course.prerequisites || []).includes(c.id);
              return (
                <button key={c.id} type="button" onClick={() => togglePrereq(c.id)}
                  className={`w-full text-left rounded-xl border p-2 text-xs flex items-center justify-between ${on ? "border-primary bg-primary/10" : ""}`}>
                  <span className="truncate">{c.title}</span>
                  {on && <Badge className="text-[9px] h-4 shrink-0">নির্বাচিত</Badge>}
                </button>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cert" className="border-b px-4">
          <AccordionTrigger className="text-xs font-semibold">সার্টিফিকেট</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-3">
            <div className="flex items-center justify-between rounded-xl border p-2.5">
              <Label className="text-xs">সার্টিফিকেট ইস্যু</Label>
              <Switch checked={!!course.enableCertificate} onCheckedChange={(v) => onChange({ enableCertificate: v })} />
            </div>
            {course.enableCertificate && (
              <div className="space-y-1.5">
                <Label className="text-[10px]">টেমপ্লেট</Label>
                <Select value={course.certificateTemplate || "classic"} onValueChange={(v) => onChange({ certificateTemplate: v })}>
                  <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">ক্লাসিক</SelectItem>
                    <SelectItem value="modern">মডার্ন</SelectItem>
                    <SelectItem value="elegant">এলিগ্যান্ট</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bundle" className="px-4">
          <AccordionTrigger className="text-xs font-semibold">বান্ডল</AccordionTrigger>
          <AccordionContent className="space-y-2 pb-3">
            <div className="flex items-center justify-between rounded-xl border p-2.5">
              <Label className="text-xs">এটি একটি বান্ডল কোর্স</Label>
              <Switch checked={!!course.isBundle} onCheckedChange={(v) => onChange({ isBundle: v })} />
            </div>
            {course.isBundle && others.map((c) => {
              const on = (course.bundleCourseIds || []).includes(c.id);
              return (
                <button key={c.id} type="button" onClick={() => toggleBundle(c.id)}
                  className={`w-full text-left rounded-xl border p-2 text-xs flex items-center justify-between ${on ? "border-primary bg-primary/10" : ""}`}>
                  <span className="truncate">{c.title}</span>
                  {on && <Badge className="text-[9px] h-4 shrink-0">যুক্ত</Badge>}
                </button>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

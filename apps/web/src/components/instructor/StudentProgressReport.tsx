import { useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, TrendingUp, Users, Search } from "lucide-react";

export interface StudentProgressRow {
  studentId: string;
  name: string;
  email: string;
  courseId: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  progress: number; // 0–100
  lastActive: string;
  status: "active" | "inactive";
}

interface Props {
  rows: StudentProgressRow[];
}

const statusColor = (p: number) =>
  p >= 80 ? "text-emerald-500" : p >= 40 ? "text-primary" : "text-amber-500";

export const StudentProgressReport = ({ rows }: Props) => {
  const [q, setQ] = useState("");
  const [course, setCourse] = useState<string>("all");

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.courseId, r.courseTitle));
    return Array.from(map.entries());
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchQ =
        !q ||
        r.name.includes(q) ||
        r.email.includes(q) ||
        r.courseTitle.includes(q);
      const matchC = course === "all" || r.courseId === course;
      return matchQ && matchC;
    });
  }, [rows, q, course]);

  const stats = useMemo(() => {
    const completed = filtered.filter((r) => r.progress >= 100).length;
    const avg = filtered.length
      ? Math.round(filtered.reduce((s, r) => s + r.progress, 0) / filtered.length)
      : 0;
    return { total: filtered.length, completed, avg };
  }, [filtered]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "মোট এনরোলমেন্ট", value: stats.total, icon: Users },
          { label: "সম্পন্ন", value: stats.completed, icon: Award },
          { label: "গড় অগ্রগতি", value: `${stats.avg}%`, icon: TrendingUp },
        ].map((s) => (
          <div
            key={s.label}
            className="p-3 sm:p-4 rounded-2xl bg-card border border-border/50 shadow-card"
          >
            <s.icon className="h-4 w-4 text-primary mb-1.5" />
            <div className="text-lg sm:text-xl font-bold">{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="শিক্ষার্থী বা কোর্স খুঁজুন..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-10 rounded-xl border bg-card pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="h-10 rounded-xl border bg-card px-3 text-sm"
        >
          <option value="all">সব কোর্স</option>
          {courseOptions.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((r) => (
          <div
            key={`${r.studentId}-${r.courseId}`}
            className="p-3 rounded-2xl bg-card border border-border/50 shadow-card"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{r.courseTitle}</div>
              </div>
              <Badge
                variant={r.status === "active" ? "default" : "secondary"}
                className="text-[9px] h-4 shrink-0"
              >
                {r.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={r.progress} className="flex-1 h-2" />
              <span className={`text-xs font-semibold ${statusColor(r.progress)}`}>
                {r.progress}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
              <span>
                {r.completedLessons}/{r.totalLessons} পাঠ
              </span>
              <span>সর্বশেষ: {r.lastActive}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            কোনো রেকর্ড পাওয়া যায়নি
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>শিক্ষার্থী</TableHead>
              <TableHead>কোর্স</TableHead>
              <TableHead className="w-[200px]">অগ্রগতি</TableHead>
              <TableHead className="text-right">পাঠ</TableHead>
              <TableHead className="text-right">সর্বশেষ</TableHead>
              <TableHead className="text-right">স্ট্যাটাস</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={`${r.studentId}-${r.courseId}`}>
                <TableCell>
                  <div className="font-medium text-sm">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground">{r.email}</div>
                </TableCell>
                <TableCell className="text-sm">{r.courseTitle}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={r.progress} className="flex-1 h-2" />
                    <span className={`text-xs font-semibold w-9 text-right ${statusColor(r.progress)}`}>
                      {r.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {r.completedLessons}/{r.totalLessons}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {r.lastActive}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={r.status === "active" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {r.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  কোনো রেকর্ড পাওয়া যায়নি
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentProgressReport;

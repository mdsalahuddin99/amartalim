import { useEffect, useState } from "react";
import { Search, Mail, BookOpen, Award, TrendingUp, UserCheck, UserX, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/contexts/AdminContext";
import type { Course } from "@/types/course";
import { getAdminStudents, toggleUserStatus } from "@/server/actions/admin-users.actions";
import { toast } from "@/hooks/use-toast";

const AdminStudents = () => {
  const { courses } = useAdmin();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    getAdminStudents().then(setStudents).catch(console.error);
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleUserStatus(id);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s));
      toast({ title: "স্ট্যাটাস আপডেট হয়েছে" });
    } catch (e) {
      toast({ title: "ত্রুটি", description: "স্ট্যাটাস আপডেট করা যায়নি", variant: "destructive" });
    }
  };

  const filtered = students
    .filter((s) => {
      if (filter === "active") return s.status === "active";
      if (filter === "inactive") return s.status === "inactive";
      return true;
    })
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );

  const activeCount = students.filter((s) => s.status === "active").length;
  const totalEnrollments = students.reduce((sum, s) => sum + s.enrolledCourses.length, 0);
  const completedCount = students.reduce((sum, s) => sum + s.completedCourses, 0);

  const getCourseName = (id: string) => courses.find((c) => c.id === id)?.title || "অজানা কোর্স";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">শিক্ষার্থী</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">{students.length} জন শিক্ষার্থী</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "মোট শিক্ষার্থী", value: students.length, icon: UserCheck, color: "text-primary" },
          { label: "সক্রিয়", value: activeCount, icon: TrendingUp, color: "text-success" },
          { label: "মোট এনরোলমেন্ট", value: totalEnrollments, icon: BookOpen, color: "text-accent-foreground" },
          { label: "কোর্স সম্পন্ন", value: completedCount, icon: Award, color: "text-warning" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 shadow-card">
            <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color} mb-2`} />
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <div className="flex gap-2">
          {([["all", "সকল"], ["active", "সক্রিয়"], ["inactive", "নিষ্ক্রিয়"]] as const).map(([key, label]) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">কোনো শিক্ষার্থী পাওয়া যায়নি।</div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((student) => (
              <div key={student.id} className="px-4 sm:px-5 py-3 sm:py-4">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{student.name}</span>
                        <Badge
                          variant={student.status === "active" ? "default" : "secondary"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {student.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> {student.enrolledCourses.length}টি কোর্সে ভর্তি
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" /> {student.completedCourses}টি সম্পন্ন
                        </span>
                        <span>যোগদান: {student.joinedAt}</span>
                      </div>
                      {student.enrolledCourses.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {student.enrolledCourses.slice(0, 3).map((cid) => (
                            <span key={cid} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                              {getCourseName(cid)}
                            </span>
                          ))}
                          {student.enrolledCourses.length > 3 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              +{student.enrolledCourses.length - 3} আরও
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>প্রোফাইল দেখুন</DropdownMenuItem>
                      <DropdownMenuItem>ইমেইল পাঠান</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleToggleStatus(student.id)}>
                        {student.status === "active" ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;

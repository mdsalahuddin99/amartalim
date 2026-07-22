import { useMemo, useState, useEffect } from "react";
import { Link } from "@/lib/navigation";
import {
  Users, BookOpen, Star, DollarSign, Search, Plus, MoreVertical,
  Mail, GraduationCap, TrendingUp, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Course, Review } from "@/types/course";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "@/hooks/use-toast";

interface InstructorRow {
  id: string;
  name: string;
  email: string;
  bio: string;
  totalStudents: number;
  totalCourses: number;
  totalEarnings: number;
  status: "active" | "pending" | "suspended";
  joinedAt: string;
  specialization: string;
}

const fmtBDT = (n: number) =>
  n >= 100000 ? `৳${(n / 1000).toFixed(0)}K` : `৳${n.toLocaleString("bn-BD")}`;

const STATUS_LABEL: Record<InstructorRow["status"], string> = {
  active: "সক্রিয়",
  pending: "অপেক্ষমান",
  suspended: "স্থগিত",
};

const AdminInstructors = () => {
  const { courses } = useAdmin();
  const reviews = [] as any[];
  const [instructors, setInstructors] = useState<InstructorRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | InstructorRow["status"]>("all");
  
  const [editInsId, setEditInsId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleEditSubmit = async () => {
    if (!editInsId) return;
    setIsProcessing(true);
    try {
      const { updateInstructorProfile } = await import("@/server/actions/admin-users.actions");
      const res = await updateInstructorProfile(editInsId, editData);
      if (res?.error) {
        toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
      } else {
        toast({ title: "সফল", description: "ইন্সট্রাক্টর প্রোফাইল আপডেট করা হয়েছে" });
        setInstructors(prev => prev.map(i => i.id === editInsId ? { ...i, ...editData } : i));
        setEditInsId(null);
      }
    } catch (e) {
      toast({ title: "ত্রুটি", description: "প্রোফাইল আপডেট করা যায়নি", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    import("@/server/actions/admin-users.actions").then(({ getAdminInstructors }) => {
      getAdminInstructors().then((data) => setInstructors(data as InstructorRow[])).catch(console.error);
    });
  }, []);

  const filtered = useMemo(() => {
    return instructors.filter((i) => {
      if (filter !== "all" && i.status !== filter) return false;
      if (!search) return true;
      return i.name.includes(search) || i.email.includes(search) || i.specialization.includes(search);
    });
  }, [instructors, search, filter]);

  const stats = useMemo(() => {
    const active = instructors.filter((i) => i.status === "active");
    return {
      total: instructors.length,
      active: active.length,
      pending: instructors.filter((i) => i.status === "pending").length,
      totalEarnings: instructors.reduce((s, i) => s + i.totalEarnings, 0),
      totalStudents: instructors.reduce((s, i) => s + i.totalStudents, 0),
      totalCourses: instructors.reduce((s, i) => s + i.totalCourses, 0),
    };
  }, [instructors]);

  const updateStatus = async (id: string, status: InstructorRow["status"]) => {
    try {
      const { toggleUserStatus } = await import("@/server/actions/admin-users.actions");
      await toggleUserStatus(id);
      setInstructors((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      toast({ title: "স্ট্যাটাস আপডেট হয়েছে", description: STATUS_LABEL[status] });
    } catch (e) {
      toast({ title: "ত্রুটি", description: "স্ট্যাটাস আপডেট করা যায়নি", variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    try {
      const { deleteUser } = await import("@/server/actions/admin-users.actions");
      await deleteUser(id);
      setInstructors((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "শিক্ষক সরানো হয়েছে", variant: "destructive" });
    } catch (e) {
      toast({ title: "ত্রুটি", description: "শিক্ষক সরানো যায়নি", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">শিক্ষকগণ</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.total} জন শিক্ষক · {stats.active} জন সক্রিয়
          </p>
        </div>
        <Button size="sm" className="rounded-xl" onClick={() =>
          toast({ title: "শিক্ষক আমন্ত্রণ", description: "ইমেইলে আমন্ত্রণ পাঠানো হয়েছে।" })
        }>
          <Plus className="mr-1.5 h-4 w-4" /> শিক্ষক যোগ করুন
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "মোট শিক্ষক", value: stats.total, icon: Users, color: "text-primary" },
          { label: "মোট শিক্ষার্থী", value: stats.totalStudents.toLocaleString("bn-BD"), icon: GraduationCap, color: "text-blue-500" },
          { label: "মোট কোর্স", value: stats.totalCourses, icon: BookOpen, color: "text-accent" },
          { label: "মোট আয়", value: fmtBDT(stats.totalEarnings), icon: DollarSign, color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 shadow-card">
            <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color} mb-2`} />
            <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="শিক্ষক, ইমেইল, বিষয় খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 w-fit">
          {([
            ["all", `সব (${stats.total})`],
            ["active", `সক্রিয় (${stats.active})`],
            ["pending", `অপেক্ষমান (${stats.pending})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {filtered.map((ins) => {
          const ratings = reviews.filter((r) =>
            courses.slice(0, ins.totalCourses).some((c) => c.id === r.courseId)
          );
          const avg = ratings.length
            ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
            : "—";
          return (
            <div key={ins.id} className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 shadow-card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center text-base font-semibold text-primary-foreground shrink-0">
                  {ins.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm truncate">{ins.name}</h3>
                    <Badge
                      variant={ins.status === "active" ? "default" : "secondary"}
                      className="text-[9px] h-4 px-1.5"
                    >
                      {STATUS_LABEL[ins.status]}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" /> {ins.email}
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-1.5">{ins.specialization}</Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/instructors/${ins.id}`}>
                        <Eye className="mr-2 h-3.5 w-3.5" /> প্রোফাইল দেখুন
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setEditInsId(ins.id); setEditData({ name: ins.name, bio: ins.bio, specialization: ins.specialization }); }}>
                      এডিট করুন
                    </DropdownMenuItem>
                    {ins.status !== "active" && (
                      <DropdownMenuItem onClick={() => updateStatus(ins.id, "active")}>
                        সক্রিয় করুন
                      </DropdownMenuItem>
                    )}
                    {ins.status !== "suspended" && (
                      <DropdownMenuItem onClick={() => updateStatus(ins.id, "suspended")}>
                        স্থগিত করুন
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive" onClick={() => remove(ins.id)}>
                      মুছে ফেলুন
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{ins.bio}</p>

              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="p-2 rounded-xl bg-secondary/40 text-center">
                  <div className="text-sm font-bold">{ins.totalCourses}</div>
                  <div className="text-[9px] text-muted-foreground">কোর্স</div>
                </div>
                <div className="p-2 rounded-xl bg-secondary/40 text-center">
                  <div className="text-sm font-bold">{ins.totalStudents}</div>
                  <div className="text-[9px] text-muted-foreground">শিক্ষার্থী</div>
                </div>
                <div className="p-2 rounded-xl bg-secondary/40 text-center">
                  <div className="text-sm font-bold flex items-center justify-center gap-0.5">
                    <Star className="h-3 w-3 fill-accent text-accent" /> {avg}
                  </div>
                  <div className="text-[9px] text-muted-foreground">রেটিং</div>
                </div>
                <div className="p-2 rounded-xl bg-secondary/40 text-center">
                  <div className="text-sm font-bold">{fmtBDT(ins.totalEarnings)}</div>
                  <div className="text-[9px] text-muted-foreground">আয়</div>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground mt-3 flex items-center justify-between">
                <span>যোগদান: {ins.joinedAt}</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" /> সক্রিয় শিক্ষক
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center text-sm text-muted-foreground bg-card rounded-2xl border border-border/50">
            কোনো শিক্ষক পাওয়া যায়নি
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editInsId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border shadow-lg rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">ইন্সট্রাক্টর এডিট করুন</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">নাম</label>
                <Input value={editData.name || ""} onChange={e => setEditData({...editData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">বিষয়</label>
                <Input value={editData.specialization || ""} onChange={e => setEditData({...editData, specialization: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">বায়ো</label>
                <textarea 
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={4}
                  value={editData.bio || ""} 
                  onChange={e => setEditData({...editData, bio: e.target.value})} 
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setEditInsId(null)}>বাতিল</Button>
              <Button onClick={handleEditSubmit} disabled={isProcessing}>সেভ করুন</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstructors;

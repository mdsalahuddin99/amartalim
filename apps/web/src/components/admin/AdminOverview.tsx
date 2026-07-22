import { Link } from "@/lib/navigation";
import { useMemo, useEffect, useState } from "react";
import {
  BookOpen, FolderOpen, BarChart3, FileQuestion, Eye,
  Users, DollarSign, ShoppingBag, TrendingUp, GraduationCap, Star,
  Plus, Newspaper, Megaphone, Ticket, UserCheck, ArrowUpRight, Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAdmin } from "@/contexts/AdminContext";
import { getAdminOverviewStats } from "@/server/actions/admin-dashboard.actions";
import { useSession } from "next-auth/react";

const fmtBDT = (n: number) =>
  n >= 100000 ? `৳${(n / 1000).toFixed(0)}K` : `৳${n.toLocaleString("bn-BD")}`;

const AdminOverview = () => {
  const { categories, courses, lessons, quizQuestions } = useAdmin();
  const { data: session } = useSession();
  const mockAdmin = { name: session?.user?.name || "Admin" };

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getAdminOverviewStats().then(data => setStats(data));
  }, []);

  const totalRevenue = stats?.totalRevenue || 0;
  const paidOrders = stats?.paidOrders || 0;
  const pendingOrders = stats?.pendingOrders || 0;
  const recentOrders = stats?.recentOrders || [];
  const activeStudents = stats?.activeStudents || 0;
  const totalStudents = stats?.totalStudents || 0;
  const avgRating = stats?.avgRating || "0";
  const topCourses = stats?.topCourses || [];
  const recentStudents = stats?.recentStudents || [];

  const maxStudents = topCourses[0]?.studentsCount || 1;

  const primaryStats = [
    { label: "মোট আয়", value: fmtBDT(totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+১২%" },
    { label: "অর্ডার", value: (paidOrders + pendingOrders), icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10", trend: `${paidOrders} পেইড` },
    { label: "শিক্ষার্থী", value: totalStudents, icon: Users, color: "text-primary", bg: "bg-primary/10", trend: `${activeStudents} সক্রিয়` },
    { label: "গড় রেটিং", value: avgRating, icon: Star, color: "text-accent", bg: "bg-accent/10", trend: `Top rated` },
  ];

  const contentStats = [
    { label: "ক্যাটাগরি", value: categories.length, icon: FolderOpen },
    { label: "কোর্স", value: courses.length, icon: BookOpen },
    { label: "পাঠ", value: lessons.length, icon: BarChart3 },
    { label: "কুইজ", value: quizQuestions.length, icon: FileQuestion },
  ];

  const quickActions = [
    { label: "নতুন কোর্স", href: "/admin/courses", icon: BookOpen },
    { label: "নতুন ব্লগ", href: "/admin/blogs", icon: Newspaper },
    { label: "কুপন", href: "/admin/coupons", icon: Ticket },
    { label: "বিজ্ঞাপন", href: "/admin/ads", icon: Megaphone },
    { label: "আবেদনসমূহ", href: "/admin/applications", icon: Briefcase },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground mt-1 text-sm">স্বাগতম, {mockAdmin.name}</p>
        </div>
        <Link to="/admin/courses">
          <Button size="sm" className="rounded-xl">
            <Plus className="mr-1.5 h-4 w-4" /> নতুন কোর্স
          </Button>
        </Link>
      </div>

      {/* Primary KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {primaryStats.map((s) => (
          <div key={s.label} className="p-4 sm:p-5 rounded-2xl premium-card">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
            </div>
            <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</div>
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{s.trend}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">দ্রুত অ্যাকশন</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.href}>
              <div className="p-3 rounded-2xl premium-card hover:-translate-y-1 text-center group">
                <a.icon className="h-5 w-5 mx-auto mb-1.5 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-[10px] sm:text-xs font-medium">{a.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Content stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {contentStats.map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl premium-card">
            <stat.icon className="h-4 w-4 text-muted-foreground mb-2" />
            <div className="text-lg sm:text-xl font-bold">{stat.value}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top courses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-semibold">জনপ্রিয় কোর্স</h2>
            <Link to="/admin/courses">
              <Button variant="ghost" size="sm" className="text-xs">
                সব দেখুন <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="premium-card rounded-2xl overflow-hidden divide-y divide-border/50">
            {topCourses.map((course, i) => (
              <div key={course.id} className="px-4 py-3 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{course.title}</div>
                  <Progress
                    value={(course.studentsCount / maxStudents) * 100}
                    className="h-1.5 mt-1.5"
                  />
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold">{course.studentsCount}</div>
                  <div className="text-[9px] text-muted-foreground">শিক্ষার্থী</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-semibold">সাম্প্রতিক অর্ডার</h2>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs">
                সব দেখুন <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="premium-card rounded-2xl overflow-hidden divide-y divide-border/50">
            {recentOrders.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">
                এখনো কোনো অর্ডার নেই
              </div>
            )}
            {recentOrders.map((o) => (
              <div key={o.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{o.courseTitle}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className="uppercase">{o.provider}</span>
                    <span>·</span>
                    <span>{new Date(o.createdAt).toLocaleDateString("bn-BD")}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold">৳{o.total.toLocaleString()}</div>
                  <Badge
                    variant={o.status === "PAID" ? "default" : "secondary"}
                    className="text-[9px] h-4 px-1.5 mt-0.5"
                  >
                    {o.status === "PAID" ? "পেইড" : o.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent students + Recent courses */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-semibold">নতুন শিক্ষার্থী</h2>
            <Link to="/admin/students">
              <Button variant="ghost" size="sm" className="text-xs">
                সব দেখুন <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="premium-card rounded-2xl overflow-hidden divide-y divide-border/50">
            {recentStudents.map((s: any) => (
              <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-hero flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{s.email}</div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="text-[10px] text-muted-foreground">{s.joinedAt}</div>
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5 mt-0.5">
                    {s.enrolledCourses.length}টি কোর্স
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-semibold">সাম্প্রতিক কোর্স</h2>
            <Link to="/admin/courses">
              <Button variant="ghost" size="sm" className="text-xs">
                সব দেখুন <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="premium-card rounded-2xl overflow-hidden divide-y divide-border/50">
            {courses.slice(0, 5).map((course) => (
              <div key={course.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{course.title}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {course.categoryName} · {course.lessonsCount}টি পাঠ
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                    <Users className="h-2.5 w-2.5 mr-0.5" />
                    {course.studentsCount}
                  </Badge>
                  <Link to="/admin/courses">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System health card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">সিস্টেম স্ট্যাটাস</h3>
            <p className="text-[10px] text-muted-foreground">সবকিছু সচল ও স্বাভাবিক</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-card/80">
            <div className="text-xs font-bold text-emerald-500">●  সচল</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">API</div>
          </div>
          <div className="p-2 rounded-xl bg-card/80">
            <div className="text-xs font-bold text-emerald-500">●  সচল</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">পেমেন্ট</div>
          </div>
          <div className="p-2 rounded-xl bg-card/80">
            <div className="text-xs font-bold text-emerald-500">●  সচল</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">CDN</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

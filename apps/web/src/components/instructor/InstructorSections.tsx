import { Link, useNavigate } from "@/lib/navigation";
import { useMemo, useState, useEffect } from "react";
import {
  BookOpen, Users, Star, DollarSign, ChevronRight, Eye, Clock,
  TrendingUp, GraduationCap, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Topic, Lesson, QuizMeta, Assignment } from "@/types/course";
import { useAdmin } from "@/contexts/AdminContext";
import { useSession } from "@/server/auth/session";
import { EarningsChart, type MonthlyEarning, type CourseEarning } from "@/components/instructor/EarningsChart";
import { StudentProgressReport, type StudentProgressRow } from "@/components/instructor/StudentProgressReport";

import SmartImage from "@/components/shared/SmartImage";
import { getInstructorDashboardData } from "@/server/actions/instructor.actions";

export const instructorCourseIds = ["1", "2", "3", "4"]; // Keep for fallback or other static refs if needed

const useInstructorData = () => {
  const { user: sessionUser } = useSession();
  const [data, setData] = useState<any>({
    user: sessionUser,
    courses: [],
    lessons: [],
    myCourses: [],
    myLessons: [],
    myStudents: [],
    instructorProfile: { 
      name: sessionUser?.name || "Instructor", 
      email: sessionUser?.email || "instructor@amartalim.com",
      bio: "Bio", 
      totalStudents: 0, 
      totalEarnings: 0 
    },
    myReviews: [],
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    getInstructorDashboardData()
      .then((res) => {
        if (isMounted) {
          setData({ ...res, loading: false });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch instructor data", err);
        if (isMounted) setData((prev: any) => ({ ...prev, loading: false }));
      });
    return () => { isMounted = false; };
  }, []);

  return data;
};

export const InstructorOverview = () => {
  const data = useInstructorData();
  return <InstructorOverviewUI {...data} />;
};

export const InstructorOverviewUI = ({ user, myCourses, myLessons, myStudents, myReviews, instructorProfile }: any) => {
  const displayName = user?.name || instructorProfile.name;
  const avgRating = myReviews.length
    ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1)
    : "0";
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">স্বাগতম, {displayName}</h1>
        <p className="text-muted-foreground mt-1 text-sm">আপনার কোর্স ও শিক্ষার্থীদের সারসংক্ষেপ</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "মোট কোর্স", value: myCourses.length, icon: BookOpen, color: "text-primary" },
          { label: "মোট শিক্ষার্থী", value: instructorProfile.totalStudents, icon: Users, color: "text-blue-500" },
          { label: "চলমান কোর্স", value: myCourses.length, icon: BookOpen, color: "text-indigo-500" },
          { label: "মোট আয়", value: `৳${(instructorProfile.totalEarnings / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-emerald-500" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 shadow-card">
            <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color} mb-2`} />
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold">আমার কোর্সসমূহ</h2>
          <Link to="/instructor/courses">
            <Button variant="ghost" size="sm" className="text-xs">সব দেখুন <ChevronRight className="ml-1 h-3 w-3" /></Button>
          </Link>
        </div>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {myCourses.slice(0, 4).map((course) => (
            <div key={course.id} className="flex gap-3 p-3 sm:p-4 rounded-2xl bg-card border border-border/50 shadow-card">
              <SmartImage src={typeof course.thumbnail === "string" ? course.thumbnail : ""} alt={course.title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm truncate">{course.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px]">{course.categoryName}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.studentsCount}</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-accent" />{course.rating}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">সাম্প্রতিক রিভিউ</h2>
        <div className="space-y-3">
          {myReviews.slice(0, 3).map((review) => (
            <div key={review.id} className="p-3 sm:p-4 rounded-2xl bg-card border border-border/50 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{review.userName}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const InstructorMyCourses = () => {
  const { myCourses, myLessons, myReviews } = useInstructorData();
  const { addCourse, categories } = useAdmin();
  const navigate = useNavigate();

  return (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">আমার কোর্সসমূহ</h1>
        <p className="text-muted-foreground text-sm mt-1">{myCourses.length}টি কোর্স</p>
      </div>
      <Button
        className="rounded-xl w-full sm:w-auto bg-gradient-hero"
        onClick={async () => {
          const defaultCat = categories[0];
          const id = await addCourse({
            title: "নতুন কোর্স",
            description: "",
            categoryId: defaultCat?.id || "",
            categoryName: defaultCat?.name || "",
            price: 0,
            duration: "",
            level: "শিক্ষানবিস",
            instructor: "আমারা রুয়েল",
            instructorBio: "",
            thumbnail: "",
            whatYouLearn: [],
            whoIsFor: [],
            benefits: [],
            problems: [],
            lessonsCount: 0,
            studentsCount: 0,
            rating: 0,
          });
          navigate(`/instructor/course-builder/${id}`);
        }}
      >
        <Plus className="mr-2 h-4 w-4" /> নতুন কোর্স
      </Button>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {myCourses.map((course) => {
        const courseLessons = myLessons.filter((l) => l.courseId === course.id);
        const courseReviews = myReviews.filter((r) => r.courseId === course.id);
        const avgR = courseReviews.length ? (courseReviews.reduce((s, r) => s + r.rating, 0) / courseReviews.length).toFixed(1) : "—";
        return (
          <div key={course.id} className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
            <SmartImage src={typeof course.thumbnail === "string" ? course.thumbnail : ""} alt={course.title} className="w-full h-40 object-cover" />
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{course.title}</h3>
                <Badge variant="secondary" className="mt-1 text-[10px]">{course.categoryName}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-secondary/50"><div className="text-sm font-bold">{courseLessons.length}</div><div className="text-[10px] text-muted-foreground">পাঠ</div></div>
                <div className="p-2 rounded-xl bg-secondary/50"><div className="text-sm font-bold">{course.studentsCount}</div><div className="text-[10px] text-muted-foreground">শিক্ষার্থী</div></div>
                <div className="p-2 rounded-xl bg-secondary/50"><div className="text-sm font-bold">{avgR}</div><div className="text-[10px] text-muted-foreground">রেটিং</div></div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>৳{course.price > 0 ? course.price.toLocaleString() : "ফ্রি"}</span>
                <span>{course.duration}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to={`/instructor/course-builder/${course.id}`}>
                  <Button size="sm" className="w-full rounded-xl text-xs bg-gradient-hero hover:opacity-90">
                    কোর্স বিল্ডার
                  </Button>
                </Link>
                <Link to={`/courses/${course.id}`}>
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                    <Eye className="mr-1.5 h-3 w-3" /> দেখুন
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
  );
};

export const InstructorLessons = () => {
  const { myCourses, myLessons } = useInstructorData();
  return (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">পাঠসমূহ</h1>
      <p className="text-muted-foreground text-sm mt-1">{myLessons.length}টি পাঠ</p>
    </div>
    {myCourses.map((course) => {
      const cls = myLessons.filter((l) => l.courseId === course.id).sort((a, b) => a.order - b.order);
      if (!cls.length) return null;
      return (
        <div key={course.id} className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b bg-secondary/30">
            <h3 className="font-semibold text-sm">{course.title}</h3>
            <span className="text-[10px] text-muted-foreground">{cls.length}টি পাঠ</span>
          </div>
          <div className="divide-y divide-border/50">
            {cls.map((lesson, i) => (
              <div key={lesson.id} className="px-4 sm:px-5 py-3 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{lesson.title}</div>
                  <div className="text-[10px] text-muted-foreground">{lesson.duration}</div>
                </div>
                <Link to={`/courses/${course.id}/lessons/${lesson.id}`}>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
  );
};

export const InstructorStudents = () => {
  const { myStudents, courses } = useInstructorData();
  const [search, setSearch] = useState("");
  const filtered = myStudents.filter((s) => s.name.includes(search) || s.email.includes(search));
  const getCourseName = (id: string) => courses.find((c) => c.id === id)?.title || "অজানা কোর্স";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">শিক্ষার্থী</h1>
        <p className="text-muted-foreground text-sm mt-1">{myStudents.length} জন শিক্ষার্থী আপনার কোর্সে ভর্তি</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "মোট শিক্ষার্থী", value: myStudents.length, icon: Users },
          { label: "সক্রিয়", value: myStudents.filter((s) => s.status === "active").length, icon: TrendingUp },
          { label: "সম্পন্ন কোর্স", value: myStudents.reduce((s, st) => s + st.completedCourses, 0), icon: GraduationCap },
        ].map((stat) => (
          <div key={stat.label} className="p-3 sm:p-4 rounded-2xl bg-card border border-border/50 shadow-card">
            <stat.icon className="h-4 w-4 text-primary mb-1.5" />
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
      <input type="text" placeholder="শিক্ষার্থী খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:max-w-sm h-10 rounded-xl border bg-card px-3 text-sm" />
      <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden divide-y divide-border/50">
        {filtered.map((student) => (
          <div key={student.id} className="px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-hero flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">{student.name.charAt(0)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{student.name}</span>
                <Badge variant={student.status === "active" ? "default" : "secondary"} className="text-[9px] h-4">
                  {student.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </Badge>
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                {student.enrolledCourses.filter((id) => instructorCourseIds.includes(id)).map((id) => getCourseName(id)).join(", ")}
              </div>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <div className="text-xs font-medium">{student.completedCourses} সম্পন্ন</div>
              <div className="text-[10px] text-muted-foreground">{student.joinedAt}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">কোনো শিক্ষার্থী পাওয়া যায়নি</div>
        )}
      </div>
    </div>
  );
};

export const InstructorPerformance = () => {
  const { myReviews, myCourses } = useInstructorData();
  const avgRating = myReviews.length ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1) : "0";
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: myReviews.filter((rev) => rev.rating === r).length,
    pct: myReviews.length ? (myReviews.filter((rev) => rev.rating === r).length / myReviews.length) * 100 : 0,
  }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">পারফরম্যান্স</h1>
        <p className="text-muted-foreground text-sm mt-1">আপনার কোর্সের সামগ্রিক পারফরম্যান্স</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "মোট ভিউ", value: "12.5K", icon: Eye },
          { label: "এনরোলমেন্ট রেট", value: "68%", icon: TrendingUp },
          { label: "সম্পন্ন হার", value: "45%", icon: GraduationCap },
          { label: "মোট রিভিউ", value: myReviews.length, icon: Star },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border/50 shadow-card">
            <stat.icon className="h-4 w-4 text-primary mb-2" />
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-card border border-border/50 shadow-card p-4 sm:p-5">
        <h3 className="font-semibold text-sm mb-4">রেটিং বিশ্লেষণ</h3>
        <div className="flex items-center gap-4 sm:gap-6 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{avgRating}</div>
            <div className="flex gap-0.5 justify-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(Number(avgRating)) ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{myReviews.length} রিভিউ</div>
          </div>
          <div className="flex-1 space-y-2">
            {ratingDist.map((rd) => (
              <div key={rd.star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right">{rd.star}</span>
                <Star className="h-3 w-3 fill-accent text-accent" />
                <Progress value={rd.pct} className="flex-1 h-2" />
                <span className="w-5 text-right text-muted-foreground">{rd.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b bg-secondary/30">
          <h3 className="font-semibold text-sm">কোর্স অনুযায়ী পারফরম্যান্স</h3>
        </div>
        <div className="divide-y divide-border/50">
          {myCourses.map((course) => {
            const cr = myReviews.filter((r) => r.courseId === course.id);
            const ar = cr.length ? (cr.reduce((s, r) => s + r.rating, 0) / cr.length).toFixed(1) : "—";
            return (
              <div key={course.id} className="px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3">
                <SmartImage src={typeof course.thumbnail === "string" ? course.thumbnail : ""} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{course.title}</div>
                  <div className="text-[10px] text-muted-foreground">{course.studentsCount} শিক্ষার্থী · {cr.length} রিভিউ</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="text-sm font-semibold">{ar}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const BN_MONTHS = ["জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ", "অক্টো", "নভে", "ডিসে"];

export const InstructorEarnings = () => {
  const { instructorProfile, myCourses } = useInstructorData();
  const { monthly, perCourse, total, pending } = useMemo(() => {
    const total = instructorProfile.totalEarnings;
    const weights = [0.5, 0.7, 0.8, 0.6, 0.9, 1.0, 1.1, 0.95, 1.05, 1.2, 1.15, 1.35];
    const wSum = weights.reduce((a, b) => a + b, 0);
    const monthly: MonthlyEarning[] = BN_MONTHS.map((m, i) => ({
      month: m,
      earnings: Math.round((total * weights[i]) / wSum),
      enrollments: Math.round(((total * weights[i]) / wSum) / 600),
    }));
    const weighted = myCourses.map((c) => ({ c, w: Math.max(c.studentsCount, 1) * Math.max(c.price, 200) }));
    const totW = weighted.reduce((a, b) => a + b.w, 0);
    const perCourse: CourseEarning[] = weighted.map(({ c, w }) => ({
      courseId: c.id,
      title: c.title,
      thumbnail: typeof c.thumbnail === "string" ? c.thumbnail : undefined,
      earnings: Math.round((total * w) / totW),
      students: c.studentsCount,
    }));
    const pending = Math.round(total * 0.18);
    return { monthly, perCourse, total, pending };
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">আয় ও পেআউট</h1>
          <p className="text-muted-foreground text-sm mt-1">কোর্স থেকে আয়ের বিশ্লেষণ ও পেআউট ট্র্যাকিং</p>
        </div>
        <Button size="sm" className="rounded-xl bg-gradient-hero hover:opacity-90 shrink-0">পেআউট রিকোয়েস্ট</Button>
      </div>
      <EarningsChart monthly={monthly} perCourse={perCourse} totalEarnings={total} pendingPayout={pending} />
    </div>
  );
};

export const InstructorReports = () => {
  const { myStudents, courses, lessons } = useInstructorData();
  const rows = useMemo<StudentProgressRow[]>(() => {
    const out: StudentProgressRow[] = [];
    for (const s of myStudents) {
      const myEnrolls = s.enrolledCourses.filter((id) => instructorCourseIds.includes(id));
      for (const cid of myEnrolls) {
        const course = courses.find((c) => c.id === cid);
        if (!course) continue;
        const totalLessons = lessons.filter((l) => l.courseId === cid).length || course.lessonsCount || 1;
        const seed = (s.id.charCodeAt(1) * 31 + cid.charCodeAt(0)) % 100;
        const progress = Math.min(100, Math.max(5, seed));
        const completedLessons = Math.round((progress / 100) * totalLessons);
        out.push({
          studentId: s.id, name: s.name, email: s.email,
          courseId: cid, courseTitle: course.title,
          completedLessons, totalLessons, progress,
          lastActive: s.joinedAt, status: s.status,
        });
      }
    }
    return out.sort((a, b) => b.progress - a.progress);
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">প্রগ্রেস রিপোর্ট</h1>
        <p className="text-muted-foreground text-sm mt-1">প্রতিটি শিক্ষার্থীর কোর্স অগ্রগতি ও কার্যকলাপ</p>
      </div>
      <StudentProgressReport rows={rows} />
    </div>
  );
};

export const InstructorSettings = () => {
  const { instructorProfile } = useInstructorData();
  return (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">সেটিংস</h1>
      <p className="text-muted-foreground text-sm mt-1">আপনার প্রোফাইল ও অ্যাকাউন্ট সেটিংস</p>
    </div>
    <div className="rounded-2xl bg-card border border-border/50 shadow-card p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-xl font-bold text-primary-foreground">
          {instructorProfile.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold">{instructorProfile.name}</h3>
          <p className="text-sm text-muted-foreground">{instructorProfile.email}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">নাম</label>
          <input defaultValue={instructorProfile.name} className="w-full h-10 rounded-xl border bg-background px-3 text-sm mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">ইমেইল</label>
          <input defaultValue={instructorProfile.email} className="w-full h-10 rounded-xl border bg-background px-3 text-sm mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">বায়ো</label>
          <textarea defaultValue={instructorProfile.bio} className="w-full rounded-xl border bg-background px-3 py-2 text-sm mt-1 min-h-[80px]" />
        </div>
        <Button className="rounded-xl bg-gradient-hero hover:opacity-90">সেভ করুন</Button>
      </div>
    </div>
  </div>
  );
};

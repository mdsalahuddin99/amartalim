import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, BookOpen,
  Star, Download, Activity, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BN_MONTHS = ["জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ", "অক্টো", "নভে", "ডিসে"];

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const fmtBDT = (n: number) =>
  n >= 100000 ? `৳${(n / 1000).toFixed(0)}K` : `৳${n.toLocaleString("bn-BD")}`;

const AdminReports = ({ data }: { data: any }) => {


  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">রিপোর্ট ও বিশ্লেষণ</h1>
          <p className="text-muted-foreground text-sm mt-1">গত ১২ মাসের পরিসংখ্যান</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl">
          <Download className="mr-1.5 h-4 w-4" /> ডাউনলোড
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "মোট আয়", value: fmtBDT(data.totalRevenue), icon: DollarSign, trend: "+২৪%", up: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "মোট এনরোলমেন্ট", value: data.totalEnrollments, icon: ShoppingBag, trend: "+১৮%", up: true, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "সক্রিয় শিক্ষার্থী", value: data.totalEnrollments, icon: Users, trend: "", up: true, color: "text-primary", bg: "bg-primary/10" },
          { label: "গড় রেটিং", value: data.avgRating, icon: Star, trend: "", up: true, color: "text-accent", bg: "bg-accent/10" },
        ].map((s) => (
          <div key={s.label} className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 shadow-card">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
              </div>
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 gap-0.5">
                {s.up ? <TrendingUp className="h-2.5 w-2.5 text-emerald-500" /> : <TrendingDown className="h-2.5 w-2.5 text-red-500" />}
                {s.trend}
              </Badge>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl bg-card border border-border/50 shadow-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">মাসিক আয়</h3>
            <p className="text-[10px] text-muted-foreground">গত ১২ মাস</p>
          </div>
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.monthly} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(v: number) => [`৳${v.toLocaleString()}`, "আয়"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrollments + Category split */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border/50 shadow-card p-4 sm:p-5">
          <h3 className="font-semibold text-sm mb-4">মাসিক এনরোলমেন্ট</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="enrollments" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border/50 shadow-card p-4 sm:p-5">
          <h3 className="font-semibold text-sm mb-4">ক্যাটাগরি অনুযায়ী কোর্স</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDist}
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.categoryDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top courses + Payment split */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border/50 shadow-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">সর্বাধিক আয়কারী কোর্স</h3>
            <Award className="h-4 w-4 text-accent" />
          </div>
          <div className="space-y-3">
            {data.topCourses.slice(0, 5).map((c: any, i: number) => {
              const max = data.topCourses[0]?.revenue || 1;
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate font-medium">{c.name}</span>
                    </div>
                    <span className="font-bold shrink-0 ml-2">৳{c.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                      style={{ width: `${(c.revenue / max) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{c.students} জন শিক্ষার্থী</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border/50 shadow-card p-4 sm:p-5">
          <h3 className="font-semibold text-sm mb-4">পেমেন্ট পদ্ধতি</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.providers}
                  innerRadius={35}
                  outerRadius={65}
                  dataKey="value"
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {data.providers.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {data.providers.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span>{p.name}</span>
                </div>
                <span className="font-semibold">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b bg-secondary/30 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">কোর্স পারফরম্যান্স</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-secondary/30">
              <tr className="text-left">
                <th className="px-4 py-2.5 font-medium">কোর্স</th>
                <th className="px-4 py-2.5 font-medium text-right">শিক্ষার্থী</th>
                <th className="px-4 py-2.5 font-medium text-right hidden sm:table-cell">রেটিং</th>
                <th className="px-4 py-2.5 font-medium text-right">আয়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.topCourses.slice(0, 8).map((c: any, i: number) => {
                const ar = data.avgRating || "—";
                return (
                  <tr key={i} className="hover:bg-secondary/20">
                    <td className="px-4 py-2.5 truncate max-w-[180px]">{c.name}</td>
                    <td className="px-4 py-2.5 text-right">{c.students}</td>
                    <td className="px-4 py-2.5 text-right hidden sm:table-cell">
                      <span className="inline-flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-accent text-accent" /> {ar}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold">
                      ৳{(c.revenue || 0).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;

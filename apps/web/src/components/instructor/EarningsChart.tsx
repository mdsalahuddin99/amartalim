import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, DollarSign, Users, Wallet } from "lucide-react";

export interface MonthlyEarning {
  month: string;
  earnings: number;
  enrollments: number;
}

export interface CourseEarning {
  courseId: string;
  title: string;
  thumbnail?: string;
  earnings: number;
  students: number;
}

interface Props {
  monthly: MonthlyEarning[];
  perCourse: CourseEarning[];
  totalEarnings: number;
  pendingPayout?: number;
}

const fmtBDT = (n: number) =>
  n >= 1000 ? `৳${(n / 1000).toFixed(1)}K` : `৳${n}`;

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--accent) / 0.7)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--accent) / 0.5)",
];

export const EarningsChart = ({
  monthly,
  perCourse,
  totalEarnings,
  pendingPayout = 0,
}: Props) => {
  const totalEnrollments = useMemo(
    () => monthly.reduce((s, m) => s + m.enrollments, 0),
    [monthly],
  );
  const avgMonthly = useMemo(
    () => (monthly.length ? Math.round(totalEarnings / monthly.length) : 0),
    [monthly, totalEarnings],
  );

  const stats = [
    { label: "মোট আয়", value: fmtBDT(totalEarnings), icon: DollarSign, color: "text-emerald-500" },
    { label: "মাসিক গড়", value: fmtBDT(avgMonthly), icon: TrendingUp, color: "text-primary" },
    { label: "মোট এনরোলমেন্ট", value: totalEnrollments, icon: Users, color: "text-blue-500" },
    { label: "অপেক্ষমাণ পেআউট", value: fmtBDT(pendingPayout), icon: Wallet, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 shadow-card"
          >
            <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color} mb-2`} />
            <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border/50 shadow-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">মাসিক আয়</h3>
          <span className="text-[10px] text-muted-foreground">গত {monthly.length} মাস</span>
        </div>
        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={fmtBDT} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => [fmtBDT(v), "আয়"]}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#earnGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/50 shadow-card p-4 sm:p-5">
        <h3 className="font-semibold text-sm mb-4">কোর্স অনুযায়ী আয়</h3>
        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perCourse} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="title"
                tick={{ fontSize: 9 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(t: string) => (t.length > 10 ? t.slice(0, 10) + "…" : t)}
              />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={fmtBDT} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => [fmtBDT(v), "আয়"]}
              />
              <Bar dataKey="earnings" radius={[8, 8, 0, 0]}>
                {perCourse.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 divide-y divide-border/50">
          {perCourse.map((c, i) => (
            <div key={c.courseId} className="py-2.5 flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-sm truncate flex-1">{c.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">{c.students} জন</span>
              <span className="text-sm font-semibold shrink-0 w-16 text-right">
                {fmtBDT(c.earnings)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;

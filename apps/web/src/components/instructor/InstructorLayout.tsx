import { Link, useLocation } from "@/lib/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, FileText, Users, Settings, LogOut,
  BarChart3, Menu, LineChart, ClipboardList, FileQuestion, PlaySquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Course } from "@/types/course";
import { useSession } from "@/server/auth/session";
import RoleGuard from "@/components/shared/RoleGuard";
// AdminProvider is mounted globally in App.tsx
import { ReactNode, useState } from "react";

import SmartImage from "@/components/shared/SmartImage";
const sidebarItems = [
  { title: "ড্যাশবোর্ড", url: "/instructor", icon: LayoutDashboard },
  { title: "আমার কোর্স", url: "/instructor/courses", icon: BookOpen },
  { title: "পাঠসমূহ", url: "/instructor/lessons", icon: FileText },
  { title: "পাঠ ব্যবস্থাপনা", url: "/instructor/lesson-builder", icon: PlaySquare },
  { title: "কুইজ ব্যবস্থাপনা", url: "/instructor/quiz-builder", icon: FileQuestion },
  { title: "শিক্ষার্থী", url: "/instructor/students", icon: Users },
  { title: "আয় ও পেআউট", url: "/instructor/earnings", icon: LineChart },
  { title: "প্রগ্রেস রিপোর্ট", url: "/instructor/reports", icon: ClipboardList },
  { title: "পারফরম্যান্স", url: "/instructor/performance", icon: BarChart3 },
  { title: "সেটিংস", url: "/instructor/settings", icon: Settings },
];

const SidebarNav = ({ onItemClick }: { onItemClick?: () => void }) => {
  const location = useLocation();
  return (
    <>
      <div className="p-4">
        <Link to="/" className="text-lg font-bold tracking-tight">
          <span className="text-gradient">Amar</span> Talim
        </Link>
        <div className="text-xs text-muted-foreground mt-1">ইন্সট্রাক্টর প্যানেল</div>
      </div>
      <div className="px-3 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              (item.url === "/instructor" ? location.pathname === "/instructor" : location.pathname.startsWith(item.url))
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
      <div className="mt-auto p-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" /> সাইন আউট
          </Button>
        </Link>
      </div>
    </>
  );
};

const MobileHeader = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const initial = (user?.name || "ইন্সট্রাক্টর").trim().charAt(0) || "ই";
  return (
    <header className="md:hidden sticky top-0 z-40 h-14 flex items-center justify-between border-b px-4 glass">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SidebarNav onItemClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <Link to="/" className="text-lg font-bold tracking-tight">
        <span className="text-gradient">Amar</span> Talim
      </Link>
      {user?.avatar ? (
        <SmartImage src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-xs font-semibold text-primary-foreground">
          {initial}
        </div>
      )}
    </header>
  );
};

export const InstructorLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { user } = useSession();
  const displayName = user?.name || "ইন্সট্রাক্টর";
  const initial = displayName.trim().charAt(0) || "ই";
  return (
    <RoleGuard allow={["instructor", "admin"]}>
      <div className="min-h-screen flex w-full bg-background">
        <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
          <SidebarNav />
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader />
          <header className="hidden md:flex h-14 items-center border-b px-6 glass">
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">{displayName}</div>
                <div className="text-xs text-muted-foreground">ইন্সট্রাক্টর</div>
              </div>
              {user?.avatar ? (
                <SmartImage src={user.avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-sm font-semibold text-primary-foreground">
                  {initial}
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
};

export default InstructorLayout;

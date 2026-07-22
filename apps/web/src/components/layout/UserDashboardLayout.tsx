"use client";

import { ReactNode, useState } from "react";
import { Link, useLocation } from "@/lib/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, FileText, Trophy, Heart, Receipt,
  Menu, LogOut, ChevronDown, ChevronRight, GraduationCap, ArrowRight, MessageSquare, PenSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession, userPanelStore, useUserPanelSession } from "@/server/auth/session";
import { useNavigate } from "@/lib/navigation";

const sidebarGroups = [
  {
    title: "আমার ড্যাশবোর্ড",
    items: [
      { title: "ড্যাশবোর্ড", url: "/dashboard", icon: LayoutDashboard },
      { title: "আমার কোর্সসমূহ", url: "/my-courses", icon: BookOpen },
      { title: "সার্টিফিকেট", url: "/certificates", icon: FileText },
      { title: "লিডারবোর্ড", url: "/leaderboard", icon: Trophy },
      { title: "উইশলিস্ট", url: "/wishlist", icon: Heart },
      { title: "আমার জিজ্ঞাসা", url: "/dashboard/qa", icon: MessageSquare },
      { title: "অর্ডার হিস্ট্রি", url: "/orders", icon: Receipt },
    ]
  }
];

const SidebarGroup = ({ group, location, onItemClick }: any) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className="space-y-1"
      onMouseEnter={() => setIsOpen(true)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider opacity-80 hover:opacity-100 transition-opacity"
      >
        <span>{group.title}</span>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      {isOpen && (
        <div className="space-y-1 mt-1">
          {group.items.map((item: any) => (
            <Link
              key={item.title}
              to={item.url}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                (item.url === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(item.url))
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarNav = ({ onItemClick, isAuthor, isInstructor, isMufti }: {
  onItemClick?: () => void;
  isAuthor?: boolean;
  isInstructor?: boolean;
  isMufti?: boolean;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserPanelSession();

  const actualIsInstructor = isInstructor || user?.approvedRoles?.includes("INSTRUCTOR");
  const actualIsAuthor = isAuthor || user?.approvedRoles?.includes("AUTHOR");
  const actualIsMufti = isMufti || user?.approvedRoles?.includes("MUFTI");

  const handleLogout = () => {
    userPanelStore.signOut();   // clears only user-panel localStorage
    navigate("/dashboard/login");
  };

  // Show apply link only if user has NONE of the 3 roles yet
  const hasAnyRole = isInstructor || isAuthor || isMufti;

  const navLinkClass = (active: boolean) =>
    `flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

  return (
    <>
      <div className="p-4">
        <Link to="/" className="text-lg font-bold tracking-tight">
          <span className="text-gradient">Amar</span> Talim
        </Link>
      </div>
      <div className="px-3 space-y-4 pb-6">
        {sidebarGroups.map((group) => (
          <SidebarGroup key={group.title} group={group} location={location} onItemClick={onItemClick} />
        ))}

        {/* Role-based Section */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider opacity-80">
            শিক্ষক / লেখক / মুফতি
          </div>
          <div className="space-y-1 mt-1">
            {/* Instructor */}
            {actualIsInstructor ? (
              <Link
                to="/instructor"
                onClick={onItemClick}
                className={navLinkClass(location.pathname.startsWith("/instructor"))}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4" />
                  <span>ইন্সট্রাক্টর প্যানেল</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-50" />
              </Link>
            ) : (
              <Link
                to="/dashboard/apply/instructor"
                onClick={onItemClick}
                className={navLinkClass(location.pathname.startsWith("/dashboard/apply/instructor"))}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4" />
                  <span>ইন্সট্রাক্টর আবেদন</span>
                </div>
              </Link>
            )}

            {/* Author */}
            {actualIsAuthor ? (
              <Link
                to="/author"
                onClick={onItemClick}
                className={navLinkClass(location.pathname.startsWith("/author"))}
              >
                <div className="flex items-center gap-3">
                  <PenSquare className="h-4 w-4" />
                  <span>লেখক প্যানেল</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-50" />
              </Link>
            ) : (
              <Link
                to="/dashboard/apply/author"
                onClick={onItemClick}
                className={navLinkClass(location.pathname.startsWith("/dashboard/apply/author"))}
              >
                <div className="flex items-center gap-3">
                  <PenSquare className="h-4 w-4" />
                  <span>লেখক আবেদন</span>
                </div>
              </Link>
            )}

            {/* Mufti */}
            {actualIsMufti ? (
              <Link
                to="/mufti"
                onClick={onItemClick}
                className={navLinkClass(location.pathname.startsWith("/mufti"))}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  <span>মুফতি প্যানেল</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-50" />
              </Link>
            ) : (
              <Link
                to="/dashboard/apply/mufti"
                onClick={onItemClick}
                className={navLinkClass(location.pathname.startsWith("/dashboard/apply/mufti"))}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  <span>মুফতি আবেদন</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 space-y-1">
        <Link to="/">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" /> মূল ওয়েবসাইটে ফিরুন
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> লগ আউট
        </Button>
      </div>
    </>
  );
};

const MobileHeader = ({ isAuthor, isInstructor, isMufti }: { isAuthor?: boolean, isInstructor?: boolean, isMufti?: boolean }) => {
  const [open, setOpen] = useState(false);
  const { user } = useUserPanelSession();
  const firstName = (user?.name ?? "শিক্ষার্থী").split(" ")[0];

  return (
    <header className="md:hidden sticky top-0 z-40 h-14 flex items-center justify-between border-b px-4 glass">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SidebarNav onItemClick={() => setOpen(false)} isAuthor={isAuthor} isInstructor={isInstructor} isMufti={isMufti} />
        </SheetContent>
      </Sheet>
      <Link to="/" className="text-lg font-bold tracking-tight">
        <span className="text-gradient">Amar</span> Talim
      </Link>
      <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-xs font-semibold text-primary-foreground">
        {firstName.charAt(0)}
      </div>
    </header>
  );
};

export const UserDashboardLayout = ({ children, isAuthor, isInstructor, isMufti }: {
  children: ReactNode;
  isAuthor?: boolean;
  isInstructor?: boolean;
  isMufti?: boolean;
}) => {
  const location = useLocation();
  const { user } = useUserPanelSession();
  const firstName = (user?.name ?? "শিক্ষার্থী").split(" ")[0];

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
        <SidebarNav isAuthor={isAuthor} isInstructor={isInstructor} isMufti={isMufti} />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader isAuthor={isAuthor} isInstructor={isInstructor} isMufti={isMufti} />
        <header className="hidden md:flex h-14 items-center justify-between border-b px-6 glass sticky top-0 z-30">
          <div className="text-sm font-medium text-muted-foreground">
            {/* Context title could be added here */}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/courses">
              <Button variant="outline" size="sm" className="h-8 rounded-full text-xs">
                নতুন কোর্স ব্রাউজ করুন
              </Button>
            </Link>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium leading-none">{user?.name || "শিক্ষার্থী"}</div>
              <div className="text-xs text-muted-foreground mt-1">আমার অ্যাকাউন্ট</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-sm font-semibold text-primary-foreground shadow-sm">
              {firstName.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto bg-muted/10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboardLayout;

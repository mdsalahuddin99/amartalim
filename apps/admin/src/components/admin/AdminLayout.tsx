"use client";

import { Link, useLocation } from "@/lib/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, FolderOpen, FileQuestion, Users, Settings, LogOut,
  Menu, Newspaper, Tag, Megaphone, UserCheck, Ticket, Receipt, GraduationCap, BarChart3, MessageSquare, Home, CreditCard,
  ChevronDown, ChevronRight, UserPlus, PanelTop, Library, MonitorSmartphone, Code, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import RoleGuard from "@/components/shared/RoleGuard";
// AdminProvider is mounted globally in App.tsx
import { ReactNode, useState } from "react";
import { useSession, sessionStore } from "@/server/auth/session";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const sidebarGroups = [
  {
    title: "ওভারভিউ",
    icon: LayoutDashboard,
    items: [
      { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard },
      { title: "রিপোর্ট", url: "/admin/reports", icon: BarChart3 },
      { title: "অর্ডার ও সেলস", url: "/admin/orders", icon: Receipt },
    ]
  },
  {
    title: "ব্লগ সেকশন",
    icon: Newspaper,
    items: [
      { title: "ব্লগসমূহ", url: "/admin/blogs", icon: Newspaper },
      { title: "ব্লগ ক্যাটাগরি", url: "/admin/blog-categories", icon: Tag },
      { title: "মন্তব্যসমূহ", url: "/admin/comments", icon: MessageSquare },
    ]
  },
  {
    title: "কনটেন্ট CMS",
    icon: MonitorSmartphone,
    items: [
      { title: "হোমপেজ কনটেন্ট", url: "/admin/homepage", icon: Home },
      { title: "হেডার ও ফুটার", url: "/admin/header-footer", icon: PanelTop },
    ]
  },
  {
    title: "প্রশ্ন ও উত্তর",
    icon: MessageSquare,
    items: [
      { title: "আপনার জিজ্ঞাসা (QA)", url: "/admin/qa/posts", icon: MessageSquare },
      { title: "জিজ্ঞাসা ক্যাটাগরি", url: "/admin/qa/categories", icon: FolderOpen },
    ]
  },
  {
    title: "কোর্স সেকশন",
    icon: GraduationCap,
    items: [
      { title: "কোর্সসমূহ", url: "/admin/courses", icon: BookOpen },
      { title: "কোর্স ক্যাটাগরি", url: "/admin/categories", icon: FolderOpen },
      { title: "কুইজসমূহ", url: "/admin/quizzes", icon: FileQuestion },
      { title: "প্রাইসিং ও মেম্বারশিপ", url: "/admin/pricing", icon: CreditCard },
      { title: "কুপন", url: "/admin/coupons", icon: Ticket },
    ]
  },
  {
    title: "বই সেকশন",
    icon: Library,
    items: [
      { title: "লাইব্রেরি বই", url: "/admin/books", icon: BookOpen },
      { title: "বইয়ের ক্যাটাগরি", url: "/admin/book-categories", icon: FolderOpen },
    ]
  },
  {
    title: "ইউজার সেকশন",
    icon: Users,
    items: [
      { title: "ইউজার আবেদন", url: "/admin/applications", icon: UserPlus },
      { title: "শিক্ষার্থী", url: "/admin/students", icon: Users },
      { title: "শিক্ষকগণ", url: "/admin/instructors", icon: GraduationCap },
      { title: "মুফতি সাহেবগণ", url: "/admin/qa/muftis", icon: UserCheck },
      { title: "লেখকগণ", url: "/admin/authors", icon: UserCheck },
    ]
  },
  {
    title: "ডেভেলপার সেকশন",
    icon: Code,
    items: [
      { title: "বিজ্ঞাপন", url: "/admin/ads", icon: Megaphone },
      { title: "থার্ড পার্টি কানেকশন", url: "/admin/developer/integrations", icon: Settings },
      { title: "সাইট ব্যাকআপ", url: "/admin/developer/backup", icon: Settings },
      { title: "জেনারেল সেটিংস", url: "/admin/settings", icon: Settings },
    ]
  }
];

const SidebarGroup = ({ group, location, onItemClick, isCollapsed }: any) => {
  const isActive = group.items.some((item: any) => 
    item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url)
  );
  const [isOpen, setIsOpen] = useState(isActive);

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center py-2 space-y-2 relative group cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
              <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <group.icon className="h-5 w-5" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col gap-1 p-2 bg-popover text-popover-foreground shadow-md rounded-xl border">
            <div className="font-bold text-xs uppercase tracking-wider mb-1 px-2 text-muted-foreground">{group.title}</div>
            {group.items.map((item: any) => (
              <Link
                key={item.title}
                to={item.url}
                onClick={onItemClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url))
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <group.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">{group.title}</span>
        </div>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      
      {isOpen && (
        <div className="space-y-1 mt-1 pl-6 relative before:content-[''] before:absolute before:left-3.5 before:top-0 before:bottom-0 before:w-px before:bg-border/50">
          {group.items.map((item: any) => (
            <Link
              key={item.title}
              to={item.url}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative before:content-[''] before:absolute before:-left-[17px] before:top-1/2 before:-translate-y-1/2 before:w-[12px] before:h-px before:bg-border/50 ${
                (item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url))
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

const SidebarNav = ({ onItemClick, isCollapsed, setIsCollapsed }: any) => {
  const location = useLocation();
  return (
    <div className="flex flex-col h-full">
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <Link to="/" className="text-lg font-bold tracking-tight">
            <span className="text-gradient">Amar</span> Talim
          </Link>
        )}
        {isCollapsed && (
          <Link to="/" className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">
            A
          </Link>
        )}
      </div>
      
      <div className={`px-2 space-y-2 pb-6 flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'items-center' : ''}`}>
        {sidebarGroups.map((group) => (
          <SidebarGroup key={group.title} group={group} location={location} onItemClick={onItemClick} isCollapsed={isCollapsed} />
        ))}
      </div>
      
      <div className="mt-auto p-4 border-t border-border/50 space-y-2">
        <Button 
          variant="ghost" 
          size={isCollapsed ? "icon" : "sm"} 
          className={`w-full text-muted-foreground ${isCollapsed ? 'justify-center' : 'justify-start'}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="mr-2 h-4 w-4" /> মেনু লুকান</>}
        </Button>
        <Button 
          variant="ghost" 
          size={isCollapsed ? "icon" : "sm"} 
          className={`w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${isCollapsed ? 'justify-center' : 'justify-start'}`}
          onClick={() => {
            sessionStore.signOut();
          }}
        >
          {isCollapsed ? <LogOut className="h-4 w-4 text-destructive" /> : <><LogOut className="mr-2 h-4 w-4 text-destructive" /> <span className="text-destructive">সাইন আউট</span></>}
        </Button>
      </div>
    </div>
  );
};

const MobileHeader = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const avatarChar = user?.name ? user.name.charAt(0) : "আ";
  
  return (
    <header className="md:hidden sticky top-0 z-40 h-14 flex items-center justify-between border-b px-4 glass">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SidebarNav onItemClick={() => setOpen(false)} isCollapsed={false} setIsCollapsed={() => {}} />
        </SheetContent>
      </Sheet>
      <Link to="/" className="text-lg font-bold tracking-tight">
        <span className="text-gradient">Amar</span> Talim
      </Link>
      <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-xs font-semibold text-primary-foreground">
        {avatarChar}
      </div>
    </header>
  );
};

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { user } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const avatarChar = user?.name ? user.name.charAt(0) : "আ";
  
  return (
    <RoleGuard allow={["admin"]}>
      <div className="min-h-screen flex w-full bg-background">
      <aside className={`hidden md:flex flex-col border-r bg-card h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>
      <div className="flex-1 flex flex-col min-w-0 transition-all">
        <MobileHeader />
        <header className="hidden md:flex h-14 items-center border-b px-6 glass">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.name || "অ্যাডমিন"}</div>
              <div className="text-xs text-muted-foreground">অ্যাডমিন</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-sm font-semibold text-primary-foreground shadow-sm">
              {avatarChar}
            </div>
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

export default AdminLayout;

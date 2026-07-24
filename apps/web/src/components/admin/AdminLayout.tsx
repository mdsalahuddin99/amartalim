"use client";

import { Link, useLocation } from "@/lib/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, FolderOpen, FileQuestion, Users, Settings, LogOut,
  Menu, Newspaper, Tag, Megaphone, UserCheck, Ticket, Receipt, GraduationCap, BarChart3, MessageSquare, Home, CreditCard,
  ChevronDown, ChevronRight, UserPlus, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import RoleGuard from "@/components/shared/RoleGuard";
// AdminProvider is mounted globally in App.tsx
import { ReactNode, useState } from "react";
import { useSession } from "@/server/auth/session";

const sidebarGroups = [
  {
    title: "ওভারভিউ",
    items: [
      { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard },
      { title: "রিপোর্ট", url: "/admin/reports", icon: BarChart3 },
    ]
  },
  {
    title: "কন্টেন্ট ও পাবলিকেশন",
    items: [
      { title: "ব্লগসমূহ", url: "/admin/blogs", icon: Newspaper },
      { title: "ব্লগ ক্যাটাগরি", url: "/admin/blog-categories", icon: Tag },
      { title: "মন্তব্যসমূহ", url: "/admin/comments", icon: MessageSquare },
      { title: "হোমপেজ কনটেন্ট", url: "/admin/homepage", icon: Home },
    ]
  },
  {
    title: "প্রশ্ন ও উত্তর",
    items: [
      { title: "আপনার জিজ্ঞাসা (QA)", url: "/admin/qa/posts", icon: MessageSquare },
      { title: "জিজ্ঞাসা ক্যাটাগরি", url: "/admin/qa/categories", icon: FolderOpen },
    ]
  },
  {
    title: "একাডেমি ও লাইব্রেরি",
    items: [
      { title: "লাইব্রেরি বই", url: "/admin/books", icon: BookOpen },
      { title: "বইয়ের ক্যাটাগরি", url: "/admin/book-categories", icon: FolderOpen },
      { title: "কোর্সসমূহ", url: "/admin/courses", icon: BookOpen },
      { title: "কোর্স ক্যাটাগরি", url: "/admin/categories", icon: FolderOpen },
      { title: "কুইজসমূহ", url: "/admin/quizzes", icon: FileQuestion },
    ]
  },
  {
    title: "ইউজার ম্যানেজমেন্ট",
    items: [
      { title: "ইউজার আবেদন", url: "/admin/applications", icon: UserPlus },
      { title: "শিক্ষার্থী", url: "/admin/students", icon: Users },
      { title: "শিক্ষকগণ", url: "/admin/instructors", icon: GraduationCap },
      { title: "মুফতি সাহেবগণ", url: "/admin/qa/muftis", icon: UserCheck },
      { title: "লেখকগণ", url: "/admin/authors", icon: UserCheck },
    ]
  },
  {
    title: "অপারেশন ও সেটিংস",
    items: [
      { title: "অর্ডার ও সেলস", url: "/admin/orders", icon: Receipt },
      { title: "প্রাইসিং ও মেম্বারশিপ", url: "/admin/pricing", icon: CreditCard },
      { title: "কুপন", url: "/admin/coupons", icon: Ticket },
      { title: "বিজ্ঞাপন", url: "/admin/ads", icon: Megaphone },
      { title: "সেটিংস", url: "/admin/settings", icon: Settings },
    ]
  }
];

const SidebarGroup = ({ group, location, onItemClick }: any) => {
  const isActive = group.items.some((item: any) => 
    item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url)
  );
  const [isOpen, setIsOpen] = useState(isActive);

  return (
    <div 
      className="space-y-1"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => { if (!isActive) setIsOpen(false) }}
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

const SidebarNav = ({ onItemClick, onHide }: { onItemClick?: () => void; onHide?: () => void }) => {
  const location = useLocation();
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
      </div>
      <div className="mt-auto p-4 space-y-2">
        {onHide && (
          <Button variant="ghost" size="sm" onClick={onHide} className="w-full justify-start text-muted-foreground hover:bg-secondary">
            <ChevronLeft className="mr-2 h-4 w-4" /> মেনু লুকান
          </Button>
        )}
        <Link to="/">
          <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50">
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
          <SidebarNav onItemClick={() => setOpen(false)} />
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
  const avatarChar = user?.name ? user.name.charAt(0) : "আ";
  const [isMenuHidden, setIsMenuHidden] = useState(false);
  
  return (
    <RoleGuard allow={["admin"]}>
      <div className="min-h-screen flex w-full bg-background overflow-hidden">
      <aside className={`hidden md:flex flex-col border-r bg-card h-screen sticky top-0 transition-all duration-300 ${isMenuHidden ? 'w-0 overflow-hidden border-r-0 opacity-0' : 'w-64 opacity-100'}`}>
        <div className="w-64 h-full flex flex-col overflow-y-auto">
          <SidebarNav onHide={() => setIsMenuHidden(true)} />
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <MobileHeader />
        <header className="hidden md:flex h-14 items-center border-b px-6 glass shrink-0">
          <div className="flex-1 flex items-center">
            {isMenuHidden && (
              <Button variant="ghost" size="icon" onClick={() => setIsMenuHidden(false)} className="mr-4 text-muted-foreground hover:text-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.name || "অ্যাডমিন"}</div>
              <div className="text-xs text-muted-foreground">অ্যাডমিন</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-sm font-semibold text-primary-foreground">
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

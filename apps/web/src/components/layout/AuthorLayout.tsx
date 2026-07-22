"use client";

import { ReactNode, useState } from "react";
import { Link, useLocation } from "@/lib/navigation";
import { motion } from "framer-motion";
import {
  PenSquare, Menu, LogOut, ChevronDown, ChevronRight, LayoutDashboard, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession, useUserPanelSession } from "@/server/auth/session";
import SmartImage from "@/components/shared/SmartImage";

const sidebarItems = [
  { title: "ড্যাশবোর্ড", url: "/author", icon: LayoutDashboard },
  { title: "আমার লেখাসমূহ", url: "/author/blogs", icon: FileText },
];

const SidebarNav = ({ onItemClick }: { onItemClick?: () => void }) => {
  const location = useLocation();

  return (
    <>
      <div className="p-4">
        <Link to="/" className="text-lg font-bold tracking-tight">
          <span className="text-gradient">Amar</span> Talim
        </Link>
        <div className="text-xs text-muted-foreground mt-1">লেখক প্যানেল</div>
      </div>
      <div className="px-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = item.url === "/author" 
            ? location.pathname === "/author" 
            : location.pathname.startsWith(item.url);
          
          return (
            <Link
              key={item.title}
              to={item.url}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto p-4 space-y-1">
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground mb-2 border-dashed">
            <LayoutDashboard className="mr-2 h-4 w-4" /> স্টুডেন্ট ড্যাশবোর্ড
          </Button>
        </Link>
        <Link to="/">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" /> মূল ওয়েবসাইটে ফিরুন
          </Button>
        </Link>
      </div>
    </>
  );
};

const MobileHeader = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSession();

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SidebarNav onItemClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link to="/" className="text-lg font-bold tracking-tight">
          <span className="text-gradient">Amar</span> Talim
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full overflow-hidden border">
          <SmartImage src={user?.avatar} alt={user?.name || "User"} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default function AuthorLayout({ children, isAuthor, isAdmin }: { children: ReactNode; isAuthor?: boolean; isAdmin?: boolean }) {
  // Use user panel session to get all roles
  const { user, status } = useUserPanelSession();
  const isLoading = status === "loading";
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  // Check if they have AUTHOR role application approved
  const actualIsAuthor = isAuthor || user?.approvedRoles?.includes("AUTHOR");
  const actualIsAdmin = isAdmin || user?.role === "admin";

  if (!actualIsAdmin && !actualIsAuthor) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">অননুমোদিত অ্যাক্সেস</h2>
          <p className="text-muted-foreground">আপনার লেখক প্যানেলে প্রবেশ করার অনুমতি নেই।</p>
          <Link to="/dashboard">
            <Button>ড্যাশবোর্ডে ফিরে যান</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-card border-r shadow-sm z-20">
        <SidebarNav />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader />
        
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 md:px-8 max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

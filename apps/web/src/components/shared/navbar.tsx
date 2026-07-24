"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "@/lib/navigation";
import { Menu, X, ArrowLeft, Search, Home, BookOpen, Library, LogIn, UserPlus, Tag, GraduationCap, ChevronDown, CreditCard, Heart, Trophy, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import logoAmarTalim from "@/assets/logo-amar-talim.png";

import { NotificationBell } from "@/components/shared/NotificationBell";
import { useSession, sessionStore } from "@/server/auth/session";

import SmartImage from "@/components/shared/SmartImage";
import { getBlogCategories } from "@/server/actions/blog-category.actions";
import { getHeaderFooterSettings } from "@/server/actions/site-settings.actions";
import { type BlogCategory } from "@prisma/client";
interface SharedNavbarProps {
  backTo?: string;
  backLabel?: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  showAuth?: boolean;
  showDashboard?: boolean;
}

const SharedNavbar = ({ backTo, backLabel, rightContent, showAuth }: SharedNavbarProps) => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useSession();

  const [realCats, setRealCats] = useState<BlogCategory[]>([]);
  const [headerLinks, setHeaderLinks] = useState<{ id: string; label: string; url: string; type: string }[]>([]);

  useEffect(() => {
    getBlogCategories().then(res => {
      if (res.ok && res.data) setRealCats(res.data);
    });
    getHeaderFooterSettings().then(res => {
      if (res && res.headerLinks) setHeaderLinks(res.headerLinks);
    });
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const mainCats = realCats.filter((c) => !c.parentId).slice(0, 5);
  const getSubCats = (parentId: string) => realCats.filter((c) => c.parentId === parentId);

  // Compact back-mode header
  if (backTo && backLabel) {
    return (
      <nav className="md:sticky md:top-0 z-50 bg-background border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link to={backTo} className="flex items-center gap-2 text-sm font-medium hover:text-primary min-w-0">
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">{backLabel}</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <SmartImage src={logoAmarTalim} alt="Amar Talim" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-2">{rightContent}</div>
        </div>
      </nav>
    );
  }

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <header className="md:sticky md:top-0 z-50 w-full">
      <nav className="bg-background border-b border-foreground/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <SmartImage
                src={logoAmarTalim}
                alt="Amar Talim"
                className="h-9 w-auto md:transition-transform md:group-hover:scale-105"
              />
            </Link>

            {/* Center: Categories */}
            <div className="hidden lg:flex items-center gap-6">
              {headerLinks.length > 0 ? (
                (() => {
                  const nestedLinks = [];
                  headerLinks.forEach((link: any) => {
                    if (link.isSubmenu && nestedLinks.length > 0) {
                      const parent: any = nestedLinks[nestedLinks.length - 1];
                      if (!parent.children) parent.children = [];
                      parent.children.push(link);
                    } else {
                      nestedLinks.push({ ...link, children: [] });
                    }
                  });
                  
                  return nestedLinks.map((link: any) => {
                    if (link.children && link.children.length > 0) {
                      return (
                        <div key={link.id} className="relative group">
                          <Link
                            to={link.url}
                            className={`text-sm font-semibold transition-colors border-b-2 pb-1 inline-flex items-center gap-1 ${
                              isActive(link.url) && (link.url === "/" ? location.pathname === "/" : true)
                                ? "text-primary border-[hsl(var(--accent))]"
                                : "text-foreground/70 border-transparent hover:text-primary hover:border-[hsl(var(--accent))]"
                            }`}
                          >
                            {link.label} <ChevronDown className="h-3.5 w-3.5" />
                          </Link>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[200px] z-50">
                            <div className="bg-background border border-foreground/10 rounded-xl shadow-lg overflow-hidden py-2">
                              {link.children.map((child: any) => (
                                <Link
                                  key={child.id}
                                  to={child.url}
                                  className="block px-4 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={link.id}
                        to={link.url}
                        className={`text-sm font-semibold transition-colors border-b-2 pb-1 ${
                          isActive(link.url) && (link.url === "/" ? location.pathname === "/" : true)
                            ? "text-primary border-[hsl(var(--accent))]"
                            : "text-foreground/70 border-transparent hover:text-primary hover:border-[hsl(var(--accent))]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  });
                })()
              ) : (
                <>
                  <Link
                    to="/"
                    className={`text-sm font-semibold transition-colors border-b-2 pb-1 ${
                      isActive("/") && location.pathname === "/"
                        ? "text-primary border-[hsl(var(--accent))]"
                        : "text-foreground/70 border-transparent hover:text-primary hover:border-[hsl(var(--accent))]"
                    }`}
                  >
                    হোম
                  </Link>
                  <Link
                    to="/qa"
                    className={`text-sm font-semibold transition-colors border-b-2 pb-1 ${
                      isActive("/qa")
                        ? "text-primary border-[hsl(var(--accent))]"
                        : "text-foreground/70 border-transparent hover:text-primary hover:border-[hsl(var(--accent))]"
                    }`}
                  >
                    আপনার জিজ্ঞাসা
                  </Link>
                  <Link
                    to="/library"
                    className={`text-sm font-semibold transition-colors border-b-2 pb-1 ${
                      isActive("/library")
                        ? "text-primary border-[hsl(var(--accent))]"
                        : "text-foreground/70 border-transparent hover:text-primary hover:border-[hsl(var(--accent))]"
                    }`}
                  >
                    লাইব্রেরি
                  </Link>
                </>
              )}
              {/* <div className="relative group">
                <Link
                  to="/courses"
                  className={`text-sm font-semibold transition-colors border-b-2 pb-1 inline-flex items-center gap-1 ${
                    isActive("/courses")
                      ? "text-primary border-[hsl(var(--accent))]"
                      : "text-foreground/70 border-transparent hover:text-primary hover:border-[hsl(var(--accent))]"
                  }`}
                >
                  কোর্স <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[220px] z-50">
                  <div className="bg-background border border-foreground/10 rounded-xl shadow-lg overflow-hidden py-2">
                    <Link to="/courses" className="block px-4 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors font-semibold">
                      সব কোর্স
                    </Link>
                    <div className="h-px bg-foreground/10 my-1" />
                    {courseCategories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/courses?cat=${c.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <span>{c.icon}</span>
                        <span>{c.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div> */}

            </div>

            {/* Right: Search + Auth + Mobile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                aria-label="Search"
                className="p-2 text-foreground/60 hover:text-primary hover:bg-foreground/5 rounded-full transition-colors"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
              <NotificationBell />
              {/* Desktop: Login + Register buttons OR User profile / Dashboard */}
              <div className="hidden lg:flex items-center gap-2">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <Link to={user.role === "admin" ? "/admin" : user.role === "instructor" ? "/instructor" : "/dashboard"}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full font-semibold text-foreground/70 hover:text-primary px-4"
                      >
                        ড্যাশবোর্ড
                      </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                      {user.avatar ? (
                        <SmartImage src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {user.name.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to="/login">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full font-semibold text-foreground/70 hover:text-primary px-4"
                      >
                        <LogIn className="h-4 w-4 mr-1.5" />
                        লগইন
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button
                        size="sm"
                        className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground px-5 font-semibold shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
                      >
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        রেজিস্ট্রেশন
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              {/* Mobile drawer trigger */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button
                    aria-label="Menu"
                    className="lg:hidden p-2 text-foreground/70 hover:text-primary rounded-full hover:bg-foreground/5 transition-colors"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[85vw] sm:w-[380px] p-0 flex flex-col bg-background"
                >
                  <SheetHeader className="px-5 py-4 border-b border-foreground/10 text-left">
                    <SheetTitle asChild>
                      <Link to="/" className="flex items-center gap-2.5">
                        <SmartImage src={logoAmarTalim} alt="Amar Talim" className="h-9 w-auto" />
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-3 py-4">
                    <Accordion type="multiple" className="w-full">
                      {headerLinks.length > 0 ? (
                        (() => {
                          const nestedLinks = [];
                          headerLinks.forEach((link: any) => {
                            if (link.isSubmenu && nestedLinks.length > 0) {
                              const parent: any = nestedLinks[nestedLinks.length - 1];
                              if (!parent.children) parent.children = [];
                              parent.children.push(link);
                            } else {
                              nestedLinks.push({ ...link, children: [] });
                            }
                          });

                          return nestedLinks.map((link: any) => {
                            if (link.children && link.children.length > 0) {
                              return (
                                <AccordionItem value={link.id} key={link.id} className="border-b-0">
                                  <AccordionTrigger className={`flex items-center gap-3 px-3 py-3 rounded-xl font-serif-bn font-bold text-base transition-all hover:no-underline hover:bg-foreground/5 ${isActive(link.url) ? "text-primary" : "text-foreground/80"}`}>
                                    <div className="flex items-center gap-3">
                                      <span>{link.label}</span>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pb-1 pl-6 pr-3">
                                    <div className="flex flex-col space-y-1">
                                      {link.children.map((child: any) => (
                                        <SheetClose asChild key={child.id}>
                                          <Link
                                            to={child.url}
                                            className="block px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-foreground/5 hover:text-primary transition-colors font-medium"
                                          >
                                            {child.label}
                                          </Link>
                                        </SheetClose>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            }
                            return (
                              <SheetClose asChild key={link.id}>
                                <Link
                                  to={link.url}
                                  className={`flex items-center gap-3 px-3 py-3 rounded-xl font-serif-bn font-bold text-base transition-all ${
                                    isActive(link.url) && (link.url === "/" ? location.pathname === "/" : true)
                                      ? "bg-primary/10 text-primary"
                                      : "text-foreground/80 hover:bg-foreground/5"
                                  }`}
                                >
                                  <span>{link.label}</span>
                                </Link>
                              </SheetClose>
                            );
                          });
                        })()
                      ) : (
                        <>
                          {/* HOME */}
                          <SheetClose asChild>
                            <Link
                              to="/"
                              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-serif-bn font-bold text-base transition-all ${
                                location.pathname === "/"
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground/80 hover:bg-foreground/5"
                              }`}
                            >
                              <Home className="h-5 w-5 shrink-0" />
                              <span>হোম</span>
                            </Link>
                          </SheetClose>

                          {/* QA */}
                          <SheetClose asChild>
                            <Link
                              to="/qa"
                              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-serif-bn font-bold text-base transition-all ${
                                isActive("/qa")
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground/80 hover:bg-foreground/5"
                              }`}
                            >
                              <HelpCircle className="h-5 w-5 shrink-0" />
                              <span>আপনার জিজ্ঞাসা</span>
                            </Link>
                          </SheetClose>

                          {/* LIBRARY */}
                          <SheetClose asChild>
                            <Link
                              to="/library"
                              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-serif-bn font-bold text-base transition-all ${
                                isActive("/library")
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground/80 hover:bg-foreground/5"
                              }`}
                            >
                              <Library className="h-5 w-5 shrink-0" />
                              <span>লাইব্রেরি</span>
                            </Link>
                          </SheetClose>
                        </>
                      )}
                    </Accordion>
                  </div>

                  {/* Mobile: Always show Login + Register OR Dashboard + Logout */}
                  <div className="border-t border-foreground/10 p-4 space-y-2 bg-muted/30">
                    {isAuthenticated && user ? (
                      <>
                        <SheetClose asChild>
                          <Link to={user.role === "admin" ? "/admin" : user.role === "instructor" ? "/instructor" : "/dashboard"} className="block">
                            <Button className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:opacity-90">
                              ড্যাশবোর্ড প্রবেশ করুন
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            className="w-full rounded-full font-semibold text-destructive hover:text-destructive"
                            onClick={() => {
                              sessionStore.signOut();
                            }}
                          >
                            লগআউট করুন
                          </Button>
                        </SheetClose>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link to="/register" className="block">
                            <Button className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:opacity-90">
                              <UserPlus className="h-4 w-4 mr-2" />
                              রেজিস্ট্রেশন করুন
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link to="/login" className="block">
                            <Button variant="outline" className="w-full rounded-full font-semibold">
                              <LogIn className="h-4 w-4 mr-2" />
                              লগইন করুন
                            </Button>
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search overlay */}
          {searchOpen && (
              <div className="overflow-hidden">
                <div className="py-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="ব্লগ, লেখক বা বিষয় খুঁজুন..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-full border border-foreground/10 bg-background/60 focus:border-primary outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
        </div>
      </nav>
    </header>
  );
};

export default SharedNavbar;

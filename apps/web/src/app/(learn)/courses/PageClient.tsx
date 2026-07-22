"use client";

import { useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, BookOpen, Users, Star, Clock, Grid3X3, List,
  SlidersHorizontal, X, ChevronDown, ChevronRight, GraduationCap, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import SharedNavbar from "@/components/shared/navbar";

import SmartImage from "@/components/shared/SmartImage";
type ViewMode = "grid" | "list";
type SortOption = "popular" | "newest" | "price-low" | "price-high" | "rating";

const levelOptions = ["শিক্ষানবিস", "মধ্যবর্তী", "উন্নত"] as const;

const priceRanges = [
  { label: "ফ্রি", min: 0, max: 0 },
  { label: "৳০ — ৳১,৫০০", min: 1, max: 1500 },
  { label: "৳১,৫০১ — ৳৩,০০০", min: 1501, max: 3000 },
  { label: "৳৩,০০১ — ৳৫,০০০", min: 3001, max: 5000 },
  { label: "৳৫,০০০+", min: 5001, max: Infinity },
];

interface PageClientProps {
  courses: any[];
  categories: any[];
}

const Courses = ({ courses, categories }: PageClientProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("sub") || searchParams.get("category") || searchParams.get("cat") || "all"
  );
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  // Build category tree maps
  const { roots, childrenOf, descendantsOf, byId } = useMemo(() => {
    const byId = new Map(categories.map((c) => [c.id, c]));
    const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);
    const roots = categories.filter((c) => !c.parentId);
    const descendantsOf = (id: string): string[] => {
      const out: string[] = [];
      const stack = [id];
      while (stack.length) {
        const cur = stack.pop()!;
        for (const c of categories) if (c.parentId === cur) { out.push(c.id); stack.push(c.id); }
      }
      return out;
    };
    return { roots, childrenOf, descendantsOf, byId };
  }, [categories]);

  // Auto-expand parent when a sub is selected
  useMemo(() => {
    const cat = byId.get(selectedCategory);
    if (cat?.parentId) setExpanded((prev) => new Set(prev).add(cat.parentId!));
  }, [selectedCategory, byId]);

  const pickCategory = (id: string) => {
    setSelectedCategory(id);
    const next = new URLSearchParams(searchParams);
    if (id === "all") { next.delete("cat"); next.delete("sub"); next.delete("category"); }
    else {
      const c = byId.get(id);
      if (c?.parentId) { next.set("cat", c.parentId); next.set("sub", id); }
      else { next.set("cat", id); next.delete("sub"); }
      next.delete("category");
    }
    setSearchParams(next, { replace: true });
  };

  const courseCountFor = (id: string): number => {
    const ids = new Set([id, ...descendantsOf(id)]);
    return courses.filter((c) => ids.has(c.categoryId)).length;
  };

  const filtered = courses
    .filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
      let matchesCategory = true;
      if (selectedCategory !== "all") {
        const allowed = new Set([selectedCategory, ...descendantsOf(selectedCategory)]);
        matchesCategory = allowed.has(c.categoryId);
      }
      if (selectedLevels.length > 0 && c.level) {
        if (!selectedLevels.includes(c.level)) return false;
      }
      if (selectedPriceRange !== null) {
        const range = priceRanges[selectedPriceRange];
        if (c.price < range.min || c.price > range.max) return false;
      }
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating": return (b.rating || 0) - (a.rating || 0);
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "newest": return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default: return (b.studentCount || 0) - (a.studentCount || 0);
      }
    });

  const activeFilterCount = (selectedCategory !== "all" ? 1 : 0) + selectedLevels.length + (selectedPriceRange !== null ? 1 : 0);

  const clearFilters = () => {
    pickCategory("all");
    setSelectedLevels([]);
    setSelectedPriceRange(null);
    setSearch("");
  };

  /* ─── Sidebar Content (shared between mobile drawer & desktop) ─── */
  const SidebarFilters = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Grid3X3 className="h-4 w-4 text-primary" /> ক্যাটাগরি
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => pickCategory("all")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === "all" ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-muted-foreground"}`}
          >
            সব ক্যাটাগরি ({courses.length})
          </button>
          {roots.map((cat) => {
            const kids = childrenOf(cat.id);
            const isOpen = expanded.has(cat.id) || selectedCategory === cat.id || kids.some((k) => k.id === selectedCategory);
            const count = courseCountFor(cat.id);
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-1">
                  {kids.length > 0 ? (
                    <button
                      onClick={() => setExpanded((prev) => {
                        const n = new Set(prev);
                        n.has(cat.id) ? n.delete(cat.id) : n.add(cat.id);
                        return n;
                      })}
                      className="p-1 rounded hover:bg-secondary shrink-0"
                      aria-label="toggle"
                    >
                      {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  ) : (
                    <span className="w-6 shrink-0" />
                  )}
                  <button
                    onClick={() => pickCategory(cat.id)}
                    className={`flex-1 text-left px-2.5 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-secondary text-muted-foreground"}`}
                  >
                    {cat.icon} {cat.name} ({count})
                  </button>
                </div>
                {kids.length > 0 && isOpen && (
                  <div className="ml-7 mt-0.5 space-y-0.5 border-l border-border/60 pl-2">
                    {kids.map((sub) => {
                      const subCount = courseCountFor(sub.id);
                      return (
                        <button
                          key={sub.id}
                          onClick={() => pickCategory(sub.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${selectedCategory === sub.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-muted-foreground"}`}
                        >
                          ↳ {sub.icon} {sub.name} ({subCount})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Level */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" /> স্তর
        </h3>
        <div className="space-y-2">
          {levelOptions.map((level) => (
            <label key={level} className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox
                checked={selectedLevels.includes(level)}
                onCheckedChange={() => toggleLevel(level)}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <span className="text-primary text-base">৳</span> মূল্য
        </h3>
        <div className="space-y-1.5">
          {priceRanges.map((range, i) => (
            <button
              key={i}
              onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedPriceRange === i ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-muted-foreground"}`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" className="w-full rounded-lg" onClick={clearFilters}>
          <X className="mr-1.5 h-3.5 w-3.5" /> ফিল্টার মুছুন
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SharedNavbar showAuth />

      {/* Header */}
      <div className="bg-secondary/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              সকল কোর্স
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {courses.length}টি কোর্স থেকে আপনার পছন্দের কোর্স খুঁজুন
            </p>
          </div>
        </div>
      </div>

      <div className="course-scroll-stable max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Top bar: Search + Sort + View toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="কোর্স খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>

          <div className="flex gap-2">
            {/* Mobile filter button */}
            <Button
              variant="outline"
              className="lg:hidden h-11 rounded-xl relative"
              onClick={() => setSidebarOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1.5" />
              ফিল্টার
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="popular">সর্বাধিক জনপ্রিয়</option>
              <option value="rating">সর্বোচ্চ রেটিং</option>
              <option value="newest">সর্বশেষ</option>
              <option value="price-low">কম মূল্য</option>
              <option value="price-high">বেশি মূল্য</option>
            </select>

            {/* View toggle */}
            <div className="hidden sm:flex items-center border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`h-11 w-11 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`h-11 w-11 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">ফিল্টার:</span>
            {selectedCategory !== "all" && (() => {
              const cur = byId.get(selectedCategory);
              const parent = cur?.parentId ? byId.get(cur.parentId) : null;
              const label = parent ? `${parent.name} › ${cur?.name}` : cur?.name;
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {label}
                  <button onClick={() => pickCategory("all")}><X className="h-3 w-3" /></button>
                </span>
              );
            })()}
            {selectedLevels.map((level) => (
              <span key={level} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                {level}
                <button onClick={() => toggleLevel(level)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            {selectedPriceRange !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                {priceRanges[selectedPriceRange].label}
                <button onClick={() => setSelectedPriceRange(null)}><X className="h-3 w-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-destructive hover:underline">সব মুছুন</button>
          </div>
        )}

        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 p-5 rounded-2xl bg-card border border-border/50">
              <h2 className="font-bold text-base mb-5 flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> ফিল্টার
              </h2>
              <SidebarFilters />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filtered.length}টি কোর্স পাওয়া গেছে
              </p>
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 items-start">
                {filtered.map((c) => (
                  <div key={c.id} className="self-start">
                    <Link
                      to={`/courses/${c.id}`}
                      className="group flex flex-col rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-colors duration-200 overflow-hidden"
                    >
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        {c.thumbnail ? (
                          <SmartImage
                            src={c.thumbnail}
                            alt={c.title}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full bg-secondary flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold">
                            {c.categoryName}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-foreground/85 text-background text-xs font-bold shadow-sm">
                          ৳{c.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 space-y-2.5 flex-1">
                        <h3 className="font-semibold text-lg sm:text-xl line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                          {c.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                          {c.instructor?.name && (
                            <span className="flex items-center gap-1.5">
                              <GraduationCap className="h-4 w-4" />
                              {c.instructor.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            {c.rating ? c.rating.toFixed(1) : "0.0"} ({c.reviewCount || 0})
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            {c.studentCount || 0} জন
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-3">
                {filtered.map((c) => (
                  <div key={c.id}>
                    <Link
                      to={`/courses/${c.id}`}
                      className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-colors duration-200"
                    >
                      <div className="sm:w-56 lg:w-64 shrink-0 rounded-xl overflow-hidden bg-secondary aspect-video sm:aspect-[4/3]">
                        {c.thumbnail ? (
                          <SmartImage src={c.thumbnail} alt={c.title} loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                              {c.categoryName}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                              {c.level}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg line-clamp-2 mt-1 min-h-[56px] leading-tight group-hover:text-primary transition-colors">
                            {c.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            {c.instructor?.name && (
                              <span className="truncate max-w-[120px]">
                                {c.instructor.name}
                              </span>
                            )}
                            {c.instructor?.name && <span>•</span>}
                            <span className="flex items-center gap-1 shrink-0">
                              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                              {c.rating ? c.rating.toFixed(1) : "0.0"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Users className="h-3.5 w-3.5" />
                              {c.studentCount || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{c.lessons?.length || 0}টি পাঠ</span>
                          <span className="text-lg font-bold text-primary">৳{c.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">কোনো কোর্স পাওয়া যায়নি</p>
                <p className="text-sm mt-1">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
                <Button variant="outline" size="sm" className="mt-4 rounded-lg" onClick={clearFilters}>
                  ফিল্টার মুছুন
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/40 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background z-50 shadow-xl overflow-y-auto lg:hidden"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" /> ফিল্টার
                  </h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SidebarFilters />
                <Button className="w-full mt-6 rounded-xl h-11 font-semibold" onClick={() => setSidebarOpen(false)}>
                  {filtered.length}টি কোর্স দেখুন
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Courses;

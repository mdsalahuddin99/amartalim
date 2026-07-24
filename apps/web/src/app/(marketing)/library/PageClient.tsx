"use client";

import { useMemo, useState } from "react";
import { Link } from "@/lib/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Star, Clock, Eye, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SharedNavbar from "@/components/shared/navbar";
import SharedFooter from "@/components/shared/footer";
import SmartImage from "@/components/shared/SmartImage";

const Library = ({ initialBooks = [] }: { initialBooks: any[] }) => {
  const books = useMemo(() => {
    return initialBooks.map((b) => ({
      ...b,
      category: b.category?.name || b.categoryId || "Uncategorized",
    }));
  }, [initialBooks]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("সব");
  const [activeSub, setActiveSub] = useState("সব");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = useMemo(() => ["সব", ...Array.from(new Set(books.map((b) => b.category)))], [books]);
  const subcategories = useMemo(() => {
    const inCat = activeCategory === "সব" ? books : books.filter((b) => b.category === activeCategory);
    return ["সব", ...Array.from(new Set(inCat.map((b) => b.subcategory)))];
  }, [books, activeCategory]);

  const filtered = books.filter((book) => {
    const matchSearch = !search || book.title.includes(search) || book.author.includes(search) || book.description.includes(search);
    const matchCat = activeCategory === "সব" || book.category === activeCategory;
    const matchSub = activeSub === "সব" || book.subcategory === activeSub;
    return matchSearch && matchCat && matchSub;
  });

  return (
    <div className="min-h-screen bg-background">
      <SharedNavbar showAuth showDashboard />

      <section className="bg-gradient-hero text-primary-foreground py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5 text-sm mb-4">
              <BookOpen className="h-4 w-4" />
              <span>ডিজিটাল লাইব্রেরি</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-3">ই-বুক ও জীবনী সংগ্রহ</h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto text-sm sm:text-base">
              ইসলামিক জ্ঞানের বিশাল ভাণ্ডার — তাফসীর, হাদিস, ফিকহ, সীরাত ও আরও অনেক কিছু
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="বই খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border bg-card text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-10 w-10 rounded-xl" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-10 w-10 rounded-xl" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm"
              className="rounded-full text-xs whitespace-nowrap"
              onClick={() => { setActiveCategory(cat); setActiveSub("সব"); }}>
              {cat}
            </Button>
          ))}
        </div>

        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {subcategories.map((sub) => (
            <Button key={sub} variant={activeSub === sub ? "secondary" : "ghost"} size="sm"
              className="rounded-full text-[10px] sm:text-xs h-7 whitespace-nowrap"
              onClick={() => setActiveSub(sub)}>
              {sub}
            </Button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filtered.length}টি বই পাওয়া গেছে</p>

        {viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((book) => (
                <motion.div key={book.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <Link to={`/library/${book.id}`} className="group block">
                    <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-[3/4] overflow-hidden">
                        <SmartImage src={book.cover} alt={book.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 mb-1">{book.title}</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">{book.author}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <span className="text-[10px] sm:text-xs font-medium">{book.rating}</span>
                          </div>
                          <Badge variant={book.isFree ? "default" : "secondary"} className="text-[9px] h-4">
                            {book.isFree ? "ফ্রি" : "প্রিমিয়াম"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {viewMode === "list" && (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((book) => (
                <motion.div key={book.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Link to={`/library/${book.id}`} className="flex gap-4 p-3 sm:p-4 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-lg transition-shadow">
                    <SmartImage src={book.cover} alt={book.title} loading="lazy" className="w-20 sm:w-24 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-1">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 hidden sm:block">{book.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-accent text-accent" />{book.rating}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{book.readers.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{book.pages} পৃষ্ঠা</span>
                        <Badge variant={book.isFree ? "default" : "secondary"} className="text-[9px] h-4">
                          {book.isFree ? "ফ্রি" : "প্রিমিয়াম"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">কোনো বই পাওয়া যায়নি</h3>
            <p className="text-sm text-muted-foreground mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন</p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={() => { setSearch(""); setActiveCategory("সব"); setActiveSub("সব"); }}>
              ফিল্টার রিসেট করুন
            </Button>
          </div>
        )}
      </div>
      <SharedFooter />
    </div>
  );
};

export default Library;

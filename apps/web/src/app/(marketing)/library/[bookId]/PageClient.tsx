"use client";

import { useState, useMemo } from "react";
import { Link } from "@/lib/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Star, Clock, User, Eye, ChevronLeft, ChevronRight, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SharedNavbar from "@/components/shared/navbar";

const BookReader = ({ initialBook }: { initialBook: any }) => {
  const book = useMemo(() => {
    if (!initialBook) return null;
    return {
      ...initialBook,
      category: initialBook.category?.name || initialBook.categoryId || "Uncategorized",
    };
  }, [initialBook]);

  const [activeChapter, setActiveChapter] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [isReading, setIsReading] = useState(false);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold mb-4">বই পাওয়া যায়নি</h1>
          <Link to="/library"><Button>লাইব্রেরিতে ফিরুন</Button></Link>
        </div>
      </div>
    );
  }

  // Book detail view
  if (!isReading) {
    return (
      <div className="min-h-screen bg-background">
        <SharedNavbar backTo="/library" backLabel="লাইব্রেরি" showAuth showDashboard />

        {/* Hero Banner */}
        <div className="bg-gradient-hero text-primary-foreground">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="shrink-0 mx-auto sm:mx-0"
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-40 sm:w-52 rounded-2xl shadow-2xl"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center sm:text-left"
              >
                <Badge className="mb-3 bg-primary-foreground/15 text-primary-foreground border-0">
                  {book.category} · {book.subcategory}
                </Badge>
                <h1 className="text-xl sm:text-3xl font-bold mb-2">{book.title}</h1>
                <p className="text-primary-foreground/70 text-sm mb-4">{book.author}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-primary-foreground/80 mb-6">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" />{book.rating}</span>
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{book.readers.toLocaleString()} পাঠক</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{book.pages} পৃষ্ঠা</span>
                  <span>{book.language}</span>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  <Button
                    onClick={() => setIsReading(true)}
                    className="rounded-xl font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  >
                    <BookOpen className="mr-2 h-4 w-4" /> পড়া শুরু করুন
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">বইয়ের বিবরণ</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-3">সূচিপত্র</h2>
                <div className="space-y-2">
                  {book.chapters.map((ch, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveChapter(i); setIsReading(true); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary border border-transparent hover:border-border/50 transition-colors text-left"
                    >
                      <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium">{ch.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-card border border-border/50 shadow-card p-4 space-y-3">
                <h3 className="font-semibold text-sm">বইয়ের তথ্য</h3>
                {[
                  { label: "লেখক", value: book.author },
                  { label: "ক্যাটাগরি", value: `${book.category} · ${book.subcategory}` },
                  { label: "পৃষ্ঠা সংখ্যা", value: `${book.pages} পৃষ্ঠা` },
                  { label: "ভাষা", value: book.language },
                  { label: "প্রকাশকাল", value: book.publishDate },
                  { label: "মূল্য", value: book.isFree ? "ফ্রি" : "প্রিমিয়াম" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reading Mode
  const chapter = book.chapters[activeChapter];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Reader Header */}
      <header className="sticky top-0 z-40 h-12 sm:h-14 flex items-center justify-between border-b px-4 glass">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsReading(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-medium truncate max-w-[200px] sm:max-w-none">{book.title}</div>
            <div className="text-[10px] text-muted-foreground">অধ্যায় {activeChapter + 1} / {book.chapters.length}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowToc(!showToc)}>
          <List className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex flex-1 relative">
        {/* TOC Sidebar */}
        <AnimatePresence>
          {showToc && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute sm:relative z-30 w-72 h-full bg-card border-r shadow-lg sm:shadow-none"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-sm">সূচিপত্র</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:hidden" onClick={() => setShowToc(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
                {book.chapters.map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveChapter(i); setShowToc(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      i === activeChapter ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="text-xs w-5 shrink-0">{i + 1}.</span>
                    <span className="truncate">{ch.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reader Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.article
              key={activeChapter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto px-5 sm:px-8 py-8 sm:py-12"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-primary">{chapter.title}</h2>
              {chapter.image && (
                <img
                  src={chapter.image}
                  alt={chapter.title}
                  className="w-full rounded-xl border border-border/50 mb-6 object-cover max-h-80"
                />
              )}
              <div className="prose prose-sm sm:prose-base max-w-none">
                {chapter.content.split("\n\n").map((para, i) => (
                  <p key={i} className="text-sm sm:text-base leading-relaxed text-foreground/90 mb-4 whitespace-pre-line">
                    {para}
                  </p>
                ))}
              </div>
            </motion.article>
          </AnimatePresence>

          {/* Navigation */}
          <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-8 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={activeChapter === 0}
              onClick={() => setActiveChapter((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> পূর্ববর্তী
            </Button>
            <span className="text-xs text-muted-foreground">
              {activeChapter + 1} / {book.chapters.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={activeChapter === book.chapters.length - 1}
              onClick={() => setActiveChapter((p) => p + 1)}
            >
              পরবর্তী <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReader;

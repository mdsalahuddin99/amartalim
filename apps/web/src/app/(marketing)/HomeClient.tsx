"use client";

import { Link } from "@/lib/navigation";
import SharedNavbar from "@/components/shared/navbar";
import SharedFooter from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Library, HelpCircle, ArrowRight, BookMarked, Code, Users, Sparkles, MessageCircleQuestion, Star, Quote } from "lucide-react";
import SmartImage from "@/components/shared/SmartImage";
import type { ManagedBlogPost } from "@/types/blog";
import { motion } from "framer-motion";
import type { HomepageContent } from "@/server/queries/homepage.queries";

export interface HomeClientProps {
  posts: ManagedBlogPost[];
  categories: any[];
  homepageContent: HomepageContent;
  qaPosts: any[];
  courseCategories?: any[];
  libraryBooks?: { id: string; title: string; cover: string | null; slug: string }[];
  totalLibraryBooks?: number;
}

const Index = ({ posts = [], categories = [], homepageContent, qaPosts = [], courseCategories = [], libraryBooks = [], totalLibraryBooks = 0 }: HomeClientProps) => {
  // Use dynamic content from DB, fallback to hardcoded if missing for some reason
  const heroContent = homepageContent?.hero || {
    badge: "দেশের অন্যতম সেরা ইসলামিক লার্নিং প্ল্যাটফর্ম",
    titleLine1: "আরবী ভাষা ও ইসলাম শিক্ষার",
    titleLine2: "পাশাপাশি আধুনিক স্কিল",
    titleSuffix: "শিখুন",
    description: "কুরআন সুন্নাহর আলোকে জীবন গড়ার পাশাপাশি আধুনিক প্রযুক্তিতে নিজেকে দক্ষ করে তুলতে আমাদের সাথে যুক্ত হোন। ঘরে বসেই শুরু করুন আপনার নতুন স্কিল শেখার যাত্রা।",
    statsText: "১০,০০০+ শিক্ষার্থীর ভরসা"
  };

  return (
    <div className="min-h-screen bg-background">
      <SharedNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-12 pb-12 md:pt-20 md:pb-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-[radial-gradient(#80808020_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text and Actions */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20">
                <Sparkles className="h-4 w-4" />
                <span>{heroContent.badge}</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif-bn tracking-tight leading-[1.2] text-foreground mb-6">
                {heroContent.titleLine1} <br className="hidden lg:block"/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                  {heroContent.titleLine2}
                </span> {heroContent.titleSuffix}
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                {heroContent.description}
              </p>
              
              {/* Search or CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                <Link to="/courses" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full rounded-full text-base px-8 h-14 shadow-lg shadow-primary/25 hover:scale-105 transition-all duration-300">
                    কোর্সসমূহ খুঁজুন <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/blogs" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full rounded-full text-base px-8 h-14 hover:bg-secondary/80 border-border/50">
                    ব্লগ পড়ুন
                  </Button>
                </Link>
              </div>
              
              {/* Trust Indicators / Stats */}
              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-yellow-500 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-foreground">{heroContent.statsText}</p>
                </div>
              </div>
            </motion.div>
            
            {/* Right Column: Visual / Graphic */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square w-full max-w-lg mx-auto">
                {heroContent.image ? (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] rounded-[2.5rem] border border-primary/20 overflow-hidden shadow-2xl">
                    <SmartImage 
                      src={heroContent.image} 
                      alt="Learniverse Hero" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-primary/5 rounded-[2.5rem] border border-primary/20 backdrop-blur-3xl flex items-center justify-center p-8">
                    <div className="w-full h-full border border-dashed border-primary/30 rounded-[1.5rem] flex flex-col items-center justify-center text-primary/40 bg-background/50">
                       <GraduationCap className="h-20 w-20 mb-4" />
                       <p className="font-serif-bn text-3xl font-bold">Learniverse</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* Counters Section */}
      {homepageContent?.counters?.enabled && homepageContent.counters.items && homepageContent.counters.items.length > 0 && (
        <section className="relative z-20 pb-12 md:pb-16 -mt-6 md:-mt-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-background/95 backdrop-blur-md border border-border/50 shadow-md rounded-2xl p-4 md:p-5">
              {(homepageContent.counters.title || homepageContent.counters.subtitle) && (
                <div className="text-center mb-4">
                  {homepageContent.counters.title && (
                    <h2 className="text-lg md:text-xl font-bold font-serif-bn text-foreground/90">{homepageContent.counters.title}</h2>
                  )}
                  {homepageContent.counters.subtitle && (
                    <p className="text-muted-foreground text-xs md:text-sm mt-0.5">{homepageContent.counters.subtitle}</p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 divide-x-0 md:divide-x divide-border/50">
                {homepageContent.counters.items.map((item, i) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex flex-col items-center justify-center text-center px-2 py-1"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xl flex items-center justify-center">{item.icon || "✨"}</div>
                      <div className="text-xl md:text-2xl font-bold font-serif-bn text-primary">
                        {item.value}{item.suffix || "+"}
                      </div>
                    </div>
                    <div className="text-muted-foreground text-xs font-medium">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Overview */}
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-serif-bn mb-4">{homepageContent?.features?.title || "আমাদের সেবাসমূহ"}</h2>
            <p className="text-muted-foreground text-lg">{homepageContent?.features?.subtitle || "এক নজরে আমাদের প্ল্যাটফর্মের মূল ফিচারগুলো, যা আপনাকে দ্বীন ও দুনিয়ার সমন্বয়ে গড়ে উঠতে সাহায্য করবে"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<BookOpen className="h-7 w-7 text-primary" />}
              title="ইসলামিক ও আরবী জ্ঞান"
              description="কুরআন, সুন্নাহ এবং আরবী ভাষা ভিত্তিক প্রবন্ধ ও কোর্সসমূহ যা আপনাকে দ্বীনের পথে এগিয়ে নিবে।"
              link="/blogs?cat=islamic"
              color="bg-primary/10"
            />
            <FeatureCard 
              icon={<Code className="h-7 w-7 text-blue-600" />}
              title="টেকনোলজি ও স্কিল"
              description="ফ্রিল্যান্সিং, প্রোগ্রামিং এবং আধুনিক প্রযুক্তিতে নিজেকে দক্ষ করার সেরা সব রিসোর্স ও গাইডলাইন।"
              link="/courses"
              color="bg-blue-600/10"
            />
            <FeatureCard 
              icon={<Library className="h-7 w-7 text-amber-500" />}
              title="সমৃদ্ধ লাইব্রেরি"
              description="প্রয়োজনীয় ইসলামিক, আত্মোন্নয়ন ও প্রযুক্তি বিষয়ক বই এবং পিডিএফ এর বিশাল কালেকশন।"
              link="/library"
              color="bg-amber-500/10"
            />
            <FeatureCard 
              icon={<HelpCircle className="h-7 w-7 text-emerald-500" />}
              title="আপনার জিজ্ঞাসা"
              description="দৈনন্দিন জীবনের বিভিন্ন মাসআলা ও সমাধান জানার নির্ভরযোগ্য একটি প্রশ্নোত্তর প্ল্যাটফর্ম।"
              link="/qa"
              color="bg-emerald-500/10"
            />
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      {courseCategories && courseCategories.length > 0 && (
        <section className="py-12 md:py-16 bg-background border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 font-medium text-sm mb-4 border border-blue-500/20">
                  <BookOpen className="h-4 w-4" />
                  <span>কোর্স ক্যাটাগরি</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-serif-bn mb-4">{homepageContent?.courseCategoriesSection?.title || "জনপ্রিয় কোর্স ক্যাটাগরি"}</h2>
                <p className="text-muted-foreground text-lg">{homepageContent?.courseCategoriesSection?.subtitle || "আপনার পছন্দের বিষয় বেছে নিয়ে আজই শুরু করুন নতুন কিছু শেখা"}</p>
              </div>
              <Link to="/courses" className="hidden md:inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 rounded-full">
                সব কোর্স দেখুন <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {courseCategories.map((category) => (
                <Link key={category.id} to={`/courses?category=${category.slug}`} className="group block h-full">
                  <div className="bg-card rounded-3xl border border-border/50 overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    <div className="aspect-[4/3] bg-secondary/30 relative overflow-hidden">
                      {category.image ? (
                        <SmartImage src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-500/5 text-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                          <BookOpen className="w-16 h-16" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur text-foreground border-none font-medium">
                          {category._count?.courses || 0} টি কোর্স
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center text-center">
                      <h3 className="font-bold text-lg font-serif-bn group-hover:text-blue-600 transition-colors">{category.name}</h3>
                      {category.description && (
                        <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{category.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <Link to="/courses">
                <Button variant="outline" className="w-full rounded-full h-12 border-blue-500/20 text-blue-600 hover:bg-blue-500/5">সব কোর্স দেখুন <ArrowRight className="ml-2 h-4 w-4"/></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon Courses */}
      <section className="py-12 md:py-16 bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-background rounded-[3rem] border border-border/50 shadow-xl overflow-hidden relative p-8 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-blue-500/10 pointer-events-none"></div>
            
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-6 relative">
              <span className="animate-ping absolute inset-0 rounded-full bg-primary/30"></span>
              <GraduationCap className="h-10 w-10 relative z-10" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold font-serif-bn mb-6">{homepageContent?.comingSoon?.title || "শিগগিরই আসছে আমাদের চমৎকার কিছু কোর্স!"}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              {homepageContent?.comingSoon?.subtitle || "আমরা কাজ করে যাচ্ছি আপনাদের জন্য যুগোপযোগী এবং মানসম্মত কিছু প্রিমিয়াম কোর্স নিয়ে আসার। ওয়েব ডেভেলপমেন্ট, ফ্রিল্যান্সিং, কুরআন শিক্ষা সহ আরো অনেক কোর্স খুব শীঘ্রই লঞ্চ হতে যাচ্ছে।"}
            </p>
            
            <Link to="/register">
              <Button size="lg" className="rounded-full text-base px-10 h-14 shadow-lg shadow-primary/25 hover:scale-105 transition-all duration-300">
                আমাদের সাথে যুক্ত থাকুন <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Islamic QA Preview Section */}
      <section className="py-12 md:py-16 bg-background border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium text-sm mb-4 border border-emerald-500/20">
                <MessageCircleQuestion className="h-4 w-4" />
                <span>আপনার জিজ্ঞাসা</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-serif-bn mb-4">{homepageContent?.qa?.title || "সাম্প্রতিক প্রশ্ন ও উত্তর"}</h2>
              <p className="text-muted-foreground text-lg">{homepageContent?.qa?.subtitle || "আমাদের অভিজ্ঞ মুফতি সাহেবদের থেকে আপনার দৈনন্দিন জীবনের বিভিন্ন মাসআলা ও সমাধান জেনে নিন।"}</p>
            </div>
            <Link to="/qa" className="hidden md:inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 rounded-full">
              প্রশ্ন করুন <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {qaPosts.length > 0 ? (
              qaPosts.map((qa) => (
                <Link key={qa.id} to={`/qa/${qa.slug}`} className="block group">
                  <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 font-serif-bn font-bold text-xl text-emerald-600">
                        প্রঃ
                      </div>
                      <h3 className="font-bold text-lg leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {qa.question}
                      </h3>
                    </div>
                    {qa.answer && (
                      <div className="ml-14 flex-1">
                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                          {/* Strip HTML tags safely for preview */}
                          {qa.answer.replace(/<[^>]*>?/gm, '')}
                        </p>
                      </div>
                    )}
                    <div className="ml-14 mt-4 flex items-center gap-3 pt-4 border-t border-border/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" /> 
                        <span>{qa.mufti?.name || "মুফতি সাহেব"}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-border"></div>
                      <div className="text-xs text-muted-foreground">
                        {qa.category?.name || "সাধারণ"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-muted-foreground bg-secondary/20 rounded-3xl border border-dashed border-border">
                এখনো কোনো প্রশ্নোত্তর প্রকাশিত হয়নি। আপনিই প্রথম প্রশ্ন করতে পারেন!
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/qa">
              <Button variant="outline" className="w-full rounded-full h-12 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5">প্রশ্ন করুন <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Library Preview */}
      <section className="py-8 md:py-12 bg-background border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-2xl mb-8">
                <BookMarked className="h-10 w-10 text-amber-500" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-serif-bn mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: (homepageContent?.library?.title || "সমৃদ্ধ ই-লাইব্রেরি <br/>অফুরন্ত জ্ঞানের ভাণ্ডার").replace(/<br\s*\/?>/gi, "<br/>") }}></h2>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                {homepageContent?.library?.subtitle || "আমাদের লাইব্রেরিতে রয়েছে কুরআন তিলাওয়াত, তাফসির, হাদিস, ফিকহ, ইসলামী সাহিত্য এবং টেকনোলজি রিলেটেড হাজারো পিডিএফ বইয়ের সমাহার। জ্ঞান অন্বেষণে এখনই ব্রাউজ করুন আমাদের কালেকশন।"}
              </p>
              <Link to="/library">
                <Button size="lg" className="rounded-full h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20">
                  লাইব্রেরি ভিজিট করুন <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="w-full lg:w-5/12 relative max-w-[420px] mx-auto lg:mx-0 lg:ml-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-[3rem] -z-10 rotate-3 scale-105"></div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-background border border-border/50 rounded-[2.5rem] shadow-xl">
                <div className="space-y-4">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-sm relative group bg-muted">
                    {libraryBooks[0] ? (
                      <>
                        <SmartImage src={libraryBooks[0].cover || ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={libraryBooks[0].title} />
                        <Link to={`/library/${libraryBooks[0].slug}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm" className="rounded-full font-bold">পড়ুন</Button>
                        </Link>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-hero" />
                    )}
                  </div>
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-sm relative group bg-muted">
                    {libraryBooks[2] ? (
                      <>
                        <SmartImage src={libraryBooks[2].cover || ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={libraryBooks[2].title} />
                        <Link to={`/library/${libraryBooks[2].slug}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm" className="rounded-full font-bold">পড়ুন</Button>
                        </Link>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-hero" />
                    )}
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-sm relative group bg-muted">
                    {libraryBooks[1] ? (
                      <>
                        <SmartImage src={libraryBooks[1].cover || ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={libraryBooks[1].title} />
                        <Link to={`/library/${libraryBooks[1].slug}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm" className="rounded-full font-bold">পড়ুন</Button>
                        </Link>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-hero" />
                    )}
                  </div>
                  <div className="p-6 bg-secondary/30 rounded-2xl flex flex-col items-center justify-center text-center aspect-[3/4] border border-border/50 hover:bg-secondary/50 transition-colors">
                    <span className="text-4xl font-bold font-serif-bn text-foreground mb-2">
                      {totalLibraryBooks > 0 ? `${totalLibraryBooks > 500 ? '৫০০+' : totalLibraryBooks}` : '৫০০+'}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">পিডিএফ বই ও রিসোর্স</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-12 md:py-16 bg-secondary/5 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold font-serif-bn mb-4">{homepageContent?.blogs?.title || "সর্বশেষ ব্লগসমূহ"}</h2>
              <p className="text-muted-foreground text-lg">{homepageContent?.blogs?.subtitle || "নতুন প্রকাশিত প্রবন্ধ ও আর্টিকেলগুলো পড়ুন এবং জ্ঞান অর্জন করুন"}</p>
            </div>
            <Link to="/blogs" className="hidden md:inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 rounded-full">
              সব ব্লগ দেখুন <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length > 0 ? posts.slice(0, 3).map(post => (
              <div key={post.id} className="bg-background rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col">
                <Link to={`/blogs/${post.slug}`} className="block aspect-[16/10] overflow-hidden relative">
                  <SmartImage src={post.cover || ""} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground font-medium">
                    <span className="px-2 py-1 bg-secondary rounded-md">{post.categoryName || "Uncategorized"}</span>
                  </div>
                  <Link to={`/blogs/${post.slug}`} className="block mb-3">
                    <h3 className="text-xl font-bold font-serif-bn leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  <Link to={`/blogs/${post.slug}`} className="inline-flex items-center text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                    পড়া চালিয়ে যান <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground bg-background rounded-2xl border border-dashed">
                এখনো কোন পোস্ট প্রকাশিত হয়নি
              </div>
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/blogs">
              <Button variant="outline" className="w-full rounded-full h-12">সব ব্লগ দেখুন <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {homepageContent?.testimonials?.enabled && homepageContent.testimonials.items.length > 0 && (
        <section className="py-12 md:py-16 bg-background border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-serif-bn mb-4">{homepageContent.testimonials.title || "শিক্ষার্থীদের মতামত"}</h2>
              <p className="text-muted-foreground text-lg">{homepageContent.testimonials.subtitle || "আমাদের প্ল্যাটফর্ম সম্পর্কে সাধারণ শিক্ষার্থী এবং ব্যবহারকারীদের অভিজ্ঞতা জানুন"}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homepageContent.testimonials.items.slice(0, 3).map((testimonial) => (
                <div key={testimonial.id} className="bg-secondary/20 p-8 rounded-3xl border border-border/50 relative">
                  <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10 rotate-180" />
                  <div className="flex items-center gap-1 text-yellow-500 mb-6">
                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-8 relative z-10 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                      ) : (
                        testimonial.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                      {testimonial.role && (
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950 z-0"></div>
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 z-0"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 z-0"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif-bn mb-6 text-white leading-tight" dangerouslySetInnerHTML={{ __html: (homepageContent?.cta?.title || "জ্ঞানের এই যাত্রায় <br className=\"hidden md:block\"/>আমাদের সাথেই থাকুন").replace(/<br\s*\/?>/gi, "<br className=\"hidden md:block\"/>") }}></h2>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            {homepageContent?.cta?.subtitle || "ফ্রি একাউন্ট তৈরি করে কোর্সে এনরোল করুন, প্রশ্ন করুন এবং লাইব্রেরি থেকে প্রয়োজনীয় বই ডাউনলোড করুন। আজই শুরু করুন আপনার নতুন যাত্রা।"}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="rounded-full text-base px-8 h-14 w-full sm:w-auto font-bold text-primary-foreground shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90">
                রেজিস্ট্রেশন করুন <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-14 w-full sm:w-auto border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                লগইন করুন
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
};

export default Index;

// Small subcomponents for cleaner code
function FeatureCard({ icon, title, description, link, color }: { icon: React.ReactNode, title: string, description: string, link: string, color: string }) {
  return (
    <Link to={link} className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full">
      <div className={`h-16 w-16 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold font-serif-bn mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{description}</p>
      <div className="inline-flex items-center text-sm font-semibold text-foreground group-hover:text-primary transition-colors mt-auto">
        বিস্তারিত <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

"use client";
import { useEffect, useState } from "react";
import { getAdminHomepageContent, saveHomepageContent } from "@/server/actions/homepage.actions";

/**
 * Homepage content store — dynamic blocks editable from /admin/homepage.
 * Persists to localStorage via the shared driver (no Lovable Cloud).
 */

export interface CounterItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  icon?: string; // emoji
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string; // emoji
  href: string;
  count?: number;
  color?: string; // tailwind bg class like 'bg-primary/10'
}

export interface TestimonialItem {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  quote: string;
  rating?: number; // 1-5
}

export interface PartnerItem {
  id: string;
  name: string;
  logoUrl?: string; // optional, falls back to text
  href?: string;
}

export interface HomepageContent {
  hero?: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleSuffix: string;
    description: string;
    statsText: string;
    image?: string;
  };
  features?: { title: string; subtitle: string; };
  courseCategoriesSection?: { title: string; subtitle: string; };
  comingSoon?: { title: string; subtitle: string; };
  qa?: { title: string; subtitle: string; };
  library?: { title: string; subtitle: string; };
  blogs?: { title: string; subtitle: string; };
  cta?: { title: string; subtitle: string; };
  
  counters: { enabled: boolean; title?: string; subtitle?: string; items: CounterItem[] };
  categories: { enabled: boolean; title?: string; subtitle?: string; items: CategoryItem[] };
  testimonials: { enabled: boolean; title?: string; subtitle?: string; items: TestimonialItem[] };
  partners: { enabled: boolean; title?: string; subtitle?: string; items: PartnerItem[] };
}

const RES = "homepage-content";

const DEFAULTS: HomepageContent = {
  hero: {
    badge: "দেশের অন্যতম সেরা ইসলামিক লার্নিং প্ল্যাটফর্ম",
    titleLine1: "আরবী ভাষা ও ইসলাম শিক্ষার",
    titleLine2: "পাশাপাশি আধুনিক স্কিল",
    titleSuffix: "শিখুন",
    description: "কুরআন সুন্নাহর আলোকে জীবন গড়ার পাশাপাশি আধুনিক প্রযুক্তিতে নিজেকে দক্ষ করে তুলতে আমাদের সাথে যুক্ত হোন। ঘরে বসেই শুরু করুন আপনার নতুন স্কিল শেখার যাত্রা।",
    statsText: "১০,০০০+ শিক্ষার্থীর ভরসা",
    image: ""
  },
  features: { title: "আমাদের সেবাসমূহ", subtitle: "এক নজরে আমাদের প্ল্যাটফর্মের মূল ফিচারগুলো, যা আপনাকে দ্বীন ও দুনিয়ার সমন্বয়ে গড়ে উঠতে সাহায্য করবে" },
  courseCategoriesSection: { title: "জনপ্রিয় কোর্স ক্যাটাগরি", subtitle: "আপনার পছন্দের বিষয় বেছে নিয়ে আজই শুরু করুন নতুন কিছু শেখা" },
  comingSoon: { title: "শিগগিরই আসছে আমাদের চমৎকার কিছু কোর্স!", subtitle: "আমরা কাজ করে যাচ্ছি আপনাদের জন্য যুগোপযোগী এবং মানসম্মত কিছু প্রিমিয়াম কোর্স নিয়ে আসার। ওয়েব ডেভেলপমেন্ট, ফ্রিল্যান্সিং, কুরআন শিক্ষা সহ আরো অনেক কোর্স খুব শীঘ্রই লঞ্চ হতে যাচ্ছে।" },
  qa: { title: "সাম্প্রতিক প্রশ্ন ও উত্তর", subtitle: "আমাদের অভিজ্ঞ মুফতি সাহেবদের থেকে আপনার দৈনন্দিন জীবনের বিভিন্ন মাসআলা ও সমাধান জেনে নিন।" },
  library: { title: "সমৃদ্ধ ই-লাইব্রেরি অফুরন্ত জ্ঞানের ভাণ্ডার", subtitle: "আমাদের লাইব্রেরিতে রয়েছে কুরআন তিলাওয়াত, তাফসির, হাদিস, ফিকহ, ইসলামী সাহিত্য এবং টেকনোলজি রিলেটেড হাজারো পিডিএফ বইয়ের সমাহার। জ্ঞান অন্বেষণে এখনই ব্রাউজ করুন আমাদের কালেকশন।" },
  blogs: { title: "সর্বশেষ ব্লগসমূহ", subtitle: "নতুন প্রকাশিত প্রবন্ধ ও আর্টিকেলগুলো পড়ুন এবং জ্ঞান অর্জন করুন" },
  cta: { title: "জ্ঞানের এই যাত্রায় আমাদের সাথেই থাকুন", subtitle: "ফ্রি একাউন্ট তৈরি করে কোর্সে এনরোল করুন, প্রশ্ন করুন এবং লাইব্রেরি থেকে প্রয়োজনীয় বই ডাউনলোড করুন। আজই শুরু করুন আপনার নতুন যাত্রা।" },
  counters: {
    enabled: true,
    title: "আমাদের যাত্রায় আপনিও যুক্ত হোন",
    items: [
      { id: "c1", label: "শিক্ষার্থী", value: 12500, suffix: "+", icon: "🎓" },
      { id: "c2", label: "কোর্স", value: 120, suffix: "+", icon: "📚" },
      { id: "c3", label: "শিক্ষক", value: 45, suffix: "+", icon: "👨‍🏫" },
      { id: "c4", label: "সার্টিফিকেট", value: 8700, suffix: "+", icon: "🏅" },
    ],
  },
  categories: {
    enabled: true,
    title: "জনপ্রিয় বিভাগসমূহ",
    items: [
      { id: "k1", name: "আরবী ভাষা", icon: "📖", href: "/courses?cat=arabic", count: 24 },
      { id: "k2", name: "কুরআন শিক্ষা", icon: "🕋", href: "/courses?cat=quran", count: 18 },
      { id: "k3", name: "ইসলামিক স্টাডিজ", icon: "🌙", href: "/courses?cat=islamic", count: 32 },
      { id: "k4", name: "AI ও প্রযুক্তি", icon: "🤖", href: "/courses?cat=ai", count: 14 },
      { id: "k5", name: "ফ্রিল্যান্সিং", icon: "💼", href: "/courses?cat=freelancing", count: 21 },
      { id: "k6", name: "ক্যারিয়ার", icon: "🎯", href: "/courses?cat=career", count: 16 },
      { id: "k7", name: "ডিজিটাল মার্কেটিং", icon: "📈", href: "/courses?cat=marketing", count: 12 },
      { id: "k8", name: "ই-বুক লাইব্রেরি", icon: "📚", href: "/library", count: 80 },
    ],
  },
  testimonials: {
    enabled: true,
    title: "শিক্ষার্থীদের মতামত",
    items: [
      {
        id: "t1",
        name: "মুহাম্মাদ আব্দুল্লাহ",
        role: "ছাত্র, ঢাকা",
        quote: "আমার তা'লীমের আরবী কোর্স আমার শেখার পথকে অনেক সহজ করে দিয়েছে। শিক্ষকদের পদ্ধতি অসাধারণ।",
        rating: 5,
      },
      {
        id: "t2",
        name: "ইউসুফ রহমান",
        role: "ফ্রিল্যান্সার",
        quote: "ফ্রিল্যান্সিং কোর্সটি ১০০% প্র্যাকটিক্যাল। প্রথম ক্লায়েন্ট পেতে আমাকে খুব বেশি সময় লাগেনি।",
        rating: 5,
      },
      {
        id: "t3",
        name: "আব্দুর রহমান",
        role: "ইমাম ও শিক্ষক",
        quote: "কুরআন শিক্ষার পদ্ধতি অসাধারণ। তাজভীদসহ সম্পূর্ণ গাইডলাইন পেয়েছি।",
        rating: 5,
      },
      {
        id: "t4",
        name: "হাসান আলী",
        role: "শিক্ষার্থী",
        quote: "AI ও প্রযুক্তি কোর্সে অনেক নতুন কিছু শিখেছি। বাংলায় এত ভাল কনটেন্ট সত্যিই দুর্লভ।",
        rating: 5,
      },
    ],
  },
  partners: {
    enabled: true,
    title: "আমাদের পার্টনার",
    items: [
      { id: "p1", name: "Madrasah Online" },
      { id: "p2", name: "Islamic Foundation" },
      { id: "p3", name: "Bangla LMS" },
      { id: "p4", name: "Tech Bangla" },
      { id: "p5", name: "Edu Connect" },
      { id: "p6", name: "Knowledge Hub" },
    ],
  },
};

export const homepageStore = {
  save: async (c: HomepageContent) => {
    await saveHomepageContent(c);
  },
  reset: async () => {
    await saveHomepageContent(DEFAULTS);
  },
};

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageContent>(DEFAULTS);
  
  useEffect(() => {
    getAdminHomepageContent().then((data) => setContent(data));
  }, []);
  
  return { content, setContent };
}

export { DEFAULTS as HOMEPAGE_DEFAULTS };

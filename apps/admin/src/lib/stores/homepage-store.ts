"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";

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
  counters: { enabled: boolean; title?: string; items: CounterItem[] };
  categories: { enabled: boolean; title?: string; items: CategoryItem[] };
  testimonials: { enabled: boolean; title?: string; items: TestimonialItem[] };
  partners: { enabled: boolean; title?: string; items: PartnerItem[] };
}

const RES = "homepage-content";

const DEFAULTS: HomepageContent = {
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

const read = (): HomepageContent => {
  const v = driver.readJson<HomepageContent | null>(RES, null as any);
  if (!v) return DEFAULTS;
  // shallow-merge missing keys with defaults so additions don't break
  return {
    counters: { ...DEFAULTS.counters, ...(v.counters || {}) },
    categories: { ...DEFAULTS.categories, ...(v.categories || {}) },
    testimonials: { ...DEFAULTS.testimonials, ...(v.testimonials || {}) },
    partners: { ...DEFAULTS.partners, ...(v.partners || {}) },
  };
};

export const homepageStore = {
  get: read,
  save: (c: HomepageContent) => {
    void api.put("/homepage", c).catch(() => {});
  },
  reset: () => {
    void api.del("/homepage").catch(() => {});
  },
};

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageContent>(() => read());
  useEffect(() => {
    const refresh = () => setContent(read());
    void api.get<HomepageContent>("/homepage").catch(() => {});
    return driver.subscribe(RES, refresh);
  }, []);
  return content;
}

export { DEFAULTS as HOMEPAGE_DEFAULTS };

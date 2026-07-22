import { prisma } from "../db/prisma";

export interface PricingPlan {
  id: string;
  name: string;
  tagline?: string;
  priceMonthly: number;
  priceYearly: number;
  currency?: string; // default ৳
  features: string[];
  badge?: string;
  highlighted?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  active: boolean;
}

export interface PricingFaq {
  id: string;
  q: string;
  a: string;
}

export interface PricingContent {
  enabled: boolean;
  title: string;
  subtitle: string;
  yearlyDiscountNote?: string;
  plans: PricingPlan[];
  faqs: PricingFaq[];
  guaranteeNote?: string;
}

export const PRICING_DEFAULTS: PricingContent = {
  enabled: true,
  title: "আপনার জন্য সঠিক প্ল্যান বেছে নিন",
  subtitle:
    "মাসিক বা বার্ষিক — আপনার শেখার যাত্রার জন্য সবচেয়ে উপযুক্ত মেম্বারশিপ প্ল্যান। যেকোনো সময় আপগ্রেড বা ক্যান্সেল করতে পারবেন।",
  yearlyDiscountNote: "বার্ষিক প্ল্যানে ২ মাস ফ্রি 🎁",
  guaranteeNote: "৭ দিনের মানি-ব্যাক গ্যারান্টি",
  plans: [
    {
      id: "free",
      name: "ফ্রি",
      tagline: "শুরু করার জন্য পারফেক্ট",
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        "৫টি ফ্রি কোর্সে এক্সেস",
        "সীমিত ই-বুক লাইব্রেরি",
        "বেসিক কুইজ ও সার্টিফিকেট",
        "কমিউনিটি সাপোর্ট",
      ],
      ctaLabel: "ফ্রি শুরু করুন",
      ctaHref: "/register",
      active: true,
    },
    {
      id: "pro",
      name: "প্রো",
      tagline: "সিরিয়াস শিক্ষার্থীদের জন্য",
      priceMonthly: 499,
      priceYearly: 4990,
      badge: "জনপ্রিয়",
      highlighted: true,
      features: [
        "সব প্রিমিয়াম কোর্সে আনলিমিটেড এক্সেস",
        "সম্পূর্ণ ই-বুক লাইব্রেরি",
        "সব কুইজ ও অ্যাসাইনমেন্ট",
        "ভেরিফায়েড সার্টিফিকেট",
        "প্রায়োরিটি সাপোর্ট",
        "নতুন কোর্সে আর্লি এক্সেস",
      ],
      ctaLabel: "প্রো নিন",
      ctaHref: "/checkout/pro",
      active: true,
    },
    {
      id: "lifetime",
      name: "লাইফটাইম",
      tagline: "একবার পেমেন্ট, সারাজীবন এক্সেস",
      priceMonthly: 0,
      priceYearly: 14990,
      badge: "সেরা ভ্যালু",
      features: [
        "প্রো প্ল্যানের সব ফিচার",
        "ভবিষ্যতের সব কোর্স ফ্রি",
        "১-অন-১ মেন্টরশিপ সেশন",
        "এক্সক্লুসিভ মাস্টারক্লাস",
        "লাইফটাইম আপডেট",
      ],
      ctaLabel: "লাইফটাইম নিন",
      ctaHref: "/checkout/lifetime",
      active: true,
    },
  ],
  faqs: [
    {
      id: "f1",
      q: "আমি কি যেকোনো সময় ক্যান্সেল করতে পারব?",
      a: "হ্যাঁ, আপনি যেকোনো সময় আপনার সাবস্ক্রিপশন ক্যান্সেল করতে পারবেন। ক্যান্সেলের পরও মেয়াদ শেষ হওয়া পর্যন্ত এক্সেস থাকবে।",
    },
    {
      id: "f2",
      q: "পেমেন্টের মাধ্যম কী কী?",
      a: "আমরা bKash এবং Nagad সাপোর্ট করি। সব পেমেন্ট ১০০% সিকিউর।",
    },
    {
      id: "f3",
      q: "মানি-ব্যাক গ্যারান্টি কীভাবে কাজ করে?",
      a: "যদি প্রথম ৭ দিনের মধ্যে সন্তুষ্ট না হন, পুরো টাকা ফেরত পাবেন। কোনো প্রশ্ন ছাড়াই।",
    },
    {
      id: "f4",
      q: "একই অ্যাকাউন্ট কি একাধিক ডিভাইসে ব্যবহার করা যাবে?",
      a: "হ্যাঁ, আপনি আপনার ফোন, ট্যাব ও কম্পিউটার — সব জায়গায় একই অ্যাকাউন্টে লগইন করতে পারবেন।",
    },
  ],
};

export const getPricingContent = async (): Promise<PricingContent> => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "pricing-content" },
    });
    if (!setting || !setting.value) {
      return PRICING_DEFAULTS;
    }
    
    const v = setting.value as unknown as PricingContent;
    return { 
      ...PRICING_DEFAULTS, 
      ...v, 
      plans: v.plans ?? PRICING_DEFAULTS.plans, 
      faqs: v.faqs ?? PRICING_DEFAULTS.faqs 
    };
  } catch (error) {
    return PRICING_DEFAULTS;
  }
};

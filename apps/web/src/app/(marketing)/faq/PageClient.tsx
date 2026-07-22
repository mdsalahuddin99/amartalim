"use client";

import PageShell from "@/components/shared/page-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "আমার তালিম কী ধরনের প্ল্যাটফর্ম?",
    a: "আমার তালিম একটি বাংলা ইসলামী শিক্ষা প্ল্যাটফর্ম, যেখানে কোর্স, ই-বুক, ব্লগ ও জীবনী পড়া যায়।",
  },
  {
    q: "কোর্সগুলো কি ফ্রি?",
    a: "কিছু কোর্স সম্পূর্ণ ফ্রি, কিছু কোর্সে নামমাত্র ফি রয়েছে। প্রতিটি কোর্সের পেজে মূল্য উল্লেখ থাকে।",
  },
  {
    q: "পেমেন্ট কীভাবে করব?",
    a: "bKash এবং Nagad-এর মাধ্যমে নিরাপদ পেমেন্ট করতে পারবেন।",
  },
  {
    q: "কোর্স কেনার পর কতদিন অ্যাক্সেস পাব?",
    a: "একবার এনরোল করলে সাধারণত আজীবন অ্যাক্সেস পাবেন। কোর্সভেদে শর্ত আলাদা হতে পারে।",
  },
  {
    q: "সার্টিফিকেট পাওয়া যায়?",
    a: "হ্যাঁ, কোর্সের সব পাঠ ও কুইজ সম্পন্ন করলে স্বয়ংক্রিয়ভাবে ডিজিটাল সার্টিফিকেট ইস্যু হয়।",
  },
  {
    q: "আমি কি শিক্ষক হিসেবে যোগ দিতে পারি?",
    a: "অবশ্যই। 'শিক্ষক হোন' পেজ থেকে আবেদন করুন; আমাদের টিম যাচাই করে যোগাযোগ করবে।",
  },
  {
    q: "ভিডিও ডাউনলোড করা যায়?",
    a: "নিরাপত্তার কারণে ভিডিও ডাউনলোড করার অনুমতি নেই, তবে আজীবন অনলাইনে দেখতে পারবেন।",
  },
];

const FaqPage = () => (
  <PageShell>
    <header className="text-center mb-10">
      <h1 className="text-3xl sm:text-4xl font-serif-bn font-extrabold">প্রশ্নোত্তর</h1>
      <p className="mt-3 text-muted-foreground">
        সচরাচর জিজ্ঞাসিত প্রশ্নসমূহের উত্তর এক জায়গায়।
      </p>
    </header>

    <Accordion type="single" collapsible className="rounded-xl border border-foreground/10 bg-card divide-y divide-foreground/10">
      {FAQS.map((item, i) => (
        <AccordionItem key={i} value={`item-${i}`} className="border-b-0 px-5">
          <AccordionTrigger className="text-left font-serif-bn font-bold text-base hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-foreground/80 leading-relaxed">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </PageShell>
);

export default FaqPage;

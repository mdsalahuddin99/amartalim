"use client";

import PageShell from "@/components/shared/page-shell";

const SECTIONS = [
  {
    title: "১. আমরা কী তথ্য সংগ্রহ করি",
    body: "অ্যাকাউন্ট তৈরির সময় নাম, ইমেইল ও প্রোফাইল ছবি। কোর্স এনরোলমেন্ট ও পেমেন্ট লগ। সাইট ব্যবহারের সাধারণ অ্যানালিটিক্স।",
  },
  {
    title: "২. তথ্য কীভাবে ব্যবহৃত হয়",
    body: "সেবা প্রদান, পেমেন্ট প্রসেসিং, কোর্স অগ্রগতি সংরক্ষণ, এবং প্রয়োজনীয় ইমেইল নোটিফিকেশনের জন্য।",
  },
  {
    title: "৩. তথ্য শেয়ারিং",
    body: "আপনার ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা ভাড়া দেওয়া হয় না। শুধুমাত্র পেমেন্ট গেটওয়ের সাথে প্রয়োজনীয় তথ্য আদান-প্রদান হয়।",
  },
  {
    title: "৪. কুকিজ",
    body: "লগইন সেশন ও পছন্দ মনে রাখতে কুকিজ ব্যবহার করা হয়। ব্রাউজার সেটিংস থেকে যেকোনো সময় বন্ধ করতে পারবেন।",
  },
  {
    title: "৫. ডাটা নিরাপত্তা",
    body: "সকল পাসওয়ার্ড এনক্রিপ্ট করা থাকে। নিয়মিত backup ও SSL/TLS এর মাধ্যমে ডাটা সুরক্ষিত।",
  },
  {
    title: "৬. আপনার অধিকার",
    body: "যেকোনো সময় অ্যাকাউন্ট ডিলিট বা ব্যক্তিগত তথ্য পরিবর্তনের আবেদন করতে পারবেন।",
  },
  {
    title: "৭. যোগাযোগ",
    body: "গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নের জন্য privacy@amartalim.com ঠিকানায় যোগাযোগ করুন।",
  },
];

const PrivacyPage = () => (
  <PageShell>
    <header className="mb-10">
      <h1 className="text-3xl sm:text-4xl font-serif-bn font-extrabold">গোপনীয়তা নীতি</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        সর্বশেষ হালনাগাদ: {new Date().toLocaleDateString("bn-BD")}
      </p>
    </header>

    <div className="space-y-8">
      {SECTIONS.map((s) => (
        <section key={s.title}>
          <h2 className="text-lg font-serif-bn font-bold mb-2">{s.title}</h2>
          <p className="text-foreground/85 leading-loose">{s.body}</p>
        </section>
      ))}
    </div>
  </PageShell>
);

export default PrivacyPage;

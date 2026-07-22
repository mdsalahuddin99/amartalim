"use client";

import PageShell from "@/components/shared/page-shell";

const SECTIONS = [
  {
    title: "১. সেবা গ্রহণ",
    body: "প্ল্যাটফর্ম ব্যবহারের মাধ্যমে আপনি এই শর্তাবলী মেনে নিতে সম্মত হচ্ছেন। ১৩ বছরের কম বয়সীদের অভিভাবকের তত্ত্বাবধান প্রয়োজন।",
  },
  {
    title: "২. অ্যাকাউন্ট দায়িত্ব",
    body: "আপনার লগইন তথ্য গোপন রাখা ও সঠিক প্রোফাইল তথ্য প্রদানের দায়িত্ব আপনার। সন্দেহজনক ব্যবহারের ক্ষেত্রে অ্যাকাউন্ট স্থগিত করা হতে পারে।",
  },
  {
    title: "৩. কন্টেন্ট ব্যবহার",
    body: "সাইটের কোর্স, ভিডিও, ই-বুক ব্যক্তিগত শিক্ষার জন্য। অনুমতি ছাড়া পুনঃপ্রকাশ, ডাউনলোড বা বাণিজ্যিক ব্যবহার নিষিদ্ধ।",
  },
  {
    title: "৪. পেমেন্ট ও রিফান্ড",
    body: "কোর্স ক্রয়ের ৭ দিনের মধ্যে যদি ২৫% এর কম দেখা হয়, তবে রিফান্ড আবেদন গ্রহণযোগ্য। ডিজিটাল প্রোডাক্টের ক্ষেত্রে শর্ত প্রযোজ্য।",
  },
  {
    title: "৫. শিক্ষক ও কন্টেন্ট প্রদানকারী",
    body: "শিক্ষকগণ নিজস্ব কন্টেন্টের মান ও বিশুদ্ধতার জন্য দায়ী। প্ল্যাটফর্ম যাচাইয়ের পর প্রকাশের অধিকার সংরক্ষণ করে।",
  },
  {
    title: "৬. পরিবর্তন",
    body: "শর্তাবলী যেকোনো সময় পরিবর্তিত হতে পারে। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে ইমেইলে অবহিত করা হবে।",
  },
  {
    title: "৭. দায়মুক্তি",
    body: "প্ল্যাটফর্ম সর্বোচ্চ সেবা নিশ্চিতে চেষ্টাশীল, তবে প্রযুক্তিগত ত্রুটির জন্য পরোক্ষ ক্ষতির দায় বহন করে না।",
  },
];

const TermsPage = () => (
  <PageShell>
    <header className="mb-10">
      <h1 className="text-3xl sm:text-4xl font-serif-bn font-extrabold">ব্যবহারের শর্তাবলী</h1>
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

export default TermsPage;

"use client";

import PageShell from "@/components/shared/page-shell";
import { BookOpen, Users, Target, Heart } from "lucide-react";

const PILLARS = [
  {
    icon: BookOpen,
    title: "বিশুদ্ধ জ্ঞান",
    body: "কুরআন ও সহীহ সুন্নাহর আলোকে যাচাইকৃত পাঠ্যক্রম।",
  },
  {
    icon: Users,
    title: "অভিজ্ঞ শিক্ষকমণ্ডলী",
    body: "যোগ্য আলেম ও দক্ষ শিক্ষকদের তত্ত্বাবধানে কোর্স পরিচালনা।",
  },
  {
    icon: Target,
    title: "ব্যবহারিক শিক্ষা",
    body: "প্রতিটি পাঠ বাস্তব জীবনে প্রয়োগযোগ্যভাবে উপস্থাপন।",
  },
  {
    icon: Heart,
    title: "সবার জন্য উন্মুক্ত",
    body: "বয়স বা পেশা নির্বিশেষে সকলের জন্য সহজলভ্য মাধ্যম।",
  },
];

const AboutPage = () => (
  <PageShell>
    <header className="text-center mb-12">
      <p className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-3">
        আমাদের সম্পর্কে
      </p>
      <h1 className="text-3xl sm:text-4xl font-serif-bn font-extrabold text-foreground">
        ইসলামী জ্ঞানকে সবার কাছে পৌঁছে দিতে
      </h1>
      <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        আমার তালিম একটি বাংলা ইসলামী শিক্ষা প্ল্যাটফর্ম, যেখানে কুরআন, হাদীস, ফিকহ
        ও দৈনন্দিন জীবনের প্রয়োজনীয় ইসলামী জ্ঞান সহজ ভাষায় উপস্থাপন করা হয়।
      </p>
    </header>

    <section aria-labelledby="mission" className="mb-14">
      <h2 id="mission" className="text-xl font-serif-bn font-bold mb-3">
        আমাদের লক্ষ্য
      </h2>
      <p className="text-foreground/85 leading-loose">
        প্রতিটি বাংলাভাষী মুসলিমের কাছে বিশুদ্ধ দ্বীনি জ্ঞান পৌঁছে দেওয়া এবং একটি
        নিরাপদ, বিজ্ঞাপনমুক্ত, পরিবার-বান্ধব শেখার পরিবেশ তৈরি করা।
      </p>
    </section>

    <section aria-labelledby="pillars">
      <h2 id="pillars" className="text-xl font-serif-bn font-bold mb-6">
        আমাদের মূলনীতি
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="rounded-xl border border-foreground/10 p-5 bg-card hover:border-primary/40 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-serif-bn font-bold text-base mb-1.5">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
          </article>
        ))}
      </div>
    </section>
  </PageShell>
);

export default AboutPage;

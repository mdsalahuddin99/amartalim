"use client";

import { useMemo, useState } from "react";
import { useParams, Link } from "@/lib/navigation";
import { motion } from "framer-motion";
import {
  Award, Download, ArrowLeft, Share2, Copy, Check, ShieldCheck, Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Course, Lesson } from "@/types/course";
import { useSession } from "@/server/auth/session";

/** Deterministic certificate ID from inputs — same user+lesson always gets same ID. */
const buildCertId = (userId: string, courseId: string, lessonId: string) => {
  const seed = `${userId}-${courseId}-${lessonId}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
  return `AT-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
};

const Certificate = ({ course, lesson }: { course: any; lesson: any }) => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user } = useSession();
  const studentName = user?.name || "শিক্ষার্থী";
  const studentId = user?.id || "USER-0000";
  const [copied, setCopied] = useState(false);

  const today = useMemo(
    () => new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" }),
    [],
  );
  const certId = useMemo(
    () => (courseId && lessonId ? buildCertId(studentId, courseId, lessonId) : ""),
    [courseId, lessonId, studentId],
  );
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${certId}`;

  if (!course || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-4">সার্টিফিকেট পাওয়া যায়নি</h1>
          <Link to="/dashboard"><Button>ড্যাশবোর্ডে ফিরে যান</Button></Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: `${course.title} — Amar Talim সার্টিফিকেট`,
      text: `আমি "${course.title}" কোর্সটি সম্পন্ন করেছি! সার্টিফিকেট নং: ${certId}`,
      url: verifyUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(verifyUrl);
        toast.success("ভেরিফিকেশন লিংক কপি হয়েছে");
      }
    } catch {
      /* user cancelled */
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(certId);
    setCopied(true);
    toast.success("সার্টিফিকেট নং কপি হয়েছে");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      {/* Print-only styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .cert-frame { box-shadow: none !important; page-break-inside: avoid; }
          @page { size: A4 landscape; margin: 12mm; }
        }
      `}</style>

      {/* Action bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="no-print mb-6 grid grid-cols-2 sm:flex gap-2 sm:gap-3 w-full sm:w-auto max-w-2xl"
      >
        <Link to="/dashboard" className="col-span-2 sm:col-auto">
          <Button variant="outline" className="w-full sm:w-auto rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> ড্যাশবোর্ড
          </Button>
        </Link>
        <Button
          className="rounded-xl bg-gradient-hero hover:opacity-90"
          onClick={() => window.print()}
        >
          <Printer className="mr-2 h-4 w-4" /> প্রিন্ট / PDF
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" /> শেয়ার
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={handleCopy}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          ID কপি
        </Button>
      </motion.div>

      {/* Certificate body */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="cert-frame w-full max-w-3xl relative shadow-card rounded-2xl sm:rounded-3xl overflow-hidden bg-card"
      >
        {/* Gradient border */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-hero p-[3px] pointer-events-none">
          <div className="w-full h-full rounded-2xl sm:rounded-3xl bg-card" />
        </div>

        {/* Decorative Islamic-style corner ornaments */}
        <svg
          aria-hidden
          className="absolute top-3 left-3 h-12 w-12 text-primary/30"
          viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M2 32 L32 2 M2 32 L32 62 M2 2 L2 62" />
          <circle cx="14" cy="14" r="3" />
        </svg>
        <svg
          aria-hidden
          className="absolute top-3 right-3 h-12 w-12 text-primary/30 rotate-90"
          viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M2 32 L32 2 M2 32 L32 62 M2 2 L2 62" />
          <circle cx="14" cy="14" r="3" />
        </svg>
        <svg
          aria-hidden
          className="absolute bottom-3 left-3 h-12 w-12 text-primary/30 -rotate-90"
          viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M2 32 L32 2 M2 32 L32 62 M2 2 L2 62" />
          <circle cx="14" cy="14" r="3" />
        </svg>
        <svg
          aria-hidden
          className="absolute bottom-3 right-3 h-12 w-12 text-primary/30 rotate-180"
          viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M2 32 L32 2 M2 32 L32 62 M2 2 L2 62" />
          <circle cx="14" cy="14" r="3" />
        </svg>

        <div className="relative p-8 sm:p-14 text-center">
          {/* Top stars row */}
          <div className="flex justify-center items-center gap-2 mb-5">
            <div className="h-[1px] w-12 bg-border" />
            <div className="text-xs tracking-[0.4em] uppercase text-muted-foreground font-semibold">
              Amar Talim
            </div>
            <div className="h-[1px] w-12 bg-border" />
          </div>

          <p className="text-xs sm:text-sm tracking-[0.4em] uppercase text-muted-foreground font-semibold">
            সমাপ্তির সনদপত্র
          </p>

          {/* Seal */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mt-6">
            <div className="absolute inset-0 rounded-full bg-gradient-hero animate-pulse opacity-20" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg">
              <Award className="h-9 w-9 sm:h-11 sm:w-11 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-lg sm:text-xl font-bold tracking-tight mt-6 text-muted-foreground">
            এই সনদ প্রত্যয়ন করে যে
          </h1>

          <p className="text-3xl sm:text-4xl font-bold text-gradient mt-4 font-serif-bn">
            {studentName}
          </p>
          <div className="h-[2px] w-32 mx-auto bg-gradient-hero mt-3 rounded-full" />

          <p className="text-muted-foreground mt-6 max-w-xl mx-auto text-sm leading-relaxed">
            সফলভাবে <strong className="text-foreground">"{course.title}"</strong> কোর্সের{" "}
            <strong className="text-foreground">"{lesson.title}"</strong> পাঠটি সম্পন্ন করেছেন এবং
            মূল্যায়ন কুইজে কৃতিত্বের সাথে উত্তীর্ণ হয়েছেন।
          </p>

          {/* Verification badge */}
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono font-semibold text-primary tabular-nums">
              {certId}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-muted-foreground">
            <div className="text-center sm:text-left">
              <div className="font-semibold text-foreground text-sm">{today}</div>
              <div className="mt-1">সম্পন্নের তারিখ</div>
            </div>
            <div className="text-center order-first sm:order-none">
              <div className="font-serif-bn text-base text-foreground italic">
                স্বাক্ষরিত
              </div>
              <div className="h-[1px] w-24 bg-border mx-auto my-1" />
              <div className="font-semibold text-foreground text-sm">পরিচালক</div>
              <div>Amar Talim একাডেমি</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="font-semibold text-foreground text-sm">course.amartalim.com</div>
              <div className="mt-1">ভেরিফাই করুন</div>
            </div>
          </div>
        </div>
      </motion.div>

      <p className="no-print mt-6 text-xs text-muted-foreground text-center max-w-md px-4">
        এই সনদপত্রের সত্যতা যাচাই করতে উপরের সার্টিফিকেট নং ব্যবহার করুন বা ভেরিফিকেশন লিংক শেয়ার করুন।
      </p>
    </div>
  );
};

export default Certificate;

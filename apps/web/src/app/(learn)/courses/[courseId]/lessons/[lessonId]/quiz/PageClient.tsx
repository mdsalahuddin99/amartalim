"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "@/lib/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ArrowRight, ArrowLeft, Clock, Flag, AlertCircle, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SharedNavbar from "@/components/shared/navbar";
import QuizResultCard from "@/components/lms/QuizResultCard";
import { useSession } from "@/server/auth/session";
import { recordQuizAttempt } from "@/server/actions/progress.actions";

interface PageClientProps {
  course: any;
  lesson: any;
  quiz: any;
}

const SECONDS_PER_QUESTION = 45;
const PASSING_PCT = 70;

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const Quiz = ({ course, lesson, quiz }: PageClientProps) => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  
  const questions = quiz?.questions || [];
  const timeLimit = quiz?.timeLimit || SECONDS_PER_QUESTION * questions.length;
  const passingScore = quiz?.passingScore || PASSING_PCT;

  const { user } = useSession();
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const recorded = useRef(false);

  const score = answers.reduce(
    (s, a, i) => (a === questions[i]?.correctAnswer ? s + 1 : s),
    0,
  );
  const passed = questions.length > 0 && (score / questions.length) * 100 >= passingScore;
  const answeredCount = answers.filter((a) => a !== null).length;

  // Countdown timer
  useEffect(() => {
    if (!started || submitted) return;
    if (timeLeft <= 0) {
      setSubmitted(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, submitted, timeLeft]);

  // Record attempt once when submitted
  useEffect(() => {
    if (!submitted || recorded.current || !courseId || !lessonId || questions.length === 0) return;
    recorded.current = true;
    void recordQuizAttempt(user, {
      courseId,
      lessonId,
      score,
      total: questions.length,
      passed,
    });
  }, [submitted, user, courseId, lessonId, score, questions.length, passed]);

  if (!course || !lesson || !courseId || !lessonId || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-4">কোনো কুইজ নেই</h1>
          <Link to={`/courses/${courseId ?? ""}`}><Button>কোর্সে ফিরে যান</Button></Link>
        </div>
      </div>
    );
  }

  // ---------- Start screen ----------
  if (!started) {
    return (
      <div className="min-h-screen bg-background">
        <SharedNavbar
          backTo={`/courses/${courseId}/lessons/${lessonId}`}
          backLabel={lesson.title}
          subtitle="কুইজ শুরু করুন"
        />
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-10 rounded-2xl bg-card border border-border/50 shadow-card text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-hero flex items-center justify-center mb-5">
              <Flag className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">{lesson.title} — মূল্যায়ন কুইজ</h1>
            <p className="text-sm text-muted-foreground mb-8">
              শুরু করার আগে নিচের নির্দেশনাগুলো পড়ে নিন।
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8 text-center">
              <div className="p-3 rounded-xl bg-secondary/50">
                <div className="text-2xl font-bold tabular-nums">{questions.length}</div>
                <div className="text-xs text-muted-foreground mt-1">প্রশ্ন</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <div className="text-2xl font-bold tabular-nums">
                  {fmtTime(timeLimit)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">সময়</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <div className="text-2xl font-bold tabular-nums">{passingScore}%</div>
                <div className="text-xs text-muted-foreground mt-1">পাশ মার্ক</div>
              </div>
            </div>

            <ul className="text-left text-sm text-muted-foreground space-y-2 mb-8">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> প্রতিটি প্রশ্নের একটি সঠিক উত্তর রয়েছে।</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> সময় শেষ হলে স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> উত্তীর্ণ হলে সার্টিফিকেট পাবেন।</li>
            </ul>

            <Button
              className="w-full h-12 rounded-xl bg-gradient-hero font-semibold"
              onClick={() => setStarted(true)}
            >
              শুরু করুন <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ---------- Review breakdown ----------
  if (submitted && reviewMode) {
    const q = questions[reviewIdx];
    const userAns = answers[reviewIdx];
    return (
      <div className="min-h-screen bg-background">
        <SharedNavbar
          backTo={`/courses/${courseId}/lessons/${lessonId}`}
          backLabel="রিভিউ"
          subtitle={`প্রশ্ন ${reviewIdx + 1} / ${questions.length}`}
        />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-1.5 mb-6">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setReviewIdx(i)}
                className={`h-2 flex-1 rounded-full transition-all ${
                  answers[i] === questions[i].correctAnswer
                    ? "bg-primary"
                    : "bg-destructive/60"
                } ${i === reviewIdx ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/30" : ""}`}
                aria-label={`প্রশ্ন ${i + 1}`}
              />
            ))}
          </div>

          <div className="p-5 sm:p-8 rounded-2xl bg-card border border-border/50 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                userAns === q.correctAnswer
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}>
                {userAns === q.correctAnswer ? "সঠিক" : "ভুল"}
              </span>
              <span className="text-xs text-muted-foreground">প্রশ্ন {reviewIdx + 1}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-6">{q.question}</h2>
            <div className="space-y-2.5">
              {q.options.map((option, i) => {
                const isCorrect = i === q.correctAnswer;
                const isUser = i === userAns;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border-2 font-medium text-sm flex items-center gap-3 ${
                      isCorrect
                        ? "border-primary bg-primary/5"
                        : isUser
                          ? "border-destructive bg-destructive/5"
                          : "border-border"
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0 ${
                      isCorrect
                        ? "bg-primary text-primary-foreground"
                        : isUser
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-secondary"
                    }`}>
                      {isCorrect ? <Check className="h-4 w-4" /> : isUser ? <X className="h-4 w-4" /> : String.fromCharCode(2453 + i)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isCorrect && <span className="text-xs text-primary font-semibold">সঠিক উত্তর</span>}
                    {isUser && !isCorrect && <span className="text-xs text-destructive font-semibold">আপনার উত্তর</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              className="rounded-xl h-11"
              disabled={reviewIdx === 0}
              onClick={() => setReviewIdx((i) => i - 1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> পূর্ববর্তী
            </Button>
            {reviewIdx < questions.length - 1 ? (
              <Button
                className="rounded-xl h-11"
                onClick={() => setReviewIdx((i) => i + 1)}
              >
                পরবর্তী <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="rounded-xl h-11"
                variant="outline"
                onClick={() => setReviewMode(false)}
              >
                ফলাফলে ফিরে যান
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Result screen ----------
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          <QuizResultCard
            courseId={courseId}
            lessonId={lessonId}
            score={score}
            total={questions.length}
            passingPct={passingScore}
            onRetry={() => {
              recorded.current = false;
              setSubmitted(false);
              setReviewMode(false);
              setCurrentQ(0);
              setAnswers(new Array(questions.length).fill(null));
              setTimeLeft(timeLimit);
            }}
            onReview={() => {
              setReviewIdx(0);
              setReviewMode(true);
            }}
          />
        </motion.div>
      </div>
    );
  }

  // ---------- Active quiz ----------
  const question = questions[currentQ];
  const timeWarn = timeLeft <= 30;

  const selectAnswer = (optionIndex: number) => {
    const next = [...answers];
    next[currentQ] = optionIndex;
    setAnswers(next);
  };

  return (
    <div className="min-h-screen bg-background">
      <SharedNavbar
        backTo={`/courses/${courseId}/lessons/${lessonId}`}
        backLabel={`${lesson.title} — কুইজ`}
        subtitle={`প্রশ্ন ${currentQ + 1} / ${questions.length}`}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Timer + progress bar */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-muted-foreground">
            উত্তর দেওয়া হয়েছে <strong className="text-foreground tabular-nums">{answeredCount}</strong> / {questions.length}
          </span>
          <span
            className={`flex items-center gap-1.5 font-semibold tabular-nums px-3 py-1 rounded-full ${
              timeWarn ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {fmtTime(timeLeft)}
          </span>
        </div>
        <Progress value={(answeredCount / questions.length) * 100} className="h-1.5 mb-6" />

        {/* Question navigator dots */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold tabular-nums transition-all ${
                i === currentQ
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : answers[i] !== null
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/70"
              }`}
              aria-label={`প্রশ্ন ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22 }}
          >
            <div className="p-5 sm:p-8 rounded-2xl bg-card border border-border/50 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  প্রশ্ন {currentQ + 1}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-6">{question.question}</h2>
              <div className="space-y-2.5">
                {question.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm group ${
                      answers[currentQ] === i
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold mr-3 transition-colors ${
                        answers[currentQ] === i
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary group-hover:bg-primary/10"
                      }`}
                    >
                      {String.fromCharCode(2453 + i)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6 sm:mt-8 gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-11"
            disabled={currentQ === 0}
            onClick={() => setCurrentQ(currentQ - 1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> পূর্ববর্তী
          </Button>
          {currentQ < questions.length - 1 ? (
            <Button
              className="rounded-xl h-11"
              onClick={() => setCurrentQ(currentQ + 1)}
            >
              পরবর্তী <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="rounded-xl h-11 bg-gradient-hero font-semibold"
              disabled={answeredCount === 0}
              onClick={() => setSubmitted(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> জমা দিন
            </Button>
          )}
        </div>

        {answeredCount < questions.length && currentQ === questions.length - 1 && (
          <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
            <AlertCircle className="h-3.5 w-3.5" />
            {questions.length - answeredCount}টি প্রশ্ন এখনো বাকি আছে।
          </p>
        )}
      </div>
    </div>
  );
};

export default Quiz;

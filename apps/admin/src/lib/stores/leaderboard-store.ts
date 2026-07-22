"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import { mockStudents } from "@/lib/seed/mock-data";
import type { QuizAttemptRecord } from "@/types/order";
import type { EnrollmentRecord } from "@/types/enrollment";

/**
 * Leaderboard — points derived from progress + quiz attempts + enrollments.
 *
 * Scoring (tweakable later from admin):
 *   - 10 pts per completed lesson
 *   - 5  pts per enrolled course
 *   - quiz attempts: score% / 2  (so a 100% adds 50 pts)
 *
 * Seeds with mockStudents so the leaderboard is never empty in preview.
 */

interface RawProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  enrolledCount: number;
  completedLessons: number;
  quizCount: number;
}

const POINTS_PER_LESSON = 10;
const POINTS_PER_ENROLLMENT = 5;

export function computeLeaderboard(): LeaderboardRow[] {
  const progress = driver.list<RawProgress>("progress");
  const attempts = driver.list<QuizAttemptRecord>("quiz-attempts");
  const enrolls = driver.list<EnrollmentRecord>("enrollments");

  const tally = new Map<string, { name: string; avatar?: string; points: number; lessons: number; enrolled: number; quizzes: number }>();
  const ensure = (id: string, name = "শিক্ষার্থী", avatar?: string) => {
    const cur = tally.get(id) ?? { name, avatar, points: 0, lessons: 0, enrolled: 0, quizzes: 0 };
    tally.set(id, cur);
    return cur;
  };

  // Seed from mock students for a populated default state.
  mockStudents.forEach((s, i) => {
    const t = ensure(s.id, s.name);
    t.enrolled += s.enrolledCourses.length;
    t.lessons += s.completedCourses * 6 + (i % 4);
    t.quizzes += s.completedCourses;
    t.points += t.lessons * POINTS_PER_LESSON + t.enrolled * POINTS_PER_ENROLLMENT + s.completedCourses * 25;
  });

  // Real progress
  progress.forEach((p) => {
    const t = ensure(p.userId);
    const real = p.completedLessons.filter((id) => id !== "__enrolled__").length;
    t.lessons += real;
    t.points += real * POINTS_PER_LESSON;
  });

  // Enrollments
  enrolls.forEach((e) => {
    const t = ensure(e.userId);
    t.enrolled += 1;
    t.points += POINTS_PER_ENROLLMENT;
  });

  // Quiz attempts → best score per lesson
  const bestByQuiz = new Map<string, number>();
  attempts.forEach((a) => {
    const key = `${a.userId}:${a.lessonId}`;
    const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
    bestByQuiz.set(key, Math.max(bestByQuiz.get(key) ?? 0, pct));
  });
  bestByQuiz.forEach((pct, key) => {
    const userId = key.split(":")[0];
    const t = ensure(userId);
    t.quizzes += 1;
    t.points += Math.round(pct / 2);
  });

  const rows = Array.from(tally.entries())
    .map(([userId, t]) => ({
      userId,
      name: t.name,
      avatar: t.avatar,
      points: t.points,
      enrolledCount: t.enrolled,
      completedLessons: t.lessons,
      quizCount: t.quizzes,
    }))
    .filter((r) => r.points > 0)
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return rows;
}

export function useLeaderboard(limit?: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    // Touch the API so the same flow (UI → api → mock) is exercised; results
    // are derived locally so the bump is enough to trigger a recompute.
    void api
      .get<LeaderboardRow[]>("/leaderboard", limit ? { limit } : undefined)
      .then(bump)
      .catch(() => {});
    const offs = ["progress", "quiz-attempts", "enrollments"].map((r) =>
      driver.subscribe(r, bump),
    );
    return () => offs.forEach((f) => f());
  }, [limit]);
  const rows = useMemo(() => {
    const all = computeLeaderboard();
    return typeof limit === "number" ? all.slice(0, limit) : all;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, limit]);
  return rows;
}

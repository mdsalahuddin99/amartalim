import { prisma } from "../db/prisma";

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

export async function getLeaderboard(limit?: number): Promise<{ ok: boolean; data: LeaderboardRow[] }> {
  try {
    const users = await prisma.user.findMany({
      include: {
        progress: true,
        quizAttempts: true,
        enrollments: true,
      },
    });

    const rows: LeaderboardRow[] = users.map((user) => {
      let enrolledCount = user.enrollments.length;
      let completedLessons = 0;
      let quizCount = 0;
      let points = 0;

      // Completed lessons
      user.progress.forEach((p) => {
        if (p.completed) {
          completedLessons += 1;
        }
      });

      // Enrollment points
      points += enrolledCount * POINTS_PER_ENROLLMENT;

      // Lesson points
      points += completedLessons * POINTS_PER_LESSON;

      // Quiz Attempts
      const bestByQuiz = new Map<string, number>();
      user.quizAttempts.forEach((a) => {
        const key = a.quizId;
        const pct = a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0;
        bestByQuiz.set(key, Math.max(bestByQuiz.get(key) ?? 0, pct));
      });

      bestByQuiz.forEach((pct) => {
        quizCount += 1;
        points += Math.round(pct / 2);
      });

      return {
        rank: 0,
        userId: user.id,
        name: user.name ?? "শিক্ষার্থী",
        avatar: user.image ?? undefined,
        points,
        enrolledCount,
        completedLessons,
        quizCount,
      };
    });

    const sortedRows = rows
      .filter((r) => r.points > 0)
      .sort((a, b) => b.points - a.points)
      .map((r, i) => ({ ...r, rank: i + 1 }));

    return {
      ok: true,
      data: limit ? sortedRows.slice(0, limit) : sortedRows,
    };
  } catch (error) {
    console.error("[LEADERBOARD_ACTION]", error);
    return { ok: false, data: [] };
  }
}

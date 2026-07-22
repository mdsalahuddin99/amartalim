import { ok, registerMock } from "@/lib/api-client";
import { computeLeaderboard } from "@/lib/stores/leaderboard-store";

export const registerLeaderboardMocks = () => {
  registerMock("GET", /^\/leaderboard$/, (req) => {
    const limit = Number(req.query.limit) || 0;
    const rows = computeLeaderboard();
    return ok(limit > 0 ? rows.slice(0, limit) : rows);
  });
};

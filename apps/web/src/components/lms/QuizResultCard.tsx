import { Link } from "@/lib/navigation";
import { Trophy, XCircle, Award, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  courseId: string;
  lessonId: string;
  score: number;
  total: number;
  passingPct?: number;
  onRetry: () => void;
  onReview?: () => void;
  certificateHref?: string;
  backHref?: string;
}

/**
 * Shared post-quiz result card. Reusable across the quiz page and any
 * future "view past attempt" surface.
 */
const QuizResultCard = ({
  courseId,
  lessonId,
  score,
  total,
  passingPct = 70,
  onRetry,
  onReview,
  certificateHref,
  backHref,
}: Props) => {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= passingPct;
  const certHref = certificateHref ?? `/certificate/${courseId}/${lessonId}`;
  const back = backHref ?? `/courses/${courseId}`;

  return (
    <div className="max-w-md mx-auto text-center space-y-6 p-8 rounded-2xl bg-card border shadow-sm">
      <div
        className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
          passed ? "bg-primary/10" : "bg-destructive/10"
        }`}
      >
        {passed ? (
          <Trophy className="h-12 w-12 text-primary" />
        ) : (
          <XCircle className="h-12 w-12 text-destructive" />
        )}
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif-bn">
          {passed ? "অভিনন্দন! 🎉" : "আরেকটু চেষ্টা করুন"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">আপনার স্কোর</p>
      </div>

      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={passed ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 3.14} ${314 - percentage * 3.14}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums">{percentage}%</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {score}/{total}
          </span>
        </div>
      </div>

      <p
        className={`text-sm font-medium px-4 py-2 rounded-md ${
          passed ? "text-primary bg-primary/5" : "text-muted-foreground bg-muted"
        }`}
      >
        {passed ? "✓ আপনি উত্তীর্ণ হয়েছেন!" : `উত্তীর্ণ হতে ${passingPct}% প্রয়োজন।`}
      </p>

      <div className="flex flex-col gap-2.5 pt-2">
        {passed && (
          <Link to={certHref}>
            <Button className="w-full rounded-xl h-11 font-semibold">
              <Award className="mr-2 h-4 w-4" /> সার্টিফিকেট দেখুন
            </Button>
          </Link>
        )}
        {onReview && (
          <Button variant="outline" className="w-full rounded-xl h-11" onClick={onReview}>
            <Eye className="mr-2 h-4 w-4" /> উত্তর রিভিউ করুন
          </Button>
        )}
        <Button variant="outline" className="w-full rounded-xl h-11" onClick={onRetry}>
          <RotateCcw className="mr-2 h-4 w-4" /> আবার চেষ্টা করুন
        </Button>
        <Link to={back}>
          <Button variant="ghost" className="w-full rounded-xl h-11">
            কোর্সে ফিরে যান
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default QuizResultCard;

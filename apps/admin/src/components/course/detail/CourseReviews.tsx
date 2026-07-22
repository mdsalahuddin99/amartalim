import { motion } from "framer-motion";
import { MessageSquare, Star } from "lucide-react";
import type { Review } from "@/lib/seed/mock-data";

export interface CourseReviewsProps {
  reviews: Review[];
  avgRating: string | number;
}

export const CourseReviews = ({ reviews, avgRating }: CourseReviewsProps) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl bg-card border border-border/50">
      <div className="text-center px-6">
        <div className="text-5xl font-bold text-primary">{avgRating}</div>
        <div className="flex gap-0.5 mt-2 justify-center">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? "fill-warning text-warning" : "text-border"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{reviews.length}টি রিভিউ</p>
      </div>
      <div className="flex-1 w-full space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter((r) => r.rating === star).length;
          const pct = reviews.length ? (count / reviews.length) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2.5 text-sm">
              <span className="w-3 text-muted-foreground text-xs">{star}</span>
              <Star className="h-3.5 w-3.5 text-warning fill-warning" />
              <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-warning transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-xs text-muted-foreground text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>

    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="p-5 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {review.userName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">{review.userName}</p>
                <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString("bn-BD")}</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-warning text-warning" : "text-border"}`} />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
        </div>
      ))}
      {reviews.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>এখনো কোনো রিভিউ নেই।</p>
        </div>
      )}
    </div>
  </motion.div>
);

export default CourseReviews;

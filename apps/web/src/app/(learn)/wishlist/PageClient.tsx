"use client";

import { useMemo, useState } from "react";
import { Link } from "@/lib/navigation";
import { Heart, HeartOff } from "lucide-react";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import { Button } from "@/components/ui/button";
import CourseCard, { type CourseCardData } from "@/components/course/CourseCard";
import { useSession } from "@/server/auth/session";
import { toast } from "@/hooks/use-toast";
import { toggleWishlist } from "@/server/actions/wishlist.actions";

const WishlistPage = ({ initialItems = [] }: { initialItems?: any[] }) => {
  const { user, isAuthenticated } = useSession();
  const [items, setItems] = useState<any[]>(initialItems);

  const cards = useMemo(() => {
    return items
      .filter((w) => !!w.course)
      .map<CourseCardData>((w) => {
        const c = w.course;
        return {
          id: c.id,
          title: c.title,
          thumbnail: c.thumbnail,
          categoryName: c.category?.name || "Uncategorized",
          instructor: c.instructor,
          price: c.price,
          originalPrice: undefined,
          rating: c.rating,
          lessonsCount: c.lessonsCount || 0,
          duration: c.duration || 0,
          level: c.level || "Beginner",
          studentsCount: c.studentCount || 0,
        };
      });
  }, [items]);

  return (
    <UserDashboardLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-8 pb-4 border-b border-foreground/10 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-1">আপনার সংগ্রহ</p>
            <h1 className="font-serif-bn font-black text-3xl sm:text-4xl flex items-center gap-3">
              <Heart className="w-7 h-7 text-primary fill-primary" /> উইশলিস্ট
            </h1>
          </div>
          {cards.length > 0 && (
            <span className="text-sm text-muted-foreground">{cards.length} টি কোর্স</span>
          )}
        </header>

        {!isAuthenticated ? (
          <div className="text-center py-16 border border-dashed border-foreground/20 rounded-2xl">
            <p className="font-serif-bn text-lg mb-4">উইশলিস্ট দেখতে দয়া করে লগইন করুন।</p>
            <Link to="/login?from=/wishlist">
              <Button className="rounded-xl">লগইন</Button>
            </Link>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-foreground/20 rounded-2xl">
            <HeartOff className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-serif-bn text-lg mb-4">এখনো কোনো কোর্স উইশলিস্টে যোগ করা হয়নি।</p>
            <Link to="/courses">
              <Button variant="outline" className="rounded-xl">কোর্স ব্রাউজ করুন</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((c) => (
              <div key={c.id} className="relative group">
                <CourseCard course={c} />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 rounded-full shadow"
                  onClick={async () => {
                    const res = await toggleWishlist(c.id);
                    if (res.ok) {
                      setItems((prev) => prev.filter((item) => item.courseId !== c.id));
                      toast({ title: "সরানো হয়েছে" });
                    }
                  }}
                  aria-label="সরান"
                >
                  <HeartOff className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </UserDashboardLayout>
  );
};

export default WishlistPage;

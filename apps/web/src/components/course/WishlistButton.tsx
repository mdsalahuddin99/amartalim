import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/server/auth/session";
import { toggleWishlist, checkWishlistStatus } from "@/server/actions/wishlist.actions";
import { toast } from "@/hooks/use-toast";

interface Props {
  courseId: string;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default" | "lg";
  className?: string;
  showLabel?: boolean;
}

const WishlistButton = ({
  courseId,
  variant = "outline",
  size = "default",
  className,
  showLabel = true,
}: Props) => {
  const { isAuthenticated } = useSession();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus(courseId).then(res => {
        setActive(res.active);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, courseId]);

  if (!isAuthenticated) {
    return (
      <Link to={`/login?from=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}>
        <Button type="button" variant={variant} size={size} className={cn("rounded-xl", className)}>
          <Heart className="mr-2 h-4 w-4" />
          {showLabel && <span>উইশলিস্টে যোগ করুন</span>}
        </Button>
      </Link>
    );
  }

  const handle = async () => {
    // Optimistic update
    setActive(!active);
    
    const res = await toggleWishlist(courseId);
    if (res.ok) {
      setActive(res.active!);
      toast({
        title: res.active ? "উইশলিস্টে যোগ হয়েছে" : "উইশলিস্ট থেকে সরানো হয়েছে",
      });
    } else {
      // Revert if failed
      setActive(active);
      toast({
        title: "কোড কাজ করছে না",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handle}
      aria-pressed={active}
      disabled={loading}
      className={cn("rounded-xl", active && "text-primary border-primary/50", className)}
    >
      <Heart className={cn("mr-2 h-4 w-4", active && "fill-primary")} />
      {showLabel && <span>{active ? "উইশলিস্টে আছে" : "উইশলিস্টে যোগ করুন"}</span>}
    </Button>
  );
};

export default WishlistButton;

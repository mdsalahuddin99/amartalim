import { Heart } from "lucide-react";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/server/auth/session";
import { wishlistStore, useWishlist } from "@/lib/stores/wishlist-store";
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
  const { user, isAuthenticated } = useSession();
  const active = useWishlist(user?.id, courseId);

  if (!isAuthenticated) {
    return (
      <Link to={`/login?from=${encodeURIComponent(window.location.pathname)}`}>
        <Button type="button" variant={variant} size={size} className={cn("rounded-xl", className)}>
          <Heart className="mr-2 h-4 w-4" />
          {showLabel && <span>উইশলিস্টে যোগ করুন</span>}
        </Button>
      </Link>
    );
  }

  const handle = () => {
    const now = wishlistStore.toggle(user!.id, courseId);
    toast({
      title: now ? "উইশলিস্টে যোগ হয়েছে" : "উইশলিস্ট থেকে সরানো হয়েছে",
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handle}
      aria-pressed={active}
      className={cn("rounded-xl", active && "text-primary border-primary/50", className)}
    >
      <Heart className={cn("mr-2 h-4 w-4", active && "fill-primary")} />
      {showLabel && <span>{active ? "উইশলিস্টে আছে" : "উইশলিস্টে যোগ করুন"}</span>}
    </Button>
  );
};

export default WishlistButton;

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/server/auth/session";
import { bookmarkStore, useBookmark } from "@/lib/stores/bookmarks-store";
import { toast } from "@/hooks/use-toast";

interface Props {
  blogId: string;
  size?: "sm" | "default";
  variant?: "ghost" | "outline";
  className?: string;
  showLabel?: boolean;
}

const BookmarkButton = ({
  blogId,
  size = "sm",
  variant = "ghost",
  className,
  showLabel = true,
}: Props) => {
  const { user, isAuthenticated } = useSession();
  const active = useBookmark(user?.id, blogId);

  if (!isAuthenticated) {
    return (
      <Link to={`/login?from=${encodeURIComponent(window.location.pathname)}`}>
        <Button type="button" size={size} variant={variant} className={cn("rounded-none", className)}>
          <Bookmark className="w-4 h-4" />
          {showLabel && <span>সংরক্ষণ করুন</span>}
        </Button>
      </Link>
    );
  }

  const handle = () => {
    const now = bookmarkStore.toggle(user!.id, blogId);
    toast({
      title: now ? "রিডিং লিস্টে যোগ হয়েছে" : "রিডিং লিস্ট থেকে সরানো হয়েছে",
    });
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      aria-pressed={active}
      onClick={handle}
      className={cn("rounded-none", active && "text-primary", className)}
    >
      {active ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      {showLabel && <span>{active ? "সংরক্ষিত" : "সংরক্ষণ করুন"}</span>}
    </Button>
  );
};

export default BookmarkButton;

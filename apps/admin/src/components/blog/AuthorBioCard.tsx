import { Link } from "@/lib/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slugify";

interface AuthorBioCardProps {
  name: string;
  bio?: string | null;
  avatar?: string | null;
  /** Optional override; defaults to slugify(name). */
  slug?: string;
  postCount?: number;
}

/**
 * AuthorBioCard — used at the bottom of blog detail pages.
 * Clean, presentational; data is supplied by the page (which will fetch
 * from `getAuthorBySlug` post-migration).
 */
const AuthorBioCard = ({ name, bio, avatar, slug, postCount }: AuthorBioCardProps) => {
  const profileSlug = slug ?? slugify(name);
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <Card className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
      <Avatar className="h-16 w-16 shrink-0">
        {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold truncate">{name}</h3>
          {typeof postCount === "number" && (
            <span className="text-xs text-muted-foreground">
              · {postCount}টি লেখা
            </span>
          )}
        </div>
        {bio ? (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{bio}</p>
        ) : null}
      </div>

      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link to={`/authors/${profileSlug}`}>প্রোফাইল দেখুন</Link>
      </Button>
    </Card>
  );
};

export default AuthorBioCard;

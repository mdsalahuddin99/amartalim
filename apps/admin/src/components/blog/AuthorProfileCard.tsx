import { Link } from "@/lib/navigation";
import { ArrowRight, Globe } from "lucide-react";
import { Facebook, Twitter } from "@/components/shared/BrandIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Author } from "@/types/author";

interface Props {
  author: Author;
}

/**
 * Rich author card shown at the bottom of a blog post when
 * `hasAuthorProfile = true`. Compact, brand-aligned, links to full profile.
 */
const AuthorProfileCard = ({ author }: Props) => {
  const initials = author.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("");

  return (
    <Card className="p-6 mt-12 bg-muted/30">
      <div className="flex flex-col sm:flex-row gap-5">
        <Avatar className="h-20 w-20 mx-auto sm:mx-0 shrink-0">
          {author.avatar ? <AvatarImage src={author.avatar} alt={author.name} /> : null}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="eyebrow mb-1">লেখক পরিচিতি</p>
          <Link to={`/author/${author.slug}`}
            className="font-serif-bn font-bold text-xl hover:text-primary transition-colors">
            {author.name}
          </Link>

          {author.shortBio && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {author.shortBio}
            </p>
          )}

          {author.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
              {author.expertise.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {(author.facebook || author.twitter || author.website) && (
            <div className="flex gap-3 mt-3 text-xs justify-center sm:justify-start">
              {author.facebook && (
                <a href={author.facebook} target="_blank" rel="noreferrer"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                  <Facebook className="h-3.5 w-3.5" /> Facebook
                </a>
              )}
              {author.twitter && (
                <a href={author.twitter} target="_blank" rel="noreferrer"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                  <Twitter className="h-3.5 w-3.5" /> Twitter
                </a>
              )}
              {author.website && (
                <a href={author.website} target="_blank" rel="noreferrer"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> Website
                </a>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-center sm:justify-start">
            <Button asChild size="sm" variant="outline">
              <Link to={`/author/${author.slug}`}>
                লেখকের সব লেখা দেখুন <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AuthorProfileCard;

"use client";

import { useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/navigation";
import { Search as SearchIcon } from "lucide-react";
import PageShell from "@/components/shared/page-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchAll } from "@/server/queries/search.queries";

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get("q") ?? "";
  const [draft, setDraft] = useState(initialQuery);

  const results = useMemo(() => searchAll(initialQuery), [initialQuery]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = draft.trim();
    if (next) setParams({ q: next });
    else setParams({});
  };

  return (
    <PageShell>
      

      <h1 className="text-3xl font-bold mb-2">অনুসন্ধান</h1>
      <p className="text-muted-foreground mb-6">
        কোর্স, ব্লগ, ট্যাগ — সবকিছু এক জায়গায় খুঁজুন।
      </p>

      <form onSubmit={onSubmit} className="flex gap-2 mb-8">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="কী খুঁজছেন? যেমন: কুরআন, ফ্রিল্যান্সিং..."
          aria-label="অনুসন্ধান"
        />
        <Button type="submit">
          <SearchIcon className="h-4 w-4 mr-2" /> খুঁজুন
        </Button>
      </form>

      {!initialQuery ? (
        <p className="text-muted-foreground">কিছু লিখে সার্চ করুন।</p>
      ) : results.total === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-medium">"{initialQuery}" এর জন্য কোনো ফলাফল পাওয়া যায়নি।</p>
          <p className="text-sm text-muted-foreground mt-1">
            অন্য কোনো শব্দে চেষ্টা করুন।
          </p>
        </Card>
      ) : (
        <div className="space-y-10">
          {results.courses.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">
                কোর্স ({results.courses.length})
              </h2>
              <div className="grid gap-3">
                {results.courses.map((c) => (
                  <Card key={c.id} className="p-4 flex gap-4">
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      loading="lazy"
                      className="w-24 h-24 object-cover rounded-md shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="mb-1">
                        {c.categoryName}
                      </Badge>
                      <Link
                        to={`/courses/${c.id}`}
                        className="block font-semibold hover:text-primary line-clamp-1"
                      >
                        {c.title}
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {c.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.posts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">
                ব্লগ ({results.posts.length})
              </h2>
              <div className="grid gap-3">
                {results.posts.map((p) => (
                  <Card key={p.id} className="p-4 flex gap-4">
                    <img
                      src={p.cover}
                      alt={p.title}
                      loading="lazy"
                      className="w-24 h-24 object-cover rounded-md shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="mb-1">
                        {p.categoryName}
                      </Badge>
                      <Link
                        to={`/blogs/${p.slug}`}
                        className="block font-semibold hover:text-primary line-clamp-1"
                      >
                        {p.title}
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {p.excerpt}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default SearchPage;

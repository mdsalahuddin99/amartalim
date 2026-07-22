import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
}

const TableOfContents = ({ items }: { items: TocItem[] }) => {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="সূচিপত্র" className="text-sm">
      <h3 className="flex items-center gap-2 font-bold text-foreground uppercase text-xs tracking-wider mb-3">
        <List className="w-4 h-4" /> সূচিপত্র
      </h3>
      <ul className="space-y-1.5 border-l border-border">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={cn(
                "block pl-3 -ml-px border-l-2 py-1 text-muted-foreground hover:text-primary transition-colors leading-snug",
                active === it.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent"
              )}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;

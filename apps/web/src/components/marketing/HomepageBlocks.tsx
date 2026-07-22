import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/navigation";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  CounterItem,
  CategoryItem,
  TestimonialItem,
  PartnerItem,
} from "@/server/queries/homepage.queries";

/* ── Animated counter ── */
const useCountUp = (target: number, duration = 1600, start = false) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
};

const formatNumber = (n: number) =>
  new Intl.NumberFormat("bn-BD").format(n);

export const CountersSection = ({
  title,
  items,
}: {
  title?: string;
  items: CounterItem[];
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.2 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  if (!items?.length) return null;

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-y border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold">{title}</h2>
            <div className="mt-2 h-1 w-16 bg-accent mx-auto rounded-full" />
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((c) => (
            <CounterCard key={c.id} item={c} animate={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

const CounterCard = ({ item, animate }: { item: CounterItem; animate: boolean }) => {
  const v = useCountUp(item.value, 1600, animate);
  return (
    <Card className="p-5 sm:p-7 text-center bg-card/60 backdrop-blur border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1">
      {item.icon && <div className="text-3xl sm:text-4xl mb-2">{item.icon}</div>}
      <div className="text-3xl sm:text-4xl font-extrabold text-primary tabular-nums">
        {formatNumber(v)}
        {item.suffix && <span className="text-accent">{item.suffix}</span>}
      </div>
      <div className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
        {item.label}
      </div>
    </Card>
  );
};

/* ── Categories grid ── */
export const CategoriesGridSection = ({
  title,
  items,
}: {
  title?: string;
  items: CategoryItem[];
}) => {
  if (!items?.length) return null;
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {title && (
          <div className="flex items-end justify-between mb-8 border-b-2 border-primary pb-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold">{title}</h2>
            <Link to="/courses" className="text-sm font-medium text-primary hover:underline">
              সব দেখুন →
            </Link>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((c) => (
            <Link
              key={c.id}
              to={c.href || "#"}
              className={cn(
                "group block p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all hover:-translate-y-1",
                c.color,
              )}
            >
              <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <h3 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2">
                {c.name}
              </h3>
              {typeof c.count === "number" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(c.count)} টি কনটেন্ট
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Testimonial slider ── */
export const TestimonialsSection = ({
  title,
  items,
}: {
  title?: string;
  items: TestimonialItem[];
}) => {
  const [idx, setIdx] = useState(0);
  const count = items?.length || 0;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  if (!count) return null;

  const prev = () => setIdx((i) => (i - 1 + count) % count);
  const next = () => setIdx((i) => (i + 1) % count);

  return (
    <section className="py-12 sm:py-16 bg-card/40 border-y border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold">{title}</h2>
            <div className="mt-2 h-1 w-16 bg-accent mx-auto rounded-full" />
          </div>
        )}

        <div className="relative">
          <Card className="p-8 sm:p-12 bg-background relative overflow-hidden">
            <Quote className="absolute top-4 left-4 h-16 w-16 text-primary/10" />
            <div className="relative z-10 text-center">
              {items[idx].rating ? (
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < (items[idx].rating || 0)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
              ) : null}
              <p className="text-base sm:text-xl leading-relaxed text-foreground/90 italic max-w-2xl mx-auto">
                "{items[idx].quote}"
              </p>
              <div className="mt-6 flex flex-col items-center gap-2">
                {items[idx].avatar ? (
                  <img
                    src={items[idx].avatar}
                    alt={items[idx].name}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {items[idx].name.slice(0, 1)}
                  </div>
                )}
                <div>
                  <div className="font-bold">{items[idx].name}</div>
                  {items[idx].role && (
                    <div className="text-xs text-muted-foreground">{items[idx].role}</div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {count > 1 && (
            <>
              <Button
                size="icon"
                variant="outline"
                onClick={prev}
                className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 shadow-md"
                aria-label="পূর্ববর্তী"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={next}
                className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 shadow-md"
                aria-label="পরবর্তী"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`স্লাইড ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === idx ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ── Partner logos ── */
export const PartnersSection = ({
  title,
  items,
}: {
  title?: string;
  items: PartnerItem[];
}) => {
  if (!items?.length) return null;
  return (
    <section className="py-10 sm:py-12 border-y border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {title && (
          <p className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground mb-6">
            {title}
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-center">
          {items.map((p) => {
            const inner = p.logoUrl ? (
              <img
                src={p.logoUrl}
                alt={p.name}
                className="h-10 sm:h-12 mx-auto object-contain opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              />
            ) : (
              <div className="h-12 flex items-center justify-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors text-center">
                {p.name}
              </div>
            );
            return p.href ? (
              <a key={p.id} href={p.href} target="_blank" rel="noreferrer" className="block">
                {inner}
              </a>
            ) : (
              <div key={p.id}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Link } from "@/lib/navigation";
import { formatBlogDate } from "@/lib/seed/blog-data";
import type { ManagedBlogPost as Posts } from "@/types/blog";

export interface HeroMagazineProps {
  posts: Posts[];
}

/** Lead article + 2 secondary stack + search CTA. */
export const HeroMagazine = ({ posts }: HeroMagazineProps) => {
  const lead = posts[0];
  const secondary = posts.slice(1, 3);
  if (!lead) return null;

  return (
    <section className="border-b border-foreground/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-14">
          {/* Lead */}
          <article className="lg:border-r lg:border-foreground/10 lg:pr-14">
            <Link to={`/blogs/${lead.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden mb-7 bg-muted">
                <img
                  src={lead.cover}
                  alt={lead.title}
                  loading="eager"
                  className="w-full h-full object-cover md:group-hover:scale-[1.03] md:transition-transform md:duration-[1200ms]"
                />
                <span className="absolute top-5 left-5 bg-accent text-foreground px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] shadow-sm">
                  ফিচার্ড
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] mb-4">
                <span className="text-primary">{lead.categoryName}</span>
                <span className="w-1 h-1 bg-accent rounded-full" />
                <span className="text-muted-foreground">{formatBlogDate(lead.date)}</span>
                <span className="w-1 h-1 bg-accent rounded-full" />
                <span className="text-muted-foreground">{lead.readTime} মিনিট</span>
              </div>
              <h1 className="font-serif-bn font-black text-3xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight group-hover:text-primary transition-colors">
                {lead.title}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed line-clamp-3 max-w-2xl">
                {lead.excerpt}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                <span className="border-b-2 border-accent pb-1 group-hover:border-primary transition-colors">সম্পূর্ণ পড়ুন</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </article>

          {/* Secondary */}
          <div className="flex flex-col gap-10">
            <div className="flex items-end justify-between pb-2 border-b border-foreground/15">
              <p className="eyebrow">সাম্প্রতিক</p>
              <span className="h-[2px] w-10 bg-accent" />
            </div>

            {secondary.map((p) => (
              <article key={p.id} className="group">
                <Link to={`/blogs/${p.slug}`} className="block border-l-2 border-transparent hover:border-accent pl-5 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary block mb-2">
                    {p.categoryName}
                  </span>
                  <h3 className="font-serif-bn font-bold text-xl sm:text-2xl leading-snug group-hover:text-primary transition-colors line-clamp-3">
                    {p.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatBlogDate(p.date)}</span>
                    <span className="w-0.5 h-0.5 bg-muted-foreground rounded-full mx-1" />
                    <Clock className="h-3 w-3" />
                    <span>{p.readTime} মিনিট</span>
                  </div>
                </Link>
              </article>
            ))}

            {/* Search CTA */}
            <div className="bg-primary text-primary-foreground p-7 relative overflow-hidden ring-1 ring-accent/20">
              <div className="relative z-10">
                <h4 className="font-serif-bn font-bold text-xl mb-2">ব্লগ খুঁজুন</h4>
                <p className="text-primary-foreground/70 text-xs mb-5 leading-relaxed">
                  যেকোনো বিষয়ে গবেষণাভিত্তিক আর্টিকেল পড়ুন।
                </p>
                <Link to="/blogs">
                  <button className="w-full bg-accent text-foreground py-3 text-xs font-black uppercase tracking-[0.18em] flex items-center justify-between px-4 group/btn hover:bg-accent/90 transition-colors">
                    <span>সব ব্লগ ব্রাউজ করুন</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </Link>
              </div>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 border border-accent/15 rounded-full" />
              <div className="absolute -right-10 -bottom-10 w-40 h-40 border border-accent/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroMagazine;

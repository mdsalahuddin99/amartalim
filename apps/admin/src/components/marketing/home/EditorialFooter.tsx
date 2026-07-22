import { Link } from "@/lib/navigation";
import type { ManagedBlogCategory } from "@/types/blog";

/** Editorial-style site footer used on the magazine homepage. */
export const EditorialFooter = ({ categories = [] }: { categories?: ManagedBlogCategory[] }) => (
  <footer className="bg-foreground text-background mt-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
        <div className="lg:col-span-4">
          <Link to="/" className="font-serif-bn font-black text-3xl tracking-tight">
            আমার <span className="text-accent">তালিম</span>
          </Link>
          <p className="text-sm text-background/60 mt-4 leading-relaxed max-w-xs">
            আরবী ভাষা, ইসলামিক জ্ঞান ও আধুনিক স্কিল নিয়ে বাংলা ভাষায় গভীর গবেষণাভিত্তিক ব্লগ।
          </p>
          <div className="flex items-center gap-4 mt-6">
            {["Facebook", "Twitter", "YouTube"].map((s) => (
              <a key={s} href="#" className="text-[11px] uppercase tracking-[0.18em] text-background/60 hover:text-accent transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-accent mb-4">বিভাগ</h4>
          <ul className="space-y-2.5 text-sm">
            {categories.filter((c) => c.id !== "all").slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link to={`/blogs?cat=${c.id}`} className="text-background/75 hover:text-accent transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-accent mb-4">দ্রুত লিঙ্ক</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/blogs" className="text-background/75 hover:text-accent">সব ব্লগ</Link></li>
            <li><Link to="/library" className="text-background/75 hover:text-accent">লাইব্রেরি</Link></li>
            <li><Link to="/qa" className="text-background/75 hover:text-accent">আপনার জিজ্ঞাসা</Link></li>
            <li><Link to="/auth" className="text-background/75 hover:text-accent">সাইন ইন</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-accent mb-4">নিউজলেটার</h4>
          <p className="text-sm text-background/70 mb-4 leading-relaxed">
            নতুন পোস্ট সরাসরি ইমেইলে পেতে সাবস্ক্রাইব করুন।
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 border-b border-background/20 focus-within:border-accent pb-2 transition-colors">
            <input
              type="email"
              required
              placeholder="আপনার ইমেইল"
              className="bg-transparent flex-1 text-sm text-background placeholder:text-background/40 focus:outline-none"
            />
            <button type="submit" className="text-accent text-xs font-black uppercase tracking-[0.18em] hover:text-background transition-colors">
              জয়েন →
            </button>
          </form>
        </div>
      </div>

      <div className="mt-14 pt-6 border-t border-background/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-background/50">
        <span>© {new Date().getFullYear()} আমার তালিম</span>
        <span className="flex items-center gap-3">
          <span className="text-accent">◆</span>
          বাংলা ব্লগ ও জ্ঞানভাণ্ডার
          <span className="text-accent">◆</span>
        </span>
        <span>সর্বস্বত্ব সংরক্ষিত</span>
      </div>
    </div>
  </footer>
);

export default EditorialFooter;

import { Link } from "@/lib/navigation";
import { Mail, Send } from "lucide-react";
import { Facebook, Youtube } from "@/components/shared/BrandIcons";
import logoAmarTalim from "@/assets/logo-amar-talim.png";

import SmartImage from "@/components/shared/SmartImage";
/**
 * SharedFooter
 * Site-wide footer. Pure presentational — no data fetching.
 * Newsletter form is a static UI placeholder; server action wires in later.
 */
const SharedFooter = () => {
  const year = new Date().getFullYear();

  const learn = [
    { to: "/courses", label: "সব কোর্স" },
    { to: "/library", label: "ডিজিটাল লাইব্রেরি" },
    { to: "/blogs", label: "ব্লগ" },
    { to: "/dashboard", label: "আমার ড্যাশবোর্ড" },
    { to: "/my-courses", label: "আমার কোর্স" },
    { to: "/orders", label: "অর্ডার ইতিহাস" },
    { to: "/reading-list", label: "রিডিং লিস্ট" },
  ];

  const company = [
    { to: "/about", label: "আমাদের সম্পর্কে" },
    { to: "/contact", label: "যোগাযোগ" },
    { to: "/faq", label: "প্রশ্নোত্তর" },
    { to: "/instructor", label: "শিক্ষক হোন" },
    { to: "/become-author", label: "লেখক হোন" },
  ];

  const legal = [
    { to: "/privacy", label: "গোপনীয়তা নীতি" },
    { to: "/terms", label: "ব্যবহারের শর্তাবলী" },
  ];

  return (
    <footer className="border-t border-foreground/10 bg-background mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand + newsletter */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <SmartImage src={logoAmarTalim} alt="আমার তালিম" className="h-10 w-auto" />
              <span className="font-serif-bn font-extrabold text-xl text-primary">
                আমার <span className="text-foreground">তালিম</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              ইসলামী শিক্ষার বিশ্বস্ত বাংলা প্ল্যাটফর্ম — কোর্স, বই ও জ্ঞানভাণ্ডার।
            </p>

            <form
              className="mt-5 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: server action — subscribeNewsletter(formData)
              }}
            >
              <label htmlFor="footer-newsletter" className="sr-only">
                ইমেইল
              </label>
              <input
                id="footer-newsletter"
                type="email"
                required
                placeholder="আপনার ইমেইল"
                className="flex-1 min-w-0 px-3 py-2 text-sm rounded-md border border-foreground/15 bg-background focus:border-primary outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Learn */}
          <FooterColumn title="শেখা" links={learn} />

          {/* Company */}
          <FooterColumn title="প্ল্যাটফর্ম" links={company} />

          {/* Legal + social */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4 font-serif-bn">আইনি</h3>
            <ul className="space-y-2.5">
              {legal.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-2">
              <SocialIcon href="https://facebook.com" label="Facebook">
                <Facebook className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="https://youtube.com" label="YouTube">
                <Youtube className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="mailto:hello@amartalim.com" label="Email">
                <Mail className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} আমার তালিম। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-xs text-muted-foreground">
            তৈরি হয়েছে দ্বীনের সেবায় ❤
          </p>
        </div>
      </div>
    </footer>
  );
};

interface FooterColumnProps {
  title: string;
  links: { to: string; label: string }[];
}

const FooterColumn = ({ title, links }: FooterColumnProps) => (
  <div>
    <h3 className="text-sm font-bold text-foreground mb-4 font-serif-bn">{title}</h3>
    <ul className="space-y-2.5">
      {links.map((l) => (
        <li key={l.to}>
          <Link
            to={l.to}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

interface SocialIconProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

const SocialIcon = ({ href, label, children }: SocialIconProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="p-2 rounded-full border border-foreground/10 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
  >
    {children}
  </a>
);

export default SharedFooter;

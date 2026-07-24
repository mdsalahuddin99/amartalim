"use client";

import { useState, useEffect } from "react";
import { Link } from "@/lib/navigation";
import { Mail, Send } from "lucide-react";
import logoAmarTalim from "@/assets/logo-amar-talim.png";

import SmartImage from "@/components/shared/SmartImage";
import { getHeaderFooterSettings } from "@/server/actions/site-settings.actions";

/**
 * SharedFooter
 * Site-wide footer. Pure presentational — no data fetching.
 * Newsletter form is a static UI placeholder; server action wires in later.
 */
const SharedFooter = () => {
  const year = new Date().getFullYear();
  
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getHeaderFooterSettings().then(res => {
      if (res) setSettings(res);
    });
  }, []);

  const sections = settings?.footerSections || [
    { url: "/blogs", label: "সব ব্লগ" },
    { url: "/qa", label: "আপনার জিজ্ঞাসা" },
    { url: "/login", label: "সাইন ইন" },
  ];

  const quickLinks = settings?.footerQuickLinks || [
    { url: "/privacy", label: "গোপনীয়তা নীতি" },
    { url: "/terms", label: "ব্যবহারের শর্তাবলী" },
    { url: "/contact", label: "যোগাযোগ" },
  ];

  const footerAbout = settings?.footerAbout || "আরবী ভাষা, ইসলামিক জ্ঞান ও আধুনিক স্কিল নিয়ে বাংলা ভাষায় গভীর গবেষণভিত্তিক ব্লগ।";
  
  const socialLinks = settings?.socialLinks || {
    facebook: "https://facebook.com/amartalim",
    youtube: "https://youtube.com/amartalim",
    twitter: "https://twitter.com/amartalim",
  };

  return (
    <footer className="bg-gradient-hero text-white/90 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand + Description + Socials */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              {settings?.footerLogo ? (
                <img src={settings.footerLogo} alt="আমার তালিম" className="h-10 w-auto" />
              ) : (
                <span className="font-bold text-2xl text-white">
                  আমার <span className="text-[#FFC107]">তালিম</span>
                </span>
              )}
            </Link>
            <p className="text-sm leading-relaxed mb-8 max-w-sm text-white/80">
              {footerAbout}
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold tracking-[0.15em] text-white/80">
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">FACEBOOK</a>}
              {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">TWITTER</a>}
              {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">YOUTUBE</a>}
            </div>
          </div>

          {/* Sections (বিভাগ) */}
          <FooterColumn title="বিভাগ" links={sections} />

          {/* Quick Links (দ্রুত লিংক) */}
          <FooterColumn title="দ্রুত লিংক" links={quickLinks} />

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-bold text-[#FFC107] mb-6">নিউজলেটার</h3>
            <p className="text-sm text-white/80 mb-4">
              নতুন পোস্ট সরাসরি ইমেইলে পেতে সাবস্ক্রাইব করুন।
            </p>
            <form
              className="flex items-center border-b border-white/20 pb-2 group focus-within:border-[#FFC107] transition-colors"
            >
              <input
                type="email"
                required
                placeholder="আপনার ইমেইল"
                className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/50 outline-none"
              />
              <button
                type="submit"
                className="text-[#FFC107] text-sm font-bold ml-2 hover:text-white transition-colors flex items-center gap-1"
              >
                জয়েন <span className="text-lg leading-none">&rarr;</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-16 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/60">
            © {year} আমার তালিম
          </p>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="text-[#FFC107] text-[10px]">◆</span>
            <span>বাংলা ব্লগ ও জ্ঞানভাণ্ডার</span>
            <span className="text-[#FFC107] text-[10px]">◆</span>
          </div>
          <p className="text-xs text-[#666666]">
            সর্বস্বত্ব সংরক্ষিত
          </p>
        </div>
      </div>
    </footer>
  );
};

interface FooterColumnProps {
  title: string;
  links: { url?: string; label: string; to?: string }[];
}

const FooterColumn = ({ title, links }: FooterColumnProps) => (
  <div>
    <h3 className="text-sm font-bold text-[#FFC107] mb-6">{title}</h3>
    <ul className="space-y-3">
      {links.map((l) => {
        const href = l.url || l.to || "#";
        return (
          <li key={href}>
            <Link
              to={href}
              className="text-sm text-[#CCCCCC] hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  </div>
);

export default SharedFooter;

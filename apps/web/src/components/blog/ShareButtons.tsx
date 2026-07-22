import { Link2, MessageCircle, Check } from "lucide-react";
import { Facebook, Linkedin, Twitter } from "@/components/shared/BrandIcons";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ShareButtons = ({ url, title }: { url: string; title: string }) => {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  const items = [
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "Twitter", icon: Twitter, href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` },
    { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: "WhatsApp", icon: MessageCircle, href: `https://api.whatsapp.com/send?text=${enc(title + " " + url)}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "লিংক কপি হয়েছে" });
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
        শেয়ার
      </span>
      {items.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${s.label}`}
          className="w-9 h-9 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors flex items-center justify-center"
        >
          <s.icon className="w-4 h-4" />
        </a>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={copy}
        className="h-9 rounded-full"
      >
        {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Link2 className="w-4 h-4 mr-1.5" />}
        {copied ? "কপি হয়েছে" : "লিংক কপি"}
      </Button>
    </div>
  );
};

export default ShareButtons;

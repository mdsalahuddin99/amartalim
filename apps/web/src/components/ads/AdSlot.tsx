import { useEffect, useState } from "react";
import { type AdSlot as AdSlotName, type AdItem, type AdsConfig, getAdsData } from "@/server/queries/ads.queries";
import { sanitizeAdSnippet } from "@/lib/sanitize";

import SmartImage from "@/components/shared/SmartImage";
declare global {
  interface Window { adsbygoogle?: unknown[]; }
}

interface Props {
  slot: AdSlotName;
  className?: string;
}

export const AdSlot = ({ slot, className }: Props) => {
  const [items, setItems] = useState<AdItem[]>([]);
  const [config, setConfig] = useState<AdsConfig>({ adsenseEnabled: false });

  useEffect(() => {
    getAdsData().then((res) => {
      setItems(res.items || []);
      setConfig(res.config || { adsenseEnabled: false });
    });
  }, []);

  const ads = items.filter((a) => a.slot === slot && a.enabled);

  useEffect(() => {
    if (!config.adsenseEnabled || !config.adsenseClientId) return;
    if (!document.querySelector('script[data-adsense]')) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsenseClientId}`;
      s.crossOrigin = "anonymous";
      s.setAttribute("data-adsense", "1");
      document.head.appendChild(s);
    }
    try {
      ads.filter((a) => a.kind === "adsense").forEach(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    } catch { /* noop */ }
  }, [ads, config]);

  if (ads.length === 0) return null;

  return (
    <div className={className}>
      {ads.map((ad) => {
        if (ad.kind === "adsense") {
          const client = ad.adClient || config.adsenseClientId;
          if (!client || !ad.adSlotId) return null;
          return (
            <ins
              key={ad.id}
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client={client}
              data-ad-slot={ad.adSlotId}
              data-ad-format={ad.format || "auto"}
              data-full-width-responsive="true"
            />
          );
        }
        if (ad.htmlSnippet) {
          return <div key={ad.id} dangerouslySetInnerHTML={{ __html: sanitizeAdSnippet(ad.htmlSnippet) }} />;
        }
        if (ad.imageUrl) {
          return (
            <a key={ad.id} href={ad.linkUrl || "#"} target="_blank" rel="noopener sponsored" className="block">
              <SmartImage src={ad.imageUrl} alt={ad.name} className="w-full h-auto rounded-lg" loading="lazy" />
              <div className="text-[10px] text-muted-foreground text-center mt-1">বিজ্ঞাপন</div>
            </a>
          );
        }
        return null;
      })}
    </div>
  );
};

export default AdSlot;

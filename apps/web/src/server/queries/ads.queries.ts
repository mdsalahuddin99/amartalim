import { prisma } from "../db/prisma";

export type AdSlot =
  | "header"
  | "homepage-top"
  | "homepage-middle"
  | "blog-archive-top"
  | "blog-detail-inline"
  | "blog-detail-bottom"
  | "sidebar";

export type AdKind = "manual" | "adsense";

export interface AdItem {
  id: string;
  name: string;
  slot: AdSlot;
  kind: AdKind;
  enabled: boolean;
  imageUrl?: string;
  linkUrl?: string;
  htmlSnippet?: string;
  adClient?: string;
  adSlotId?: string;
  format?: string;
  createdAt: string;
}

export interface AdsConfig {
  adsenseClientId?: string;
  adsenseEnabled: boolean;
}

export const SLOT_META: Record<AdSlot, { label: string; desc: string }> = {
  "header": { label: "হেডার", desc: "সাইটের শীর্ষে" },
  "homepage-top": { label: "হোমপেজ - উপরে", desc: "হিরোর নিচে" },
  "homepage-middle": { label: "হোমপেজ - মাঝে", desc: "সেকশনগুলোর মাঝে" },
  "blog-archive-top": { label: "ব্লগ আর্কাইভ - উপরে", desc: "/blogs পেজের শীর্ষে" },
  "blog-detail-inline": { label: "ব্লগ - ভেতরে", desc: "আর্টিকেলের মাঝে" },
  "blog-detail-bottom": { label: "ব্লগ - নিচে", desc: "আর্টিকেলের শেষে" },
  "sidebar": { label: "সাইডবার", desc: "ডান পাশের কলামে" },
};

export const getAdsData = async (): Promise<{ items: AdItem[]; config: AdsConfig }> => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "ads-content" },
    });
    if (!setting || !setting.value) {
      return { items: [], config: { adsenseEnabled: false } };
    }
    
    return setting.value as unknown as { items: AdItem[]; config: AdsConfig };
  } catch (error) {
    return { items: [], config: { adsenseEnabled: false } };
  }
};

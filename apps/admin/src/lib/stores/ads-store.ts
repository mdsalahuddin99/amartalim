"use client";
import { useEffect, useState } from "react";
import { driver, driverEvent } from "@/lib/data-driver";
import { api } from "@/lib/api-client";

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

/**
 * Ads store — backend-ready.
 * Items live under driver resource "ads"; the singleton config under "ads-config".
 * Mutations route through `api.*` → `/ads` mock (items) and `/ads/config` (config).
 */
const ITEMS_RES = "ads";
const CFG_RES = "ads-config";

const readItems = () => driver.list<AdItem>(ITEMS_RES);
const readCfg = (): AdsConfig => driver.readJson<AdsConfig>(CFG_RES, { adsenseEnabled: false });

export const adsStore = {
  getAll: () => readItems(),
  getConfig: () => readCfg(),
  bySlot: (slot: AdSlot) => readItems().filter((a) => a.slot === slot && a.enabled),
  create(input: Omit<AdItem, "id" | "createdAt">) {
    const a: AdItem = { ...input, id: `ad_${Date.now()}`, createdAt: new Date().toISOString() };
    void api.post("/ads", a).catch(() => {});
    return a;
  },
  update(id: string, patch: Partial<AdItem>) {
    void api.patch(`/ads/${id}`, patch).catch(() => {});
  },
  toggle(id: string) {
    void api.post(`/ads/${id}/toggle`).catch(() => {});
  },
  remove(id: string) {
    void api.del(`/ads/${id}`).catch(() => {});
  },
  saveConfig(c: AdsConfig) {
    void api.put("/ads/config", c).catch(() => {});
  },
};

export function useAds() {
  const [items, setItems] = useState<AdItem[]>(() => readItems());
  const [config, setConfig] = useState<AdsConfig>(() => readCfg());
  useEffect(() => {
    const refresh = () => {
      setItems(readItems());
      setConfig(readCfg());
    };
    refresh();
    const u1 = driver.subscribe(ITEMS_RES, refresh);
    const u2 = driver.subscribe(CFG_RES, refresh);
    return () => {
      u1();
      u2();
    };
  }, []);
  void driverEvent;
  return { items, config };
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

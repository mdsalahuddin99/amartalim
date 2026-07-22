import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { AdItem, AdsConfig } from "@/lib/stores/ads-store";

const ITEMS = "ads";
const CFG = "ads-config";
const read = () => driver.list<AdItem>(ITEMS);
const write = (xs: AdItem[]) => driver.save(ITEMS, xs);

export const registerAdsMocks = () => {
  registerMock("GET", /^\/ads$/, () => ok(read()));

  registerMock("POST", /^\/ads$/, (req) => {
    const a = req.body as AdItem;
    write([a, ...read()]);
    return ok(a);
  });

  registerMock("PATCH", /^\/ads\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    const patch = (req.body ?? {}) as Partial<AdItem>;
    let out: AdItem | null = null;
    write(
      read().map((a) => {
        if (a.id !== id) return a;
        out = { ...a, ...patch };
        return out;
      }),
    );
    return ok(out);
  });

  registerMock("POST", /^\/ads\/[^/]+\/toggle$/, (req) => {
    const id = req.path.split("/")[2];
    let out: AdItem | null = null;
    write(
      read().map((a) => {
        if (a.id !== id) return a;
        out = { ...a, enabled: !a.enabled };
        return out;
      }),
    );
    return ok(out);
  });

  registerMock("DELETE", /^\/ads\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    write(read().filter((a) => a.id !== id));
    return ok(null);
  });

  registerMock("GET", /^\/ads\/config$/, () =>
    ok(driver.readJson<AdsConfig>(CFG, { adsenseEnabled: false })),
  );
  registerMock("PUT", /^\/ads\/config$/, (req) => {
    const cfg = req.body as AdsConfig;
    driver.writeJson<AdsConfig>(CFG, cfg);
    return ok(cfg);
  });
};

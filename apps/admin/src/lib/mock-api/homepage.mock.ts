import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import { HOMEPAGE_DEFAULTS, type HomepageContent } from "@/lib/stores/homepage-store";

const RES = "homepage-content";

const read = (): HomepageContent => {
  const v = driver.readJson<HomepageContent | null>(RES, null as never);
  if (!v) return HOMEPAGE_DEFAULTS;
  return {
    counters: { ...HOMEPAGE_DEFAULTS.counters, ...(v.counters || {}) },
    categories: { ...HOMEPAGE_DEFAULTS.categories, ...(v.categories || {}) },
    testimonials: { ...HOMEPAGE_DEFAULTS.testimonials, ...(v.testimonials || {}) },
    partners: { ...HOMEPAGE_DEFAULTS.partners, ...(v.partners || {}) },
  };
};

export const registerHomepageMocks = () => {
  registerMock("GET", /^\/homepage$/, () => ok(read()));
  registerMock("PUT", /^\/homepage$/, (req) => {
    const c = req.body as HomepageContent;
    driver.writeJson<HomepageContent>(RES, c);
    return ok(c);
  });
  registerMock("DELETE", /^\/homepage$/, () => {
    driver.writeJson<HomepageContent>(RES, HOMEPAGE_DEFAULTS);
    return ok(HOMEPAGE_DEFAULTS);
  });
};

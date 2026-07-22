import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import { PRICING_DEFAULTS, type PricingContent } from "@/lib/stores/pricing-store";

const RES = "pricing-content";

const read = (): PricingContent => {
  const v = driver.readJson<PricingContent | null>(RES, null as never);
  if (!v) return PRICING_DEFAULTS;
  return {
    ...PRICING_DEFAULTS,
    ...v,
    plans: v.plans ?? PRICING_DEFAULTS.plans,
    faqs: v.faqs ?? PRICING_DEFAULTS.faqs,
  };
};

export const registerPricingMocks = () => {
  registerMock("GET", /^\/pricing$/, () => ok(read()));
  registerMock("PUT", /^\/pricing$/, (req) => {
    const c = req.body as PricingContent;
    driver.writeJson<PricingContent>(RES, c);
    return ok(c);
  });
  registerMock("DELETE", /^\/pricing$/, () => {
    driver.writeJson<PricingContent>(RES, PRICING_DEFAULTS);
    return ok(PRICING_DEFAULTS);
  });
};

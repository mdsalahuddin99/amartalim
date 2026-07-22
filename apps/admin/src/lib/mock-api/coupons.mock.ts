import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { Coupon } from "@/types/order";

const RES = "coupons";
const read = () => driver.list<Coupon>(RES);
const write = (xs: Coupon[]) => driver.save(RES, xs);

export const registerCouponsMocks = () => {
  registerMock("GET", /^\/coupons$/, () => ok(read()));
  registerMock("POST", /^\/coupons$/, (req) => {
    const c = req.body as Coupon;
    write([...read().filter((x) => x.code !== c.code), c]);
    return ok(c);
  });
  registerMock("DELETE", /^\/coupons\/[^/]+$/, (req) => {
    const code = decodeURIComponent(req.path.split("/").pop()!);
    write(read().filter((x) => x.code !== code));
    return ok(null);
  });
};

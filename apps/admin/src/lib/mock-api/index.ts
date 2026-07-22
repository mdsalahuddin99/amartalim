/**
 * Mock API handler registry.
 *
 * Today (Vite preview): each `register*Mocks()` registers fetch interceptors
 * that read/write localStorage (via the shared `driver`) and return the
 * standard `{ data, error, meta }` envelope — so `api.get("/orders")` works
 * locally without a server.
 *
 * After Next.js migration:
 *   1. Delete this file (and `src/lib/mock-api/`).
 *   2. Remove the `registerMocks()` call from `src/main.tsx`.
 *   3. `api.get` / `api.post` will hit the real `/api/...` routes.
 */
import { registerOrdersMocks } from "./orders.mock";
import { registerNotificationsMocks } from "./notifications.mock";
import { registerBookmarksMocks } from "./bookmarks.mock";
import { registerNotesMocks } from "./notes.mock";
import { registerProgressMocks } from "./progress.mock";
import { registerCommentsMocks } from "./comments.mock";
import { registerCouponsMocks } from "./coupons.mock";
import { registerAuthorsMocks } from "./authors.mock";
import { registerBlogsMocks } from "./blogs.mock";
import { registerBlogCategoriesMocks } from "./blog-categories.mock";
import { registerAdsMocks } from "./ads.mock";
import { registerEnrollmentsMocks } from "./enrollments.mock";
import { registerBooksMocks } from "./books.mock";
import { registerWishlistMocks } from "./wishlist.mock";
import { registerPricingMocks } from "./pricing.mock";
import { registerHomepageMocks } from "./homepage.mock";
import { registerDiscussionsMocks } from "./discussions.mock";
import { registerLeaderboardMocks } from "./leaderboard.mock";


let installed = false;

export const registerMocks = () => {
  if (installed) return;
  installed = true;
  registerOrdersMocks();
  registerNotificationsMocks();
  registerBookmarksMocks();
  registerNotesMocks();
  registerProgressMocks();
  registerCommentsMocks();
  registerCouponsMocks();
  registerAuthorsMocks();
  registerBlogsMocks();
  registerBlogCategoriesMocks();
  registerAdsMocks();
  registerEnrollmentsMocks();
  registerBooksMocks();
  registerWishlistMocks();
  registerPricingMocks();
  registerHomepageMocks();
  registerDiscussionsMocks();
  registerLeaderboardMocks();
};


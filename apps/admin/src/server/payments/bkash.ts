/**
 * bKash tokenized checkout — server-side placeholder.
 * Migrate to Next.js route handlers under src/app/api/payments/bkash/.
 */
export interface BkashCreatePayload {
  amount: number;
  invoice: string;
  callbackURL: string;
}
export interface BkashCreateResult {
  paymentID: string;
  bkashURL: string;
}

export const createBkashPayment = async (
  _payload: BkashCreatePayload,
): Promise<BkashCreateResult> => {
  throw new Error("[bkash] Implement after Next.js migration.");
};

export const executeBkashPayment = async (_paymentID: string) => {
  throw new Error("[bkash] Implement after Next.js migration.");
};

/**
 * Nagad payment — server-side placeholder.
 */
export interface NagadCreatePayload {
  amount: number;
  invoice: string;
  callbackURL: string;
}

export const createNagadPayment = async (_p: NagadCreatePayload) => {
  throw new Error("[nagad] Implement after Next.js migration.");
};

export const verifyNagadPayment = async (_paymentRefId: string) => {
  throw new Error("[nagad] Implement after Next.js migration.");
};

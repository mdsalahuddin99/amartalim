/**
 * ZiniPay aggregator — server-side placeholder.
 */
export interface ZiniPayCreatePayload {
  amount: number;
  invoice: string;
  customerName: string;
  customerEmail: string;
  redirectURL: string;
}

export const createZiniPayPayment = async (_p: ZiniPayCreatePayload) => {
  throw new Error("[zinipay] Implement after Next.js migration.");
};

export const handleZiniPayIPN = async (_body: unknown) => {
  throw new Error("[zinipay] Implement after Next.js migration.");
};

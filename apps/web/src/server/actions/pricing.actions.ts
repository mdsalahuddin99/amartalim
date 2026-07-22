import { prisma } from "../db/prisma";
import { getPricingContent } from "../queries/pricing.queries";
import { revalidatePath } from "next/cache";

export async function updatePricingContent(data: any) {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "pricing-content" },
      update: { value: data },
      create: { key: "pricing-content", value: data },
    });
    
    revalidatePath("/pricing");
    revalidatePath("/admin/pricing");
    
    return { ok: true };
  } catch (error) {
    console.error("[UPDATE_PRICING]", error);
    return { ok: false, error: "Failed to update pricing" };
  }
}

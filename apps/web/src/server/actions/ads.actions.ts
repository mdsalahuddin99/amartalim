"use server";

import { prisma } from "../db/prisma";
import { revalidatePath } from "next/cache";

export async function updateAdsData(data: any) {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "ads-content" },
      update: { value: data },
      create: { key: "ads-content", value: data },
    });
    
    revalidatePath("/");
    revalidatePath("/admin/ads");
    // Optionally revalidate other paths where ads appear
    
    return { ok: true };
  } catch (error) {
    console.error("[UPDATE_ADS]", error);
    return { ok: false, error: "Failed to update ads content" };
  }
}

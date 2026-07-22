/**
 * Cloudinary helpers — placeholder.
 *
 * After Next.js migration:
 *   import { v2 as cloudinary } from "cloudinary";
 *   cloudinary.config({ cloud_name, api_key, api_secret });
 */
export const cloudinaryConfig = {
  cloudName: import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME ?? "",
};

export const buildCloudinaryUrl = (
  publicId: string,
  opts: { w?: number; h?: number; q?: "auto" | number } = {},
) => {
  const { cloudName } = cloudinaryConfig;
  if (!cloudName) return publicId;
  const tx: string[] = [];
  if (opts.w) tx.push(`w_${opts.w}`);
  if (opts.h) tx.push(`h_${opts.h}`);
  tx.push(`q_${opts.q ?? "auto"}`, "f_auto");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${tx.join(",")}/${publicId}`;
};

import { forwardRef, type ImgHTMLAttributes } from "react";
import type { StaticImageData } from "next/image";

/**
 * SmartImage — `<img>` wrapper with a `next/image`-compatible prop surface.
 *
 * Today: renders a plain `<img>` (Vite has no image optimizer).
 * After Next.js migration: rewrite this file to render `next/image`'s `<Image>`
 * — every call site keeps working.
 *
 * Pass `priority` for above-the-fold LCP candidates (sets eager loading +
 * high fetchpriority). Otherwise defaults to lazy + auto. An explicit
 * `loading` / `fetchPriority` prop always wins over the `priority` shortcut.
 */
export interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const SmartImage = forwardRef<HTMLImageElement, SmartImageProps>(
  ({ src, alt, width, height, priority, loading, fetchPriority, decoding = "async", ...rest }, ref) => {
    const actualSrc = typeof src === "object" && src !== null && "src" in src ? (src as any).src : src;
    return (
      <img
        ref={ref}
        src={actualSrc as string}
        alt={alt}
        width={width}
        height={height}
        loading={loading ?? (priority ? "eager" : "lazy")}
        fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
        decoding={decoding}
        {...rest}
      />
    );
  }
);
SmartImage.displayName = "SmartImage";

export default SmartImage;

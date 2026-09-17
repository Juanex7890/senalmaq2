interface CloudinaryLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom next/image loader. Cloudinary does the resizing/format conversion
 * (f_auto, q_auto) on its own CDN, so Next never calls the built-in
 * /_next/image optimizer (which runs on Vercel and counts against its quota).
 * Non-Cloudinary sources (local /public assets, legacy pasted URLs from
 * before this store used Cloudinary) are returned untouched — there is
 * nothing safe to rewrite them with, and serving them as-is beats risking
 * broken images by routing arbitrary third-party URLs through Cloudinary's
 * fetch delivery, which isn't guaranteed to work for every source (some
 * hosts block hotlinking/proxy fetches, rate-limit, etc.).
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: CloudinaryLoaderParams): string {
  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return src;
  }

  // q_auto lets Cloudinary pick the best perceptual quality per image, which
  // beats a fixed number — so an explicit `quality` prop is only honored if
  // someone deliberately overrides Next's default of 75.
  const transformations = [
    "f_auto",
    quality && quality !== 75 ? `q_${quality}` : "q_auto",
    `w_${width}`,
    "dpr_auto",
    "c_limit",
  ].join(",");

  return src.replace("/upload/", `/upload/${transformations}/`);
}

interface CloudinaryLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

function buildTransformations(width: number, quality?: number): string {
  // q_auto lets Cloudinary pick the best perceptual quality per image, which
  // beats a fixed number — so an explicit `quality` prop is only honored if
  // someone deliberately overrides Next's default of 75.
  return [
    "f_auto",
    quality && quality !== 75 ? `q_${quality}` : "q_auto",
    `w_${width}`,
    "dpr_auto",
    "c_limit",
  ].join(",");
}

/**
 * Custom next/image loader. Cloudinary does all resizing/format conversion
 * on its own CDN, so Next never calls the built-in /_next/image optimizer
 * (which runs on Vercel and counts against its quota).
 *
 * - Images already uploaded to Cloudinary get transformations appended
 *   directly to their /upload/ URL.
 * - Any other absolute URL (legacy product photos hosted elsewhere, e.g.
 *   i.postimg.cc, or old local files served from an absolute site URL) is
 *   routed through Cloudinary's "fetch" delivery, which downloads, resizes
 *   and caches an arbitrary remote image on the fly — so images that were
 *   never re-uploaded still get optimized instead of being served at full
 *   original size.
 * - Local dev URLs (localhost) and root-relative /public paths are left
 *   untouched: Cloudinary can't reach a dev server, and /public assets are
 *   already small, controlled files.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: CloudinaryLoaderParams): string {
  const transformations = buildTransformations(width, quality);

  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/${transformations}/`);
  }

  if (src.startsWith("/") || src.includes("localhost") || src.includes("127.0.0.1")) {
    return src;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    return src;
  }

  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${src}`;
}

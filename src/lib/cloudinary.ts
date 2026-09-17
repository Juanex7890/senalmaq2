const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 2400; // px, longest side
const JPEG_QUALITY = 0.85;

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
}

/**
 * Re-encodes the file to a JPEG via canvas before it ever reaches Cloudinary.
 * This is what actually fixes "invalid image" upload failures: phone photos
 * (HEIC, oddly-tagged JPEGs, huge multi-megapixel originals) get normalized
 * into a format every account/preset accepts, and the resize is a free
 * bonus for upload speed. GIFs are passed through untouched so animation
 * survives; everything else that fails to decode gets a clear message
 * instead of a cryptic Cloudinary error.
 */
async function normalizeImageFile(file: File): Promise<File> {
  if (file.type === "image/gif") {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "No pudimos leer esta imagen (formato no compatible, por ejemplo HEIC de iPhone). Expórtala como JPG o PNG e intenta de nuevo."
    );
  }

  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) {
      return file;
    }

    const newName = file.name.replace(/\.[^./\\]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

/**
 * Uploads an image straight from the browser to Cloudinary using an unsigned
 * upload preset, so no server round-trip (and no Vercel function time) is
 * spent moving the file. Further resizing/format optimization for display
 * happens on read, via the Cloudinary URL transformations in
 * `cloudinary-loader.ts` — the normalization here is just to make sure the
 * upload itself succeeds.
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary no está configurado. Define NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const looksLikeImage = file.type.startsWith("image/") || file.type === "";
  if (!looksLikeImage) {
    throw new Error("El archivo seleccionado no es una imagen.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("La imagen no puede pesar más de 10MB.");
  }

  const uploadFile = await normalizeImageFile(file);

  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "senalmaq/products");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.error?.message || "No se pudo subir la imagen a Cloudinary."
    );
  }

  const data = await response.json();
  return data.secure_url as string;
}

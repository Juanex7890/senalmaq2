"use client";

import { useEffect, useRef, useState } from "react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

interface ProductImageUploaderProps {
  value: string;
  index: number;
  disabled?: boolean;
  canRemove: boolean;
  altLabel: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onUploaded?: () => void;
}

function isValidImageUrl(value: string) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProductImageUploader({
  value,
  index,
  disabled,
  canRemove,
  altLabel,
  onChange,
  onRemove,
  onUploaded,
}: ProductImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(() => !isValidImageUrl(value));
  const [pendingUploadUrl, setPendingUploadUrl] = useState<string | null>(null);

  const trimmedValue = typeof value === "string" ? value.trim() : "";
  const hasPreview = isValidImageUrl(trimmedValue);

  // Wait for `value` to actually reflect the upload before saving: calling
  // onUploaded right after onChange would still see the parent's stale
  // draft state, since React hasn't re-rendered with it yet.
  useEffect(() => {
    if (pendingUploadUrl !== null && value === pendingUploadUrl) {
      setPendingUploadUrl(null);
      onUploaded?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pendingUploadUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadImageToCloudinary(file);
      setShowUrlInput(false);
      setPendingUploadUrl(url);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white/60 p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="group relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-200 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed"
        >
          {hasPreview ? (
            <img
              src={trimmedValue}
              alt={`${altLabel} ${index + 1}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-1 text-center">Sin imagen</span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-center text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
            {uploading ? "Subiendo..." : "Subir imagen"}
          </span>
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[11px] font-semibold text-white">
              Subiendo...
            </span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="inline-flex items-center rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Subiendo..." : hasPreview ? "Cambiar imagen" : "Subir imagen"}
          </button>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          {showUrlInput ? (
            <input
              type="url"
              value={value ?? ""}
              onChange={(event) => onChange(event.target.value)}
              onBlur={onUploaded}
              placeholder="https://..."
              disabled={disabled}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              disabled={disabled}
              className="text-xs font-medium text-slate-500 underline-offset-2 transition hover:text-slate-700 hover:underline"
            >
              O pega el enlace de una imagen
            </button>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onRemove}
              disabled={!canRemove || disabled}
              className="text-xs font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Eliminar imagen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

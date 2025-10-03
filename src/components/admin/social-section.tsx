"use client";

import { useState } from "react";
import { SocialData } from "@/lib/firebase";

interface SocialSectionProps {
  socialDraft: SocialData;
  socialLoading: boolean;
  socialSaving: boolean;
  socialError: string;
  shortSavingIndex: number | "new" | null;
  shortDeletingIndex: number | null;
  shortInput: string;
  onSocialFieldChange: (field: keyof SocialData) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveSocialFields: (event: React.FormEvent) => Promise<void>;
  onShortChange: (index: number, value: string) => void;
  onShortSave: (index: number) => Promise<void>;
  onShortDelete: (index: number) => Promise<void>;
  onAddShort: (event: React.FormEvent) => Promise<void>;
  onShortInputChange: (value: string) => void;
  onHeroImageChange: (images: string[]) => void;
}

export default function SocialSection({
  socialDraft,
  socialLoading,
  socialSaving,
  socialError,
  shortSavingIndex,
  shortDeletingIndex,
  shortInput,
  onSocialFieldChange,
  onSaveSocialFields,
  onShortChange,
  onShortSave,
  onShortDelete,
  onAddShort,
  onShortInputChange,
  onHeroImageChange,
}: SocialSectionProps) {
  const socialDisabled = socialLoading || socialSaving;

  return (
    <>
      {/* Hero Images Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-green-800">Imágenes del Hero</h2>
          <span className="text-xs text-slate-500">
            {Array.isArray(socialDraft.heroImages) ? `${socialDraft.heroImages.length} imágenes` : "Sin imágenes"}
          </span>
        </div>
        {socialLoading ? (
          <div className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
            Cargando imágenes...
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.isArray(socialDraft.heroImages) && socialDraft.heroImages.length > 0 ? (
                socialDraft.heroImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Hero image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => {
                        const newImages = socialDraft.heroImages?.filter((_, i) => i !== index) || [];
                        onHeroImageChange(newImages);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      disabled={socialDisabled}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                  Aún no hay imágenes del hero.
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Agregar imagen del hero
              </label>
              <input
                type="url"
                placeholder="URL de la imagen (ej: https://example.com/image.jpg)"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
                disabled={socialDisabled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const url = input.value.trim();
                    if (url) {
                      const currentImages = socialDraft.heroImages || [];
                      onHeroImageChange([...currentImages, url]);
                      input.value = '';
                    }
                  }
                }}
              />
              <p className="text-xs text-slate-500">
                Presiona Enter para agregar la imagen, o usa el botón de subir archivos más abajo.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-green-800">Video principal y redes</h2>
          <span className="text-xs text-slate-500">
            {socialLoading ? "Cargando datos..." : "Actualiza los enlaces visibles en la página principal."}
          </span>
        </div>
        {socialError && (
          <div className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
            {socialError}
          </div>
        )}
        <form onSubmit={onSaveSocialFields} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Video principal (ID de YouTube)
            <input
              type="text"
              value={socialDraft.videoId || ""}
              onChange={onSocialFieldChange("videoId")}
              placeholder="Ej: JzGMhsTBoWM"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
              disabled={socialDisabled}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Canal de YouTube
            <input
              type="url"
              value={socialDraft.youtube || ""}
              onChange={onSocialFieldChange("youtube")}
              placeholder="https://www.youtube.com/@senalmaqcoser"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
              disabled={socialDisabled}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Instagram
            <input
              type="url"
              value={socialDraft.instagram || ""}
              onChange={onSocialFieldChange("instagram")}
              placeholder="https://www.instagram.com/..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
              disabled={socialDisabled}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            TikTok
            <input
              type="url"
              value={socialDraft.tiktok || ""}
              onChange={onSocialFieldChange("tiktok")}
              placeholder="https://www.tiktok.com/@..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
              disabled={socialDisabled}
            />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={socialDisabled}
            >
              {socialSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-green-800">Shorts de YouTube</h2>
          <span className="text-xs text-slate-500">
            {Array.isArray(socialDraft.shorts) ? `${socialDraft.shorts.length} guardados` : "Sin shorts"}
          </span>
        </div>
        {socialLoading ? (
          <div className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
            Cargando shorts...
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              {Array.isArray(socialDraft.shorts) && socialDraft.shorts.length > 0 ? (
                socialDraft.shorts.map((shortId, index) => {
                  const saving = shortSavingIndex === index && socialSaving;
                  const removing = shortDeletingIndex === index;
                  const disabled = socialDisabled || removing;
                  return (
                    <div
                      key={`${shortId}-${index}`}
                      className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            ID del short
                          </label>
                          <input
                            type="text"
                            value={shortId || ""}
                            onChange={(event) => onShortChange(index, event.target.value)}
                            placeholder="Ej: JzGMhsTBoWM"
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            disabled={socialDisabled}
                          />
                        </div>
                        <div className="flex gap-2 md:self-end">
                          <button
                            type="button"
                            onClick={() => onShortSave(index)}
                            className="inline-flex items-center rounded-xl bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={disabled}
                          >
                            {saving ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onShortDelete(index)}
                            className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={disabled}
                          >
                            {removing ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                  Aún no hay shorts guardados.
                </div>
              )}
            </div>

            <form onSubmit={onAddShort} className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nuevo short
                </label>
                <input
                  type="text"
                  value={shortInput}
                  onChange={(event) => onShortInputChange(event.target.value)}
                  placeholder="ID de YouTube"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  disabled={socialDisabled}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={socialDisabled}
              >
                {shortSavingIndex === "new" && socialSaving ? "Agregando..." : "Agregar short"}
              </button>
            </form>
          </>
        )}
      </section>
    </>
  );
}

"use client";
import { SocialData } from "@/lib/firebase";
import SectionHeader from "./section-header";
import { Share2, Save, Loader2 } from "lucide-react";

interface SocialSectionProps {
  socialDraft: SocialData;
  socialLoading: boolean;
  socialSaving: boolean;
  socialError: string;
  onSocialFieldChange: (field: keyof SocialData) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveSocialFields: (event: React.FormEvent) => Promise<void>;
}

export default function SocialSection({
  socialDraft,
  socialLoading,
  socialSaving,
  socialError,
  onSocialFieldChange,
  onSaveSocialFields,
}: SocialSectionProps) {
  const socialDisabled = socialLoading || socialSaving;

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          icon={<Share2 className="h-5 w-5" />}
          iconClassName="bg-sky-100 text-sky-700"
          title="Video principal y redes"
          subtitle={
            socialLoading
              ? "Cargando datos..."
              : "Actualiza los enlaces visibles en la página principal"
          }
        />
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
          <label className="block text-sm font-semibold text-slate-700">
            WhatsApp
            <input
              type="url"
              value={socialDraft.whatsapp || ''}
              onChange={onSocialFieldChange('whatsapp')}
              placeholder="https://wa.me/57..."
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
              {socialSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {socialSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </section>

    </>
  );
}

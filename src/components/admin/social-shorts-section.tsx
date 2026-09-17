"use client";

import { FormEvent } from "react";

import { SocialData } from "@/lib/firebase";
import SectionHeader from "./section-header";
import { Youtube, Plus, Save, Trash2, Loader2 } from "lucide-react";

interface SocialShortsSectionProps {
  socialDraft: SocialData;
  socialLoading: boolean;
  socialSaving: boolean;
  shortSavingIndex: number | "new" | null;
  shortDeletingIndex: number | null;
  shortInput: string;
  onShortChange: (index: number, value: string) => void;
  onShortSave: (index: number) => Promise<void>;
  onShortDelete: (index: number) => Promise<void>;
  onAddShort: (event: FormEvent) => Promise<void>;
  onShortInputChange: (value: string) => void;
}

export default function SocialShortsSection({
  socialDraft,
  socialLoading,
  socialSaving,
  shortSavingIndex,
  shortDeletingIndex,
  shortInput,
  onShortChange,
  onShortSave,
  onShortDelete,
  onAddShort,
  onShortInputChange,
}: SocialShortsSectionProps) {
  const socialDisabled = socialLoading || socialSaving;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeader
        icon={<Youtube className="h-5 w-5" />}
        iconClassName="bg-red-100 text-red-600"
        title="Shorts de YouTube"
        subtitle={
          Array.isArray(socialDraft.shorts) ? `${socialDraft.shorts.length} guardados` : "Sin shorts"
        }
      />
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
                          className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={disabled}
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          {saving ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onShortDelete(index)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={disabled}
                        >
                          <Trash2 className="h-4 w-4" />
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={socialDisabled}
            >
              {shortSavingIndex === "new" && socialSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {shortSavingIndex === "new" && socialSaving ? "Agregando..." : "Agregar short"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

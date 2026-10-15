// src/app/components/menus/SettingsMenu.tsx
"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import MenuContainer from "./MenuContainer";
import { useAstroChartSettings } from "@/hooks/useAstroChartSettings";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useProfiles } from "@/contexts/ProfilesContext";
import type { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";
import { IoClose } from "react-icons/io5";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";

const PROFILE_ID_PATTERN = /^zazastro:profile-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MANUAL_TIPS = [
  { title: "settings.tipIsolateTitle", description: "settings.tipIsolateDescription", image: "/tips/isolate-planet.png", imageAlt: "settings.tipIsolateImageAlt" },
  { title: "settings.tipTooltipTitle", description: "settings.tipTooltipDescription", image: "/tips/tooltip.png", imageAlt: "settings.tipTooltipImageAlt" },
  { title: "settings.tipHouseCuspTitle", description: "settings.tipHouseCuspDescription", image: "/tips/house-cusp.png", imageAlt: "settings.tipHouseCuspImageAlt" },
  { title: "settings.tipFixedStarsTitle", description: "settings.tipFixedStarsDescription", image: "/tips/fixed-stars.png", imageAlt: "settings.tipFixedStarsImageAlt" },
  { title: "settings.tipIsolateAspectTitle", description: "settings.tipIsolateAspectDescription", image: "/tips/isolate-aspect.png", imageAlt: "settings.tipIsolateAspectImageAlt" },
  { title: "settings.tipAspectTableTitle", description: "settings.tipAspectTableDescription", image: "/tips/aspects-table.png", imageAlt: "settings.tipAspectTableImageAlt" },
  { title: "settings.tipCustomLotTitle", description: "settings.tipCustomLotDescription", image: "/tips/custom-lot.png", imageAlt: "settings.tipCustomLotImageAlt" },
  { title: "settings.tipLotCalculationTitle", description: "settings.tipLotCalculationDescription", image: "/tips/lot-calculation.png", imageAlt: "settings.tipLotCalculationImageAlt" },
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProfile(value: unknown): value is BirthChartProfile {
  if (!isRecord(value) || typeof value.id !== "string" || !PROFILE_ID_PATTERN.test(value.id)) return false;
  if (value.name !== undefined && typeof value.name !== "string") return false;
  if (value.gender !== undefined && !["male", "female", "event"].includes(String(value.gender))) return false;

  if (value.birthDate !== undefined) {
    const date = value.birthDate;
    if (!isRecord(date)) return false;
    const coordinates = date.coordinates;
    if (!isRecord(coordinates)) return false;
    if (typeof date.day !== "number" || typeof date.month !== "number" || typeof date.year !== "number" || typeof date.time !== "string") return false;
    if (typeof coordinates.latitude !== "number" || typeof coordinates.longitude !== "number") return false;
  }

  return true;
}

export default function SettingsMenu() {
  const t = useTranslations();
  const { settings, updateSettings } = useAstroChartSettings();
  const { profiles, importProfiles, deleteAllProfiles } = useProfiles();
  const { isMobileBreakPoint } = useScreenDimensions();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState("");
  const [importStatusType, setImportStatusType] = useState<"success" | "error">("success");
  const [isProfileDataMenuOpen, setIsProfileDataMenuOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<"about" | "manual" | null>(null);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const activeTip = MANUAL_TIPS[activeTipIndex];

  useEffect(() => {
    if (!infoModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInfoModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [infoModal]);

  const toggleTerms = (term: "egyptian" | "ptolemaic" | null) => {
    updateSettings({termsType: term === settings.termsType ? null : term})
  }

  const exportProfiles = () => {
    const exportData = {
      format: "zazastro-profiles",
      version: 1,
      profiles,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zazastro-profiles-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importProfilesFromFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(await file.text());
      } catch {
        setImportStatusType("error");
        setImportStatus(t("settings.importInvalidJson"));
        return;
      }

      if (!isRecord(parsed) || parsed.format !== "zazastro-profiles" || parsed.version !== 1 || !Array.isArray(parsed.profiles) || !parsed.profiles.every(isProfile)) {
        setImportStatusType("error");
        setImportStatus(t("settings.importInvalidFormat"));
        return;
      }

      const result = importProfiles(parsed.profiles);
      setImportStatusType("success");
      setImportStatus(t("settings.importSummary", result));
    } catch {
      setImportStatusType("error");
      setImportStatus(t("settings.importFailed"));
    } finally {
      input.value = "";
    }
  };

  const handleDeleteAllProfiles = () => {
    if (!window.confirm(t("settings.deleteAllConfirm", { count: profiles.length }))) return;
    const deleted = deleteAllProfiles();
    setImportStatusType("success");
    setImportStatus(t("settings.deleteAllSummary", { count: deleted }));
  };

  return (
    <MenuContainer
      titleKey="settings.title"
      onBack={isProfileDataMenuOpen ? () => setIsProfileDataMenuOpen(false) : undefined}
    >
      {() => (
        <div className="w-full flex flex-col gap-4 text-sm text-zinc-700">
          {isProfileDataMenuOpen ? (
            <>
              <section className="flex flex-col gap-3">
                <h2 className="font-semibold text-zinc-800">{t("settings.profileDataTitle")}</h2>
                <p>{t("settings.profileDataDescription")}</p>
                <div className="flex w-full flex-row items-center justify-center gap-2">
                  <button type="button" className="default-btn min-w-0 flex-1" onClick={() => importInputRef.current?.click()}>
                    {t(isMobileBreakPoint() ? "settings.importProfilesMobile" : "settings.importProfiles")}
                  </button>
                  <button type="button" className="default-btn min-w-0 flex-1" onClick={exportProfiles} disabled={profiles.length === 0}>
                    {t(isMobileBreakPoint() ? "settings.exportProfilesMobile" : "settings.exportProfiles")}
                  </button>
                </div>
                <button type="button" className="default-btn w-full" onClick={handleDeleteAllProfiles} disabled={profiles.length === 0}>
                  {t("settings.deleteAllProfiles")}
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={importProfilesFromFile}
                />
                {importStatus && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 ${importStatusType === "success" ? "border-green-500 bg-green-50 text-green-900" : "border-red-500 bg-red-50 text-red-900"}`}
                  >
                    {importStatusType === "error" && (
                      <Image src="/warning.png" alt="" width={20} height={20} unoptimized className="shrink-0" />
                    )}
                    {importStatus}
                  </p>
                )}
              </section>
            </>
          ) : (
            <>
          <div className="flex flex-col gap-2">
            <label className="flex flex-row items-center gap-2">
              {/* <input
                type="checkbox"
                className="accent-zinc-700 w-4 h-4"
                checked={settings.showFixedStars}
                onChange={(e) => updateSettings({ showFixedStars: e.target.checked })}
              /> */}
              {t("settings.showFixedStars")}
            </label>

              <div className="flex flex-col gap-2 pl-6 border-l-2 border-zinc-200 ml-2">
                <label className="flex flex-row items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-zinc-700 w-4 h-4"
                    checked={settings.showEssentialFixedStars}
                    onChange={(e) => updateSettings({ showEssentialFixedStars: e.target.checked })}
                  />
                  {t("settings.essentialFixedStars")}
                </label>
                <label className="flex flex-row items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-zinc-700 w-4 h-4"
                    checked={settings.showSecondaryFixedStars}
                    onChange={(e) => updateSettings({ showSecondaryFixedStars: e.target.checked })}
                  />
                  {t("settings.secondaryFixedStars")}
                </label>
              </div>
            {/* {settings.showFixedStars && (
            )} */}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex flex-row items-center gap-2">
              {/* <input
                type="checkbox"
                className="accent-zinc-700 w-4 h-4"
                checked={settings.showTerms}
                onChange={(e) => updateSettings({ showTerms: e.target.checked })}
              /> */}
              {t("settings.showTerms")}
            </label>

              <div className="flex flex-col gap-2 pl-6 border-l-2 border-zinc-200 ml-2">
                <label className="flex flex-row items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-zinc-700 w-4 h-4"
                    checked={settings.termsType === "egyptian"}
                    // onChange={() => updateSettings({ termsType: "egyptian" })}
                    onChange={() => toggleTerms("egyptian")}
                  />
                  {t("settings.termsEgyptian")}
                </label>
                <label className="flex flex-row items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-zinc-700 w-4 h-4"
                    checked={settings.termsType === "ptolemaic"}
                    // onChange={() => updateSettings({ termsType: "ptolemaic" })}
                    onChange={() => toggleTerms("ptolemaic")}
                  />
                  {t("settings.termsPtolemaic")}
                </label>
              </div>
            {/* {settings.showTerms && (
            )} */}
          </div>

          <label className="flex flex-row items-center gap-2">
            <input
              type="checkbox"
              className="accent-zinc-700 w-4 h-4"
              checked={settings.showFaces}
              onChange={(e) => updateSettings({ showFaces: e.target.checked })}
            />
            {t("settings.showFaces")}
          </label>

          <label className="flex flex-row items-center gap-2">
            <input
              type="checkbox"
              className="accent-zinc-700 w-4 h-4"
              checked={settings.showDetails}
              onChange={(e) => updateSettings({ showDetails: e.target.checked })}
            />
            {t("settings.showDetails")}
          </label>

          <label className="flex flex-row items-center gap-2">
            <input
              type="checkbox"
              className="accent-zinc-700 w-4 h-4"
              checked={settings.showTransSaturnians}
              onChange={(e) => updateSettings({ showTransSaturnians: e.target.checked })}
            />
            {t("settings.showTransSaturnians")}
          </label>

          <button type="button" className="default-btn flex w-full flex-row items-center justify-center gap-2" onClick={() => { setActiveTipIndex(0); setInfoModal("manual"); }}>
            {t("settings.manualTitle")}
            <Image src="/manual.png" alt="" width={22} height={22} unoptimized />
          </button>
          <button type="button" className="default-btn flex w-full flex-row items-center justify-center gap-2" onClick={() => setIsProfileDataMenuOpen(true)}>
            <span>{t("settings.profileDataTitle")}</span>
            <Image src="/import-export.png" alt="" width={20} height={20} unoptimized />
          </button>
          <button type="button" className="default-btn flex w-full flex-row items-center justify-center gap-2" onClick={() => setInfoModal("about")}>
            {t("settings.aboutTitle")}
            <Image src="/pisces-pb.png" alt="" width={22} height={22} unoptimized />
          </button>
            </>
          )}
          {infoModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none" role="presentation">
              <section
                role="dialog"
                aria-modal="false"
                aria-labelledby="settings-info-title"
                className={`pointer-events-auto relative flex max-h-[calc(100dvh-2rem)] w-full ${infoModal === "manual" ? "max-w-lg" : "max-w-xl"} flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl`}
              >
                <header className="relative flex items-center justify-center border-b border-zinc-100 px-5 py-4">
                  <h2 id="settings-info-title" className="text-center text-lg font-bold text-zinc-800">
                    {t(infoModal === "about" ? "settings.aboutTitle" : "settings.manualTitle")}
                  </h2>
                  <button type="button" aria-label={t("support.close")} onClick={() => setInfoModal(null)} className="absolute right-3 rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800">
                    <IoClose size={22} />
                  </button>
                </header>
                <div className="min-h-0 overflow-y-auto p-5 text-sm leading-relaxed text-zinc-700">
                  {infoModal === "about" ? (
                    <div className="flex flex-col gap-3">
                    <p className="whitespace-pre-line">{t("settings.aboutDescription")}</p>
                    </div>
                  ) : (
                  <div className="flex flex-col gap-4">
                    <article aria-live="polite" className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                      {activeTip.image && activeTip.imageAlt && (
                        <div className="flex justify-center">
                          <Image
                            src={activeTip.image}
                            alt={t(activeTip.imageAlt)}
                            width={1200}
                            height={675}
                            unoptimized
                            className="mx-auto block h-auto w-auto max-w-full"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="mb-1 font-semibold text-zinc-800">{t(activeTip.title)}</h3>
                        <p>{t(activeTip.description)}</p>
                      </div>
                    </article>
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        aria-label={t("settings.tipPrevious")}
                        className="default-btn min-w-0 px-4"
                        onClick={() => setActiveTipIndex((index) => (index + MANUAL_TIPS.length - 1) % MANUAL_TIPS.length)}
                      >
                        ◀
                      </button>
                      <span aria-live="polite" className="text-sm text-zinc-600">
                        {t("settings.tipPosition", { current: activeTipIndex + 1, total: MANUAL_TIPS.length })}
                      </span>
                      <button
                        type="button"
                        aria-label={t("settings.tipNext")}
                        className="default-btn min-w-0 px-4"
                        onClick={() => setActiveTipIndex((index) => (index + 1) % MANUAL_TIPS.length)}
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </MenuContainer>
  );
}

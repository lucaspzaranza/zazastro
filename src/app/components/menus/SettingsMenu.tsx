// src/app/components/menus/SettingsMenu.tsx
"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import MenuContainer from "./MenuContainer";
import { useAstroChartSettings } from "@/hooks/useAstroChartSettings";
import { ChangeEvent, useRef, useState } from "react";
import { useProfiles } from "@/contexts/ProfilesContext";
import type { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";

const PROFILE_ID_PATTERN = /^zazastro:profile-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProfile(value: unknown): value is BirthChartProfile {
  if (!isRecord(value) || typeof value.id !== "string" || !PROFILE_ID_PATTERN.test(value.id)) return false;
  if (value.name !== undefined && typeof value.name !== "string") return false;
  if (value.gender !== undefined && !["male", "female", "event"].includes(String(value.gender))) return false;

  if (value.birthDate !== undefined) {
    if (!isRecord(value.birthDate) || !isRecord(value.birthDate.coordinates)) return false;
    const date = value.birthDate;
    if (typeof date.day !== "number" || typeof date.month !== "number" || typeof date.year !== "number" || typeof date.time !== "string") return false;
    if (typeof date.coordinates.latitude !== "number" || typeof date.coordinates.longitude !== "number") return false;
  }

  return true;
}

export default function SettingsMenu() {
  const t = useTranslations();
  const { settings, updateSettings } = useAstroChartSettings();
  const { profiles, importProfiles, deleteAllProfiles } = useProfiles();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState("");
  const [importStatusType, setImportStatusType] = useState<"success" | "error">("success");
  const [isProfileDataMenuOpen, setIsProfileDataMenuOpen] = useState(false);

  // useEffect(() => {
  //   updateSettings({showFixedStars: settings.showEssentialFixedStars || settings.showSecondaryFixedStars});
  // }, [settings.showEssentialFixedStars, settings.showSecondaryFixedStars]);

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
                    {t("settings.importProfiles")}
                  </button>
                  <button type="button" className="default-btn min-w-0 flex-1" onClick={exportProfiles} disabled={profiles.length === 0}>
                    {t("settings.exportProfiles")}
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

          <button type="button" className="default-btn flex w-full flex-row items-center justify-center gap-2" onClick={() => setIsProfileDataMenuOpen(true)}>
            <span>{t("settings.profileDataTitle")}</span>
            <Image src="/import-export.png" alt="" width={20} height={20} unoptimized />
          </button>
            </>
          )}
        </div>
      )}
    </MenuContainer>
  );
}

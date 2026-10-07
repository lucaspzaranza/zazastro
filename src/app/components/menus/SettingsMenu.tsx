// src/app/components/menus/SettingsMenu.tsx
"use client";
import { useTranslations } from "next-intl";
import MenuContainer from "./MenuContainer";
import { useAstroChartSettings } from "@/hooks/useAstroChartSettings";
import { useEffect } from "react";

export default function SettingsMenu() {
  const t = useTranslations();
  const { settings, updateSettings } = useAstroChartSettings();

  // useEffect(() => {
  //   updateSettings({showFixedStars: settings.showEssentialFixedStars || settings.showSecondaryFixedStars});
  // }, [settings.showEssentialFixedStars, settings.showSecondaryFixedStars]);

  const toggleTerms = (term: "egyptian" | "ptolemaic" | null) => {
    updateSettings({termsType: term === settings.termsType ? null : term})
  }

  return (
    <MenuContainer titleKey="settings.title">
      {() => (
        <div className="w-full flex flex-col gap-4 text-sm text-zinc-700">
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
        </div>
      )}
    </MenuContainer>
  );
}
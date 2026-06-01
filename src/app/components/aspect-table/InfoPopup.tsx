import { useTranslations } from "next-intl";
import Image from "next/image";

export default function InfoPopup() {
  const aspectImgSize = 15;
  const t = useTranslations();

  return (
    <div className="absolute w-full bg-white border-2 z-10 flex flex-col gap-1">
      <h2 className="text-lg text-center font-bold border-b-2">{t("aspects.legend")}</h2>

      <div className="p-2 flex flex-col gap-1">
        <h2 className="text-sm md:text-[1rem] font-bold">{t("aspects.aspects")}:</h2>
        <div className="grid grid-cols-3 text-[1rem]">
          <div className="flex flex-row items-center justify-start">
            <Image
              alt="sextile"
              src="/aspects/sextile.png"
              width={aspectImgSize}
              height={aspectImgSize}
              unoptimized
            />
            <span className="pl-2">{t("aspects.sextile")}</span>
          </div>

          <div className="flex flex-row items-center justify-start">
            <Image
              alt="sextile"
              src="/aspects/square.png"
              width={aspectImgSize}
              height={aspectImgSize}
              unoptimized
            />
            <span className="pl-2">{t("aspects.square")}</span>
          </div>

          <div className="flex flex-row items-center justify-end md:justify-start">
            <Image
              alt="sextile"
              src="/aspects/trine.png"
              width={aspectImgSize}
              height={aspectImgSize}
              unoptimized
            />
            <span className="pl-2">{t("aspects.trine")}</span>
          </div>

          <div className="flex flex-row items-center justify-start">
            <Image
              alt="sextile"
              src="/aspects/opposition.png"
              width={aspectImgSize}
              height={aspectImgSize}
              unoptimized
            />
            <span className="pl-2">{t("aspects.opposition")}</span>
          </div>

          <div className="ml-4 sm:ml-0 flex flex-row items-center justify-start">
            <Image
              alt="sextile"
              src="/aspects/conjunction.png"
              width={aspectImgSize}
              height={aspectImgSize}
              unoptimized
            />
            <span className="pl-2">{t("aspects.conjunction")}</span>
          </div>
        </div>
        <h2 className="text-sm md:text-[1rem] font-bold">{t("aspects.elements")}:</h2>
        <div>{t("aspects.houseInitial")}: {t("aspects.house")}</div>
        <div>{t("aspects.outerInitial")}: {t("aspects.outerElement")}</div>
        <h2 className="text-sm md:text-[1rem] font-bold">{t("aspects.aspectType")}:</h2>
        <div>(A): {t("aspects.applicative")}</div>
        <div>(S): {t("aspects.separative")}</div>
      </div>
    </div>
  );
}

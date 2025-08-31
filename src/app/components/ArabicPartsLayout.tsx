import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import React from "react";
import { formatSignColor, getArabicPartImage } from "../utils/chartUtils";

interface ArabicPartsLayoutProps {
  title?: string;
  parts?: ArabicPart[];
}

export default function ArabicPartsLayout(props: ArabicPartsLayoutProps) {
  const { title, parts } = props;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold mt-[-5px]">
        {title ?? "Partes Árabes"}:
      </h2>

      <ul>
        {parts?.map((arabicPart, index) => {
          return (
            <li key={index} className="flex flex-row items-center">
              <div className="w-full flex flex-row">
                <span className="w-[14rem] flex flex-row items-center">
                  {arabicPart?.name}&nbsp;{getArabicPartImage(arabicPart)}:
                  <span className="w-full text-end pr-3">
                    {formatSignColor(arabicPart.longitudeSign)}
                  </span>
                </span>
                <span className="w-[12rem] flex flex-row items-center pl-2">
                  Antiscion:&nbsp;
                  <span className="w-full text-end">
                    {formatSignColor(arabicPart.antiscionSign)}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

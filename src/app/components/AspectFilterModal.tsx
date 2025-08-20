"use client";

import { AspectType } from "@/interfaces/AstroChartInterfaces";
import React, { useEffect, useState } from "react";
import { getAspectImage } from "../utils/chartUtils";
import {
  AspectFilterOptions,
  AspectFilterModalCheckboxState,
  TableFilterOptions,
} from "@/interfaces/AspectTableInterfaces";
import AspectTableFilterModalLayout from "./AspectTableFilterModalLayout";

const aspects: AspectType[] = [
  "sextile",
  "square",
  "trine",
  "opposition",
  "conjunction",
];

export default function AspectFilterModal({
  memorizedOptions,
  onCancel,
  onConfirm,
}: {
  memorizedOptions?: TableFilterOptions;
  onCancel?: (options?: TableFilterOptions) => void;
  onConfirm?: (options?: TableFilterOptions) => void;
}) {
  const [checkboxesChecked, setCheckboxesChecked] = useState<
    AspectFilterModalCheckboxState[]
  >([
    { aspect: "sextile", isChecked: true },
    { aspect: "square", isChecked: true },
    { aspect: "trine", isChecked: true },
    { aspect: "opposition", isChecked: true },
    { aspect: "conjunction", isChecked: true },
  ]);

  const [initialState, setInitialState] = useState<
    AspectFilterModalCheckboxState[]
  >([]);

  const [allCheckboxesChecked, setAllCheckboxesChecked] = useState(true);

  const [aspectsNodes, setAspectsNodes] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (memorizedOptions?.aspectsFilter) {
      const newData = memorizedOptions?.aspectsFilter?.checkboxesStates?.map(
        (checkbox) => checkbox
      );

      setAllCheckboxesChecked(newData.every((checkbox) => checkbox.isChecked));
      setCheckboxesChecked(newData);
    }

    setInitialState(checkboxesChecked);
    setAspectsNodes(aspects.map((aspect) => getAspectImage(aspect)));
  }, []);

  const toggleSingleCheckbox = (index: number) => {
    const newChecked = [...checkboxesChecked];
    newChecked[index].isChecked = !newChecked[index].isChecked;

    setCheckboxesChecked([...newChecked]);
    setAllCheckboxesChecked(newChecked.every((check) => check.isChecked));
  };

  const toggleAllCheckboxes = () => {
    const newValue = !allCheckboxesChecked;

    const allChecksUnmarked: AspectFilterModalCheckboxState[] = [];
    checkboxesChecked.forEach((checkbox) => {
      allChecksUnmarked.push({
        aspect: checkbox.aspect,
        isChecked: newValue,
      });
    });

    setCheckboxesChecked(allChecksUnmarked);
    setAllCheckboxesChecked(newValue);
  };

  function confirmWithAspectesChecked() {
    onConfirm?.({
      aspectsFilter: { checkboxesStates: checkboxesChecked },
    });
  }

  return (
    <AspectTableFilterModalLayout
      title="Filtrar por Aspecto"
      onCancel={() =>
        onCancel?.({
          aspectsFilter: { checkboxesStates: initialState },
        })
      }
      onConfirm={confirmWithAspectesChecked}
      widthClass="w-[190px]"
    >
      {checkboxesChecked && (
        <div className="w-full grid grid-cols-3 gap-2 p-2">
          {aspectsNodes.map((node, index) => (
            <div
              key={index}
              className="flex flex-row items-center justify-start gap-1"
            >
              <input
                type="checkbox"
                id={`aspect-${index}`}
                checked={checkboxesChecked[index].isChecked || false}
                onChange={() => toggleSingleCheckbox(index)}
              />
              <label htmlFor={`aspect-${index}`}>{node}</label>
            </div>
          ))}

          <div className="flex flex-row items-center justify-start gap-1">
            <input
              type="checkbox"
              id="aspect-all"
              checked={allCheckboxesChecked}
              onChange={toggleAllCheckboxes}
            />
            <label htmlFor="aspect-all">Todos</label>
          </div>
        </div>
      )}
    </AspectTableFilterModalLayout>
  );
}

"use client";

import { AspectType } from "@/interfaces/AstroChartInterfaces";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { getAspectImage } from "../../utils/chartUtils";
import {
  AspectFilterModalCheckboxState,
  FilterModalProps,
  FilterModalImperativeHandle,
} from "@/interfaces/AspectTableInterfaces";
import AspectTableFilterModalLayout from "./AspectTableFilterModalLayout";

const aspects: AspectType[] = [
  "sextile",
  "square",
  "trine",
  "opposition",
  "conjunction",
];

function AspectFilterModalFn(
  props: FilterModalProps,
  ref: React.ForwardedRef<FilterModalImperativeHandle>
) {
  const {
    isVisible,
    memorizedOptions,
    initialState,
    className,
    onCancel,
    onConfirm,
    applyFilterIsActiveClasses,
    clearSignal,
  } = props;

  // default (imutável) — sempre criar fora do estado
  const defaultCheckboxes = useMemo<AspectFilterModalCheckboxState[]>(
    () => [
      { aspect: "sextile", isChecked: true },
      { aspect: "square", isChecked: true },
      { aspect: "trine", isChecked: true },
      { aspect: "opposition", isChecked: true },
      { aspect: "conjunction", isChecked: true },
    ],
    []
  );

  // ref que guarda o snapshot inicial (não muda ao longo das interações)
  const initialSnapshotRef = useRef<AspectFilterModalCheckboxState[]>(
    defaultCheckboxes.map((c) => ({ ...c }))
  );

  const [checkboxesChecked, setCheckboxesChecked] = useState<
    AspectFilterModalCheckboxState[]
  >(initialSnapshotRef.current.map((c) => ({ ...c })));

  const [allCheckboxesChecked, setAllCheckboxesChecked] = useState(true);
  const [aspectsNodes, setAspectsNodes] = useState<React.ReactNode[]>([]);
  const [signalCleared, setSignalCleared] = useState(false);

  useEffect(() => {
    if (typeof props.clearSignal === "number") {
      setSignalCleared(true);
    }
  }, [clearSignal]);

  useEffect(() => {
    if (signalCleared) {
      initialSnapshotRef.current = defaultCheckboxes.map((c) => ({ ...c }));

      setAllCheckboxesChecked(true);
      setCheckboxesChecked((prev) =>
        prev.map((c) => ({ ...c, isChecked: true }))
      );

      setSignalCleared(false);
    }
  }, [signalCleared]);

  // quando o modal abre / quando memorizedOptions (ou initialState) mudar,
  // definimos o snapshot inicial (cópia!) e atualizamos o estado local.
  useEffect(() => {
    const source =
      memorizedOptions?.aspectsFilter?.checkboxesStates ??
      initialState?.aspectsFilter?.checkboxesStates ??
      defaultCheckboxes;

    // clone para garantir que não mantemos referências externas
    const clonedInitial = source.map((c) => ({ ...c }));

    initialSnapshotRef.current = clonedInitial; // guarda snapshot
    setCheckboxesChecked(clonedInitial.map((c) => ({ ...c })));
    setAllCheckboxesChecked(clonedInitial.every((c) => c.isChecked));

    setAspectsNodes(aspects.map((aspect) => getAspectImage(aspect)));
  }, [memorizedOptions, initialState]);

  useImperativeHandle(
    ref,
    () => ({
      getOptions() {
        return {
          aspectsFilter: {
            checkboxesStates: checkboxesChecked.map((c) => ({ ...c })),
          },
        };
      },
    }),
    [checkboxesChecked]
  );

  const toggleSingleCheckbox = (index: number) => {
    if (allCheckboxesChecked) {
      toggleAllCheckboxes();
    }

    setCheckboxesChecked((prev) => {
      const next = prev.map((c, i) =>
        i === index ? { ...c, isChecked: !c.isChecked } : c
      );
      setAllCheckboxesChecked(next.every((c) => c.isChecked));
      return next;
    });
  };

  const toggleAllCheckboxes = () => {
    const newValue = !allCheckboxesChecked;
    setCheckboxesChecked((prev) =>
      prev.map((c) => ({ ...c, isChecked: newValue }))
    );
    setAllCheckboxesChecked(newValue);
  };

  /**
   * Checks if Aspect Filter is applied. To verify this,
   * this function checks if not all the checkboxes are marked, i.e,
   * the values are different from the default value, which is all
   * checkboxes marked.
   */
  function checkIfFilterIsActive(): boolean {
    return !allCheckboxesChecked;
  }

  function confirmWithAspectesChecked() {
    onConfirm?.({
      aspectsFilter: {
        checkboxesStates: checkboxesChecked.map((c) => ({ ...c })),
      },
    });

    applyFilterIsActiveClasses?.(checkIfFilterIsActive());
  }

  function cancelAndResetState() {
    const original = initialSnapshotRef.current.map((c) => ({ ...c }));
    setCheckboxesChecked(original);
    setAllCheckboxesChecked(original.every((c) => c.isChecked));
    onCancel?.({
      aspectsFilter: { checkboxesStates: original },
    });
  }

  return (
    <AspectTableFilterModalLayout
      isVisible={isVisible}
      title="Filtrar por Aspecto"
      onCancel={cancelAndResetState}
      onConfirm={confirmWithAspectesChecked}
      className={`w-[190px] ${className}`}
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
                checked={checkboxesChecked[index]?.isChecked ?? false}
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

const AspectFilterModal = forwardRef<
  FilterModalImperativeHandle,
  FilterModalProps
>(AspectFilterModalFn);
AspectFilterModal.displayName = "AspectFilterModal";

export default AspectFilterModal;

"use client";

import {
  AspectDistanceType,
  DistanceTypeFilterModalCheckboxState,
  FilterModalImperativeHandle,
  FilterModalProps,
  TableFilterOptions,
} from "@/interfaces/AspectTableInterfaces";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import AspectTableFilterModalLayout from "./AspectTableFilterModalLayout";

function DistanceTypeFilterModalFn(
  props: FilterModalProps,
  ref: React.ForwardedRef<FilterModalImperativeHandle>
) {
  const {
    isVisible,
    className,
    memorizedOptions,
    initialState,
    onCancel,
    onConfirm,
    applyFilterIsActiveClasses,
  } = props;

  const defaultCheckboxes = useMemo<DistanceTypeFilterModalCheckboxState[]>(
    () => [
      { distanceType: "applicative", isChecked: true },
      { distanceType: "separative", isChecked: true },
    ],
    []
  );

  const initialSnapshotRef = useRef<DistanceTypeFilterModalCheckboxState[]>(
    defaultCheckboxes.map((c) => ({ ...c }))
  );

  const [checkboxesChecked, setCheckboxesChecked] = useState<
    DistanceTypeFilterModalCheckboxState[]
  >(initialSnapshotRef.current.map((c) => ({ ...c })));

  const [allCheckboxesChecked, setAllCheckboxesChecked] = useState(true);

  useEffect(() => {
    const source =
      memorizedOptions?.distanceTypesFilter?.distanceTypes ??
      initialState?.distanceTypesFilter?.distanceTypes ??
      defaultCheckboxes;

    const clonedInitial = source.map((c) => ({ ...c }));

    initialSnapshotRef.current = clonedInitial;
    setCheckboxesChecked(clonedInitial.map((c) => ({ ...c })));
    setAllCheckboxesChecked(clonedInitial.every((c) => c.isChecked));
  }, [memorizedOptions, initialState]);

  useImperativeHandle(
    ref,
    () => ({
      clearFilterModalFields() {
        setCheckboxesChecked((prev) =>
          prev.map((c) => ({ ...c, isChecked: true }))
        );
        setAllCheckboxesChecked(true);
      },

      getOptions() {
        return {
          distanceTypesFilter: {
            distanceTypes: checkboxesChecked.map((c) => ({ ...c })),
          },
        };
      },
    }),
    []
  );

  /**
   * Checks if Aspect Filter is applied. To verify this,
   * this function checks if not all the checkboxes are marked, i.e,
   * the values are different from the default value, which is all
   * checkboxes marked.
   */
  function checkIfFilterIsActive(): boolean {
    return !allCheckboxesChecked;
  }

  function confirm() {
    onConfirm?.({
      distanceTypesFilter: {
        distanceTypes: checkboxesChecked.map((c) => ({ ...c })),
      },
    });

    applyFilterIsActiveClasses?.(checkIfFilterIsActive());
  }

  function cancelAndResetState() {
    const original = initialSnapshotRef.current.map((c) => ({ ...c }));
    setCheckboxesChecked(original);
    setAllCheckboxesChecked(original.every((c) => c.isChecked));
    onCancel?.({
      distanceTypesFilter: { distanceTypes: original },
    });
  }

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

  return (
    <AspectTableFilterModalLayout
      isVisible={isVisible}
      title="Filtrar por Tipo de Distância"
      onCancel={cancelAndResetState}
      onConfirm={confirm}
      className={`w-[160px] ${className}`}
    >
      {checkboxesChecked && (
        <div className="w-full gap-2 p-2">
          <div className="flex flex-col items-center justify-start gap-1">
            <div className="w-full flex flex-row gap-1">
              <input
                type="checkbox"
                id="dt-0"
                checked={checkboxesChecked[0]?.isChecked ?? false}
                onChange={() => toggleSingleCheckbox(0)}
              />
              <label htmlFor="dt-0">Aplicativo</label>
            </div>

            <div className="w-full flex flex-row gap-1">
              <input
                type="checkbox"
                id="dt-1"
                checked={checkboxesChecked[1]?.isChecked ?? false}
                onChange={() => toggleSingleCheckbox(1)}
              />
              <label htmlFor="dt-1">Separativo</label>
            </div>

            <div className="w-full flex flex-row gap-1">
              <input
                type="checkbox"
                id="dt-all"
                checked={allCheckboxesChecked}
                onChange={toggleAllCheckboxes}
              />
              <label htmlFor="dt-all">Todos</label>
            </div>
          </div>
        </div>
      )}
    </AspectTableFilterModalLayout>
  );
}

const DistanceTypeFilterModal = forwardRef<
  FilterModalImperativeHandle,
  FilterModalProps
>(DistanceTypeFilterModalFn);
DistanceTypeFilterModal.displayName = "DistanceTypeFilterModal";

export default DistanceTypeFilterModal;

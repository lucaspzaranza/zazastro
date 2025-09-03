"use client";

import {
  DistanceFilterModalState,
  FilterModalImperativeHandle,
  FilterModalProps,
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
import { clampLongitude } from "@/app/utils/chartUtils";

const filterFunctions: Record<string, (val: number, limit: number) => boolean> =
  {
    1: (val, limit) => val === limit,
    2: (val, limit) => val < limit,
    3: (val, limit) => val <= limit,
    4: (val, limit) => val > limit,
    5: (val, limit) => val >= limit,
  };

function DistanceFilterModalFn(
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
    clearSignal,
  } = props;

  const defaultState = useMemo<DistanceFilterModalState>(
    () => ({
      useLowerLimit: true,
      lowerLimitValue: 0,
      lowerLimitFilterFunc: undefined,
      useUpperLimit: false,
      upperLimitValue: 0,
      upperLimitFilterFunc: undefined,
    }),
    []
  );

  const initialSnapshotRef = useRef<DistanceFilterModalState>({
    ...defaultState,
  });

  const [currentState, setCurrentState] = useState<DistanceFilterModalState>({
    ...initialSnapshotRef.current,
  });

  const [signalCleared, setSignalCleared] = useState(false);

  useEffect(() => {
    if (typeof props.clearSignal === "number") {
      setSignalCleared(true);
    }
  }, [clearSignal]);

  useEffect(() => {
    if (signalCleared) {
      setCurrentState({
        useLowerLimit: true,
        lowerLimitValue: 0,
        lowerLimitFilterFunc: undefined,
        useUpperLimit: false,
        upperLimitValue: 0,
        upperLimitFilterFunc: undefined,
      });

      initialSnapshotRef.current = { ...defaultState };

      setSignalCleared(false);
    }
  }, [signalCleared]);

  useEffect(() => {
    const source =
      memorizedOptions?.distanceFilter?.distanceOptions ??
      initialState?.distanceFilter?.distanceOptions ??
      defaultState;

    const clonedInitial = { ...source };

    initialSnapshotRef.current = clonedInitial;
    setCurrentState({ ...clonedInitial });
  }, [memorizedOptions, initialState]);

  useImperativeHandle(
    ref,
    () => ({
      getOptions() {
        return {
          distanceFilter: { distanceOptions: { ...currentState } },
        };
      },
    }),
    []
  );

  function checkIfFilterIsActive(): boolean {
    return (
      (currentState.useLowerLimit &&
        currentState.lowerLimitFilterFunc !== undefined &&
        currentState.lowerLimitValue > 0) ||
      (currentState.useUpperLimit &&
        currentState.upperLimitFilterFunc !== undefined &&
        currentState.upperLimitValue > 0)
    );
  }

  function confirm() {
    onConfirm?.({
      distanceFilter: {
        distanceOptions: { ...currentState },
      },
    });

    applyFilterIsActiveClasses?.(checkIfFilterIsActive());
  }

  function cancelAndResetState() {
    const original = { ...initialSnapshotRef.current };
    setCurrentState(original);
    onCancel?.({
      distanceFilter: { distanceOptions: { ...original } },
    });
  }

  function toggleUseLowerLimit() {
    setCurrentState((prev) => ({
      ...prev,
      useLowerLimit: !prev.useLowerLimit,
    }));
  }

  function toggleUseUpperLimit() {
    setCurrentState((prev) => ({
      ...prev,
      useUpperLimit: !prev.useUpperLimit,
    }));
  }

  function getFnIndexFromFunc(
    fn?: (val: number, limit: number) => boolean
  ): string {
    if (!fn) return "0";
    const entry = Object.entries(filterFunctions).find(([, f]) => f === fn);
    return entry ? entry[0] : "0";
  }

  function selectLowerFilterFunction(fnIndex: number) {
    setCurrentState((prev) => ({
      ...prev,
      lowerLimitFilterFunc: filterFunctions[fnIndex],
    }));
  }

  function selectUpperFilterFunction(fnIndex: number) {
    setCurrentState((prev) => ({
      ...prev,
      upperLimitFilterFunc: filterFunctions[fnIndex],
    }));
  }

  return (
    <AspectTableFilterModalLayout
      isVisible={isVisible}
      title="Filtrar por Distância"
      onCancel={cancelAndResetState}
      onConfirm={confirm}
      className={`w-[280px] ${className}`}
    >
      {currentState && (
        <div className="w-full flex flex-col items-center justify-center gap-2 p-2">
          <div className="w-full flex flex-row items-center justify-start gap-2">
            <input
              type="checkbox"
              id="lowerLimit"
              checked={currentState.useLowerLimit}
              onChange={toggleUseLowerLimit}
            />
            <label
              htmlFor="lowerLimit"
              className={`w-full text-start ${
                !currentState.useLowerLimit ? "text-gray-400" : ""
              }`}
            >
              Limite Inferior
            </label>
          </div>
          <div className="flex flex-row items-center justify-center gap-1">
            <select
              disabled={!currentState.useLowerLimit}
              value={getFnIndexFromFunc(currentState.lowerLimitFilterFunc)}
              className="w-[90%] border-2 rounded-sm disabled:border-gray-400 disabled:text-gray-400"
              onChange={(e) => {
                const fnIndex = Number.parseInt(e.target.value);
                selectLowerFilterFunction(fnIndex);
              }}
            >
              <option disabled value="0">
                Selecione
              </option>
              <option value="1">Igual a {"=="}</option>
              <option value="2">Menor que {"<"}</option>
              <option value="3">Menor ou igual a {"<="}</option>
              <option value="4">Maior que {">"}</option>
              <option value="5">Maior ou igual a {">="}</option>
            </select>
            <input
              type="number"
              disabled={!currentState.useLowerLimit}
              className="border-2 w-1/4 pl-1 rounded-sm disabled:border-gray-400 disabled:text-gray-400"
              value={currentState.lowerLimitValue ?? 0}
              onChange={(e) => {
                const raw = e.target.value;
                const numberVal = Number.parseFloat(raw);
                if (Number.isNaN(numberVal)) {
                  setCurrentState((prev) => ({ ...prev, lowerLimitValue: 0 }));
                  return;
                }

                let lowerLimitValue = Number.parseFloat(
                  clampLongitude(raw, 5).toFixed(2)
                );
                // e.target.value = lowerLimitValue.toString();
                setCurrentState((prev) => ({ ...prev, lowerLimitValue }));
              }}
            />
          </div>

          <div className="w-full flex flex-row items-center justify-start gap-2">
            <input
              type="checkbox"
              id="upperLimit"
              checked={currentState.useUpperLimit}
              onChange={toggleUseUpperLimit}
            />
            <label
              htmlFor="upperLimit"
              className={`w-full text-start ${
                !currentState.useUpperLimit ? "text-gray-400" : ""
              }`}
            >
              Limite Superior
            </label>
          </div>
          <div className="flex flex-row items-center justify-center gap-1">
            <select
              disabled={!currentState.useUpperLimit}
              value={getFnIndexFromFunc(currentState.upperLimitFilterFunc)}
              className="w-[90%] border-2 rounded-sm disabled:border-gray-400 disabled:text-gray-400"
              onChange={(e) => {
                const fnIndex = Number.parseInt(e.target.value);
                selectUpperFilterFunction(fnIndex);
              }}
            >
              <option disabled value="0">
                Selecione
              </option>
              <option value="1">Igual a {"=="}</option>
              <option value="2">Menor que {"<"}</option>
              <option value="3">Menor ou igual a {"<="}</option>
              <option value="4">Maior que {">"}</option>
              <option value="5">Maior ou igual a {">="}</option>
            </select>
            <input
              type="number"
              disabled={!currentState.useUpperLimit}
              className="border-2 w-1/4 pl-1 rounded-sm disabled:border-gray-400 disabled:text-gray-400"
              value={currentState.upperLimitValue ?? 0}
              onChange={(e) => {
                const raw = e.target.value;
                const numberVal = Number.parseFloat(raw);
                if (Number.isNaN(numberVal)) {
                  setCurrentState((prev) => ({ ...prev, upperLimitValue: 0 }));
                  return;
                }

                let upperLimitValue = Number.parseFloat(
                  clampLongitude(raw, 5).toFixed(2)
                );
                // e.target.value = upperLimitValue.toString();
                setCurrentState((prev) => ({ ...prev, upperLimitValue }));
              }}
            />
          </div>
        </div>
      )}
    </AspectTableFilterModalLayout>
  );
}

const DistanceFilterModal = forwardRef<
  FilterModalImperativeHandle,
  FilterModalProps
>(DistanceFilterModalFn);
DistanceFilterModal.displayName = "DistanceFilterModal";

export default DistanceFilterModal;

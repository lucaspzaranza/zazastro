import { AspectType } from "./AstroChartInterfaces";

export type ElementLongitudeParameterType = "smallest" | "biggest";
export type AspectDistanceType = "applicative" | "separative";

export type AspectTableColumn =
  | "element"
  | "aspect"
  | "aspectedElement"
  | "distance"
  | "aspectDistanceType";

export type FilterModalImperativeHandle = {
  clearFilterModalFields: () => void;
  getOptions: () => TableFilterOptions;
};

export interface AspectDistance {
  key: string;
  distance: number;
}

export interface AspectDistanceTypeInterface {
  key: string;
  type: string;
}

export interface AspectFilterModalCheckboxState {
  aspect: AspectType;
  isChecked: boolean;
}

export interface AspectFilterOptions {
  checkboxesStates: AspectFilterModalCheckboxState[];
}

export interface DistanceTypeFilterModalCheckboxState {
  distanceType: AspectDistanceType;
  isChecked: boolean;
}

export interface DistanceTypeFilterOptions {
  distanceTypes: DistanceTypeFilterModalCheckboxState[];
}

export interface DistanceFilterOptions {
  distanceOptions: DistanceFilterModalState;
}

export interface TableFilterOptions {
  aspectsFilter?: AspectFilterOptions;
  distanceTypesFilter?: DistanceTypeFilterOptions;
  distanceFilter?: DistanceFilterOptions;
}

export interface FilterModalProps {
  isVisible: boolean;
  className?: string;
  children?: React.ReactNode;
  title?: string;
  memorizedOptions?: TableFilterOptions;
  initialState?: TableFilterOptions;
  onCancel?: (options?: TableFilterOptions) => void;
  onConfirm?: (options?: TableFilterOptions) => void;
  applyFilterIsActiveClasses?: (isActive: boolean) => void;
}

export interface DistanceFilterModalState {
  useLowerLimit: boolean;
  lowerLimitValue: number;
  lowerLimitFilterFunc?: (val: number, limit: number) => boolean;
  useUpperLimit: boolean;
  upperLimitValue: number;
  upperLimitFilterFunc?: (val: number, limit: number) => boolean;
}

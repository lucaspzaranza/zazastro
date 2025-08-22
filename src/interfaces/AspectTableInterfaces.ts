import { AspectType } from "./AstroChartInterfaces";

export type ElementLongitudeParameterType = "smallest" | "biggest";
export type AspectDistanceType = "applicative" | "separative";

export type AspectTableColumn =
  | "element"
  | "aspect"
  | "aspectedElement"
  | "distance"
  | "aspectDistanceType";

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

export interface TableFilterOptions {
  aspectsFilter?: AspectFilterOptions;
  distanceTypesFilter?: DistanceTypeFilterOptions;
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

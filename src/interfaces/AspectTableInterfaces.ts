import { AspectType } from "./AstroChartInterfaces";

export type ElementLongitudeParameterType = "smallest" | "biggest";

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

export interface AspectDistanceType {
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

export interface TableFilterOptions {
  aspectsFilter?: AspectFilterOptions;
}

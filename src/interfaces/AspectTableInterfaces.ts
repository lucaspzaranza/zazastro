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

import type { SLICE_TYPE } from "@niivue/niivue";

/**
 * Type emitted by Niivue.onLocationChange
 *
 * https://github.com/niivue/niivue/issues/860
 */
export type CrosshairLocation = {
  string: string;
};

export enum DisplayType {
  IMG4096 = "img-4096",
  ZMap5 = "zmap-5",
  ZMap10 = "zmap-10",
  Label = "label",
  IMG256 = "img-256",
  IMG65536 = "img-65536",
  Relative = "relative", // relative to the min-max of the image.
  Other = "other", // other manual settings.
}

export enum DisplayColorMap {
  Gray = "gray",
  Plasma = "plasma",
  Viridis = "viridis",
  NIH = "nih",
  Freesurfer = "freesurfer",
}

export type DisplayTypeMap = {
  [key: string]: {
    colorMap: DisplayColorMap;
    calMin: number;
    calMax: number;
  };
};

export enum SliceType {
  Axial = "axial",
  Coronal = "coronal",
  Sagittal = "sagittal",
  Multiplanar = "multiplanar",
}

export type SliceTypeMap = {
  [key: string]: SLICE_TYPE;
};

// from Niivue
// https://github.com/niivue/niivue/blob/main/packages/niivue/src/colortables.ts#L4
export type ColorMap = {
  R: number[];
  G: number[];
  B: number[];
  A: number[];
  I: number[];
  min?: number;
  max?: number;
  labels?: string[];
};

// from Niivue
// https://github.com/niivue/niivue/blob/main/packages/niivue/src/colortables.ts#L16
export type LUT = {
  lut: Uint8ClampedArray;
  min?: number;
  max?: number;
  labels?: string[];
};

// from Niivue
// https://github.com/niivue/niivue/blob/main/packages/niivue/src/nvimage/index.ts#L29
export type TypedVoxelArray =
  | Float32Array
  | Uint8Array
  | Int16Array
  | Float64Array
  | Uint16Array;

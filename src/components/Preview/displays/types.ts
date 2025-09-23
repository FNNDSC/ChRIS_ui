import type { SLICE_TYPE } from "@niivue/niivue";

export enum DisplayType {
  IMG4096 = "img-4096",
  ZMap = "zmap",
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

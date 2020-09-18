import { IFileBlob } from "../../api/models/file-viewer.model";

export interface Viewport {
  scale: number;
  translation: Vec2;
  voi: VOI;
  invert: boolean;
  rotation: number;
  hflip: boolean;
  vfilip: boolean;
  modalityLUT: LUT | undefined;
  voiLUT: LUT | undefined;
  colormap: string | object | undefined;
  labelmap: boolean | undefined;

  displayedArea: {
    tlhc: {
      x: number;
      y: number;
    };

    brhc: {
      x: number;
      y: number;
    };
    rowPixelSpacing: number;
    columnPixelSpacing: number;
    presentationSizeMode: string;
  };
}

interface LUT {
  id: string;
  firstValueMapped: number;
  numBitsPerEntry: number;
  lut: number[];
}

interface VOI {
  windowWidth: number;
  windowCenter: number;
}

interface Vec2 {
  x: number;
  y: number;
}

export type DcmImageProps = {
  file: IFileBlob;
};

export type DcmImageState = {
  viewport: Viewport;
  stack: {
    imageId: string[];
    currentImageIdIndex: number;
  };
};

export type Image = {
  imageId: string;
  minPixelValue: number;
  maxPixelValue: number;
  intercept: number;
  windowCenter: number;
  windowWidth: number;
  getPixelData: () => Uint8Array;
  getImageData: () => ImageData;
  rows: number;
  lut: LUT;
  rgba: boolean;
  columnPixelSpacing: number;
  invert: boolean;
  sizeInBytes: number;
  falseColor?: boolean;
  stats?: ImageStats;
  cachedLut: LUT;
  color: boolean;
  colormap?: string | object;
  labelmap?: boolean;
  voiLUT?: LUT;
  width: number;
  height: number;
  data: any;
};

interface ImageStats {
  lastGetPixelDataTime?: number;
  lastPutImageDataTime?: number;
  lastRenderTime?: number;
  lastLutGenerateTime?: number;
}

export type Item = {
  columns: number;
  rows: number;
  image: Image;
  imageId: string;
  name: string;
  patient: {
    [key: string]: string;
  };
  series: {
    [key: string]: string | number | undefined;
  };
  study: {
    [key: string]: string | undefined;
  };
  sliceDistance: number;
  sliceLocation: number | undefined;
  instanceNumber: string;
};

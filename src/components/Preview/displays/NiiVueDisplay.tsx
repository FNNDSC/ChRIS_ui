import { SLICE_TYPE } from "@niivue/niivue";
import {
  FreeSurferColorLUT,
  type NVROptions,
  type NVRVolume,
} from "niivue-react/src";
import React from "react";
import type { IFileBlob } from "../../../api/model.ts";
import SizedNiivueCanvas from "../../SizedNiivueCanvas";
import styles from "./NiiVueDisplay.module.css";
import { getFileResourceUrl } from "./dicomUtils/utils.ts";

type NiiVueDisplayProps = {
  selectedFile?: IFileBlob;
};

type PreviewOptions = Required<
  Pick<
    NVROptions,
    | "sliceType"
    | "isColorbar"
    | "backColor"
    | "isRadiologicalConvention"
    | "crosshairWidth"
    | "sagittalNoseLeft"
  >
>;

const SLICE_TYPES = {
  A: SLICE_TYPE.AXIAL,
  C: SLICE_TYPE.CORONAL,
  S: SLICE_TYPE.SAGITTAL,
  M: SLICE_TYPE.MULTIPLANAR,
};

const NiiVueDisplay: React.FC<NiiVueDisplayProps> = ({ selectedFile }) => {
  const [freesurferLut, setFreesurferLut] = React.useState(false);
  const [sliceTypeName, setSliceTypeName] =
    React.useState<keyof typeof SLICE_TYPES>("M");
  const [crosshairText, setCrosshairText] = React.useState("");

  const volumes: NVRVolume[] = [];

  const options: PreviewOptions = {
    backColor: [0, 0, 0],
    isRadiologicalConvention: true,
    sagittalNoseLeft: true,
    sliceType: SLICE_TYPES[sliceTypeName],
    isColorbar: false,
    crosshairWidth: sliceTypeName === "M" ? 0.5 : 0,
  };

  if (selectedFile !== undefined) {
    volumes.push({
      // NiiVue gets the file extension from name
      name: selectedFile.data.fname,
      url: getFileResourceUrl(selectedFile),
      colormap: "gray",
      colormapLabel: freesurferLut ? FreeSurferColorLUT : null,
    });
  }

  const rotateSliceType = () => {
    const names = Object.keys(SLICE_TYPES) as (keyof typeof SLICE_TYPES)[];
    const i = names.indexOf(sliceTypeName);
    const next = i + 1 >= names.length ? 0 : i + 1;
    setSliceTypeName(names[next]);
  };

  return (
    <>
      {volumes.length === 0 ? (
        <h1>error</h1>
      ) : (
        <div className={styles.container}>
          <div className={styles.controlBar}>
            <button
              type="button"
              onClick={() => setFreesurferLut(!freesurferLut)}
            >
              {freesurferLut ? "FreeSurfer" : "gray"}
            </button>
            <button type="button" onClick={rotateSliceType}>
              {sliceTypeName}
            </button>
            {freesurferLut && <span>{crosshairText}</span>}
          </div>
          <SizedNiivueCanvas
            size={8}
            volumes={volumes}
            options={options}
            onLocationChange={(c) => setCrosshairText(c.string)}
          />
        </div>
      )}
    </>
  );
};

const MemoedNiiVueDisplay = React.memo(NiiVueDisplay);
export default MemoedNiiVueDisplay;

import React from "react";
import { Alert } from "antd";
import { IFileBlob } from "../../../api/model.ts";
import { NVROptions, NVRVolume, FreeSurferColorLUT } from "niivue-react/src";
import SizedNiivueCanvas from "../../SizedNiivueCanvas";
import { SLICE_TYPE } from "@niivue/niivue";
import styles from "./NiiVueDisplay.module.css";

type NiiVueDisplayProps = {
  fileItem: IFileBlob;
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

const NiiVueDisplay: React.FC<NiiVueDisplayProps> = ({ fileItem }) => {
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

  if (fileItem.file !== undefined) {
    volumes.push({
      // NiiVue gets the file extension from name
      name: fileItem.file.data.fname,
      url: fileItem.url,
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
        <Alert type="error" description="Failed to load this file..." />
      ) : (
        <div className={styles.container}>
          <div className={styles.controlBar}>
            <button onClick={() => setFreesurferLut(!freesurferLut)}>
              {freesurferLut ? "FreeSurfer" : "gray"}
            </button>
            <button onClick={rotateSliceType}>{sliceTypeName}</button>
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

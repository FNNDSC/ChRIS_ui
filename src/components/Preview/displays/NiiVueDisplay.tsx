import React from "react";
import { IFileBlob } from "../../../api/model.ts";
import { NVROptions, NVRVolume, FreeSurferColorLUT } from "niivue-react/src";
import SizedNiivueCanvas from "../../SizedNiivueCanvas";
import { SLICE_TYPE } from "@niivue/niivue";
import styles from "./NiiVueDisplay.module.css";
import { Collection } from "@fnndsc/chrisapi";

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

  if (fileItem.blob !== undefined && fileItem.file !== undefined) {
    volumes.push({
      // NiiVue gets the file extension from name
      name: fileItem.file.data.fname,
      url: getFileResourceUrl(fileItem),
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

/**
 * Get the `file_resource` URL. (Collection+JSON is very annoying).
 *
 * FIXME: there is a huge inefficiency here.
 * Prior to the rendering of the {@link NiiVueDisplay} component, the file
 * data was already retrieved by ChRIS_ui, and its blob data are stored in
 * the props. But for NiiVue to work (well) it wants the file's URL to
 * retrieve the file itself. So the file is retrieved a total of two times,
 * even though it should only be retrieved once.
 */
function getFileResourceUrl({ file }: IFileBlob): string {
  return Collection.getLinkRelationUrls(
    file?.collection.items[0],
    "file_resource",
  )[0];
}

const MemoedNiiVueDisplay = React.memo(NiiVueDisplay);
export default MemoedNiiVueDisplay;

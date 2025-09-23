import { SLICE_TYPE } from "@niivue/niivue";
import { Button } from "@patternfly/react-core";
import { InputNumber, Select } from "antd";
import {
  FreeSurferColorLUT,
  type NVROptions,
  type NVRVolume,
} from "niivue-react/src";
import { useState } from "react";
import type { IFileBlob } from "../../../api/model.ts";
import SizedNiivueCanvas from "../../SizedNiivueCanvas";
import { getFileResourceUrl } from "./dicomUtils/utils.ts";
import styles from "./NiiVueDisplay.module.css";
import {
  DisplayColorMap,
  DisplayType,
  type DisplayTypeMap,
  SliceType,
} from "./types.ts";

type Props = {
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

const SLICE_TYPE_MAP = {
  [SliceType.Axial]: SLICE_TYPE.AXIAL,
  [SliceType.Coronal]: SLICE_TYPE.CORONAL,
  [SliceType.Sagittal]: SLICE_TYPE.SAGITTAL,
  [SliceType.Multiplanar]: SLICE_TYPE.MULTIPLANAR,
};

const SLICE_TYPE_LIST = [
  SliceType.Multiplanar,
  SliceType.Axial,
  SliceType.Coronal,
  SliceType.Sagittal,
];

const COLOR_MAP_LIST = [
  DisplayColorMap.Gray,
  DisplayColorMap.NIH,
  DisplayColorMap.Plasma,
  DisplayColorMap.Viridis,
  DisplayColorMap.Freesurfer,
];

const DISPLAY_TYPE_LIST = [
  DisplayType.IMG4096,
  DisplayType.ZMap,
  DisplayType.Label,
  DisplayType.IMG256,
  DisplayType.IMG65536,
];

const DISPLAY_TYPE_MAP: DisplayTypeMap = {
  [DisplayType.IMG4096]: {
    colorMap: DisplayColorMap.Gray,
    calMin: 0,
    calMax: 4096,
  },
  [DisplayType.ZMap]: {
    colorMap: DisplayColorMap.NIH,
    calMin: -4,
    calMax: 4,
  },
  [DisplayType.Label]: {
    colorMap: DisplayColorMap.Freesurfer,
    calMin: 0,
    calMax: 255,
  },
  [DisplayType.IMG256]: {
    colorMap: DisplayColorMap.Gray,
    calMin: 0,
    calMax: 256,
  },
  [DisplayType.IMG65536]: {
    colorMap: DisplayColorMap.Gray,
    calMin: 0,
    calMax: 65536,
  },
};

export default (props: Props) => {
  const { selectedFile } = props;
  const [sliceTypeName, setSliceTypeName] = useState(SliceType.Multiplanar);
  const [crosshairText, setCrosshairText] = useState("");
  const [displayType, setDisplayType] = useState(DisplayType.IMG4096);
  const [colorMap, setColorMap] = useState(DisplayColorMap.Gray);
  const [calMin, setCalMin] = useState(0);
  const [calMinVal, setCalMinVal] = useState("0");
  const [calMax, setCalMax] = useState(4096);
  const [calMaxVal, setCalMaxVal] = useState("4096");

  const volumes: NVRVolume[] = [];

  const options: PreviewOptions = {
    backColor: [0, 0, 0],
    isRadiologicalConvention: true,
    sagittalNoseLeft: true,
    sliceType: SLICE_TYPE_MAP[sliceTypeName],
    isColorbar: false,
    crosshairWidth: sliceTypeName === SliceType.Multiplanar ? 0.5 : 0,
  };

  const freesurferLut = colorMap === DisplayColorMap.Freesurfer;

  if (selectedFile !== undefined) {
    const colormapLabel = colorMap === "freesurfer" ? FreeSurferColorLUT : null;
    const theColorMap = colorMap === "freesurfer" ? "gray" : colorMap;
    volumes.push({
      // NiiVue gets the file extension from name
      name: selectedFile.data.fname,
      url: getFileResourceUrl(selectedFile),
      colormap: theColorMap,
      colormapLabel,
      cal_min: calMin,
      cal_max: calMax,
    });
    console.info(
      "NiiVueDisplay: volumes:",
      volumes,
      "calMin:",
      calMin,
      "calMax:",
      calMax,
      "theColorMap:",
      theColorMap,
    );
  }

  const selectStyle = { width: "9em" };

  const inputStyle = { width: "9em" };

  const safeSetCalMin = (value: string) => {
    setDisplayType(DisplayType.Other);
    setColorMap(colorMap);
    setCalMax(calMax);
    setCalMaxVal(calMaxVal);
    setCalMinVal(value);
    try {
      setCalMin(parseInt(value));
    } catch {
      setCalMin(0);
    }
  };

  const safeSetCalMax = (value: string) => {
    setDisplayType(DisplayType.Other);
    setColorMap(colorMap);
    setCalMin(calMin);
    setCalMinVal(calMinVal);
    setCalMaxVal(value);
    try {
      setCalMax(parseInt(value));
      setCalMaxVal(value);
    } catch {
      setCalMax(4096);
    }
  };

  const safeSetDisplayType = (value: DisplayType) => {
    setDisplayType(value);
    if (value === DisplayType.Relative || value === DisplayType.Other) {
      return;
    }

    const colorMap = DISPLAY_TYPE_MAP[value].colorMap;
    setColorMap(colorMap);

    const calMin = DISPLAY_TYPE_MAP[value].calMin;
    setCalMin(calMin);
    setCalMinVal(`${calMin}`);

    const calMax = DISPLAY_TYPE_MAP[value].calMax;
    setCalMax(calMax);
    setCalMaxVal(`${calMax}`);
  };

  const safeSetColorMap = (value: DisplayColorMap) => {
    setDisplayType(DisplayType.Other);
    setCalMin(calMin);
    setCalMinVal(calMinVal);
    setCalMax(calMax);
    setCalMaxVal(calMaxVal);
    setColorMap(value);
  };

  return (
    <>
      {volumes.length === 0 ? (
        <h1>error</h1>
      ) : (
        <div className={styles.container}>
          <div className={styles.controlBar}>
            <Select
              options={DISPLAY_TYPE_LIST.map((value) => ({
                label: value,
                value,
              }))}
              value={displayType}
              onChange={safeSetDisplayType}
              style={selectStyle}
            />
            <Select
              options={COLOR_MAP_LIST.map((value) => ({ label: value, value }))}
              value={colorMap}
              onChange={safeSetColorMap}
              style={selectStyle}
            />
            {freesurferLut && <span>{crosshairText}</span>}
            <InputNumber
              style={inputStyle}
              placeholder={`minimum value`}
              value={calMinVal}
              onChange={(e) => safeSetCalMin(e || "")}
            />
            <InputNumber
              style={inputStyle}
              placeholder={`maximum value`}
              value={calMaxVal}
              onChange={(e) => safeSetCalMax(e || "")}
            />
            <Select
              options={SLICE_TYPE_LIST.map((value) => ({
                label: value,
                value,
              }))}
              value={sliceTypeName}
              onChange={setSliceTypeName}
              style={selectStyle}
            />
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

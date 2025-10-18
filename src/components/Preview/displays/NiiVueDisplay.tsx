import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { Switch } from "@patternfly/react-core";
import { InputNumber, Select } from "antd";
import { type CSSProperties, useState } from "react";
import type { IFileBlob } from "../../../api/model.ts";
import type * as DoUser from "../../../reducers/user";
import SizedNiivueCanvas from "../../SizedNiivueCanvas";
import { getFileResourceUrl } from "./dicomUtils/utils.ts";
import styles from "./NiiVueDisplay.module.css";
import {
  type CrosshairLocation,
  DisplayColorMap,
  DisplayType,
  type DisplayTypeMap,
  SliceType,
} from "./types.ts";

const SLICE_TYPE_LIST = [
  SliceType.Multiplanar,
  SliceType.Axial,
  SliceType.Coronal,
  SliceType.Sagittal,
];

const COLOR_MAP_LIST = [
  DisplayColorMap.Gray,
  DisplayColorMap.NIH,
  DisplayColorMap.NIH2,
  DisplayColorMap.Plasma,
  DisplayColorMap.Viridis,
  DisplayColorMap.Freesurfer,
  DisplayColorMap.BlackBody,
  DisplayColorMap.Cardiac,
  DisplayColorMap.Flow,
  DisplayColorMap.GEColor,
  DisplayColorMap.GrayRainbow,
  DisplayColorMap.HotGreen,
  DisplayColorMap.HotIron,
  DisplayColorMap.HotMetal,
  DisplayColorMap.Hue1,
  DisplayColorMap.Hue2,
  DisplayColorMap.IRed,
  DisplayColorMap.Rainbow,
  DisplayColorMap.Rainbow2,
  DisplayColorMap.Rainbow3,
  DisplayColorMap.Ratio,
  DisplayColorMap.Spectrum,
  DisplayColorMap.Stern,
  DisplayColorMap.UCLA,
  DisplayColorMap.VRBones,
  DisplayColorMap.VRMusclesBones,
  DisplayColorMap.VRRedVessels,
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
    colorMap: DisplayColorMap.Rainbow2,
    calMin: -5,
    calMax: 5,
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

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  selectedFile?: IFileBlob;
  isHide?: boolean;

  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { selectedFile, isHide, useUser } = props;
  const [sliceTypeName, setSliceTypeName] = useState(SliceType.Multiplanar);
  const [crosshairText, setCrosshairText] = useState("");
  const [displayType, setDisplayType] = useState(DisplayType.IMG4096);
  const [colorMap, setColorMap] = useState(DisplayColorMap.Gray);
  const [calMin, setCalMin] = useState(0);
  const [calMinVal, setCalMinVal] = useState("0");
  const [calMax, setCalMax] = useState(4096);
  const [calMaxVal, setCalMaxVal] = useState("4096");
  const [isRadiologistView, setIsRadiologistView] = useState(true);
  const radiologistViewStr = isRadiologistView ? "Radiologist" : "Neurologist";

  const urls = selectedFile ? [getFileResourceUrl(selectedFile)] : [];

  const theColorMap = colorMap;

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

  const onChangeRadiologistView = () => {
    setIsRadiologistView(!isRadiologistView);
  };

  const displayStyle: CSSProperties = {};
  const errorStyle: CSSProperties = {};
  if (isHide) {
    displayStyle.display = "none";
    errorStyle.display = "none";
  } else if (urls.length === 0) {
    displayStyle.display = "none";
  } else {
    errorStyle.display = "none";
  }

  console.info(
    "NiiVueDisplay: displayStyle:",
    displayStyle,
    "isHide:",
    isHide,
    "urls:",
    urls,
  );

  return (
    <>
      <h1 style={errorStyle}>error</h1>
      <div className={styles.container} style={displayStyle}>
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
          <Switch
            className={styles.radiologist}
            label={radiologistViewStr}
            isChecked={isRadiologistView}
            onChange={onChangeRadiologistView}
          />
          <span className={styles.crosshair}> {crosshairText} </span>
        </div>
        <SizedNiivueCanvas
          size={8}
          urls={urls}
          colormap={theColorMap}
          calMax={calMax}
          calMin={calMin}
          onLocationChange={(c: CrosshairLocation) => {
            console.info("NiiVueDisplay: onLocationChange: c:", c);
            setCrosshairText(c.string);
          }}
          sliceType={sliceTypeName}
          isRadiologistView={isRadiologistView}
          isHide={isHide}
          useUser={useUser}
        />
      </div>
    </>
  );
};

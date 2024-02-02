import SliceTypeDropdown from "./SliceTypeDropdown.tsx";
import { SLICE_TYPE } from "@niivue/niivue";
import { Slider, Switch, Text, TextVariants, ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";
import React from "react";
import { ChNVROptions } from "../models.ts";
import { Updater } from "use-immer";

type NiivueOptionsPanelProps = {
  options: ChNVROptions;
  setOptions:  Updater<ChNVROptions>;
  size: number;
  setSize: (size: number) => void;
  sizeIsScaling: boolean;
  setSizeIsScaling: (sizeIsScaling: boolean) => void;
};

const NiivueOptionsPanel: React.FC<NiivueOptionsPanelProps> = ({ options, setOptions, size, setSize, sizeIsScaling, setSizeIsScaling }) => {
  const renderIsShowing = (
    options.sliceType === SLICE_TYPE.RENDER
    || (options.sliceType === SLICE_TYPE.MULTIPLANAR && options.multiplanarForceRender)
  );

  return (<div style={{display: "flex", flexDirection: "column", rowGap: "0.5em"}}>
    <ToggleGroup>
      <ToggleGroupItem
        text="Radiological"
        isSelected={options.isRadiologicalConvention}
        onChange={() => {
          setOptions((draft) => { draft.isRadiologicalConvention = true })
        }}
      />
      <ToggleGroupItem
        text="Neurological"
        isSelected={!options.isRadiologicalConvention}
        onChange={() => {
          setOptions((draft) => { draft.isRadiologicalConvention = false })
        }}
      />
    </ToggleGroup>
    <SliceTypeDropdown
      selectedSliceType={[options.sliceType, options.multiplanarForceRender]}
      onSelect={(sliceType, multiplanarForceRender) => {
        setOptions((draft) => {
          draft.sliceType = sliceType;
          draft.multiplanarForceRender = multiplanarForceRender;
        });
      }}
    />
    <div>
      <Text component={TextVariants.h3}>Font size: {size}</Text>
      <Slider
        value={size}
        min={0}
        max={20}
        onChange={(_e, value) => setSize(value)}
      />
    </div>
    <Switch
      label="Scale font size to display"
      isChecked={sizeIsScaling}
      onChange={(_e, value) => setSizeIsScaling(value)}
      id="set-sizeisscaling"
    />
    {
      renderIsShowing &&
      <Switch
        label="Show orientation cube"
        isChecked={options.isOrientCube}
        onChange={(_e, value) => setOptions((draft) => {
          draft.isOrientCube = value;
        })}
        id="set-niivue-3dcube"
      />
    }
    <Switch
      label="Show crosshair"
      isChecked={options.crosshairWidth !== 0}
      onChange={(_e, value) => setOptions((draft) => {
        draft.crosshairWidth = value ? 1 : 0;
      })}
      id="set-niivue-crosshairwidth"
    />
    {
      renderIsShowing && options.crosshairWidth > 0 &&
      <Switch
        label="Show crosshair on 3D"
        isChecked={options.show3Dcrosshair}
        onChange={(_e, value) => setOptions((draft) => {
          draft.show3Dcrosshair = value;
        })}
        id="set-niivue-show3dcrosshair"
      />
    }
  </div>);
}

export default NiivueOptionsPanel;

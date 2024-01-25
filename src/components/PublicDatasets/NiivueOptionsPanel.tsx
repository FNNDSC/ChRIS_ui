import SliceTypeDropdown from "./SliceTypeDropdown.tsx";
import { SLICE_TYPE } from "@niivue/niivue";
import { Checkbox } from "@patternfly/react-core";
import React from "react";
import { ChNVROptions } from "./models.ts";
import { Updater } from "use-immer";

type NiivueOptionsPanelProps = {
  options: ChNVROptions,
  setOptions:  Updater<ChNVROptions>;
}

const NiivueOptionsPanel: React.FC<NiivueOptionsPanelProps> = ({ options, setOptions }) => {
  return (<div>
    <SliceTypeDropdown
      selectedSliceType={[options.sliceType, options.multiplanarForceRender]}
      onSelect={(sliceType, multiplanarForceRender) => {
        setOptions((draft) => {
          draft.sliceType = sliceType;
          draft.multiplanarForceRender = multiplanarForceRender;
        });
      }}
    />
    {
      (
        // show checkbox for isOrientCube only if 3D render view is showing
        options.sliceType === SLICE_TYPE.RENDER
        || (options.sliceType === SLICE_TYPE.MULTIPLANAR && options.multiplanarForceRender)
      )
      &&
      <Checkbox
        label="Show orientation cube"
        isChecked={options.isOrientCube}
        onChange={(_e, value) => setOptions((draft) => {
          draft.isOrientCube = value;
        })}
        id="set-niivue-3dcube"
      />
    }
    <Checkbox
      label="High resolution"
      isChecked={options.isHighResolutionCapable}
      onChange={(_e, value) => setOptions((draft) => {
        draft.isHighResolutionCapable = value;
      })}
      id="set-niivue-ishighresolutioncapable"
    />
  </div>);
}

export default NiivueOptionsPanel;

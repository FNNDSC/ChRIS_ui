import { ChNVROptions } from "../models";
import { Updater } from "use-immer";
import {
  Divider,
  Form,
  FormGroup,
  Panel,
  PanelMain,
  PanelMainBody,
  Slider,
  Switch,
} from "@patternfly/react-core";
import RadiologcalConventionToggle from "./RadiologcalConventionToggle";
import { hideOnDesktop } from "../cssUtils";
import Spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import { css } from "@patternfly/react-styles";
import SliceTypeButton from "./SliceTypeButton";
import React from "react";
import { SLICE_TYPE } from "@niivue/niivue";

type SettingsTabProps = {
  options: ChNVROptions;
  setOptions: Updater<ChNVROptions>;
  size: number;
  setSize: (size: number) => void;
  sizeIsScaling: boolean;
  setSizeIsScaling: (sizeIsScaling: boolean) => void;
};

const SettingsTab: React.FC<SettingsTabProps> = ({
  options,
  setOptions,
  size,
  setSize,
  sizeIsScaling,
  setSizeIsScaling,
}) => {
  const mobileForm = (
    <Form>
      <FormGroup label="Slice Type">
        <SliceTypeButton
          selectedSliceType={[
            options.sliceType,
            options.multiplanarForceRender,
          ]}
          onSelect={(sliceType, multiplanarForceRender) =>
            setOptions((draft) => {
              draft.sliceType = sliceType;
              draft.multiplanarForceRender = multiplanarForceRender;
            })
          }
        />
      </FormGroup>
      <FormGroup label="Display Convention">
        <RadiologcalConventionToggle
          options={options}
          setOptions={setOptions}
        />
      </FormGroup>
    </Form>
  );

  /**
   * Switches which are only relevant when the 3D rendering is being shown.
   */
  const renderingSwitches = (
    <>
      <Switch
        id="show-3d-cube"
        label="Show 3D orientation cube"
        isChecked={options.isOrientCube}
        onChange={(_e, checked) =>
          setOptions((draft) => {
            draft.isOrientCube = checked;
          })
        }
      />
      <Switch
        id="show-3d-crosshair"
        label="Show crosshairs in 3D rendering"
        isChecked={options.show3Dcrosshair}
        onChange={(_e, checked) =>
          setOptions((draft) => {
            draft.show3Dcrosshair = checked;
          })
        }
      />
    </>
  );

  const form = (
    <Form>
      <FormGroup label="Text Size">
        <Slider
          min={0}
          max={20}
          value={size}
          onChange={(_e, value) => setSize(value)}
          hasTooltipOverThumb
        />
      </FormGroup>
      <FormGroup>
        <Switch
          id="switch-size-is-scaling"
          label="Text size scales with display"
          labelOff="Text size does not scale"
          isChecked={sizeIsScaling}
          onChange={(_e, checked) => setSizeIsScaling(checked)}
        />
      </FormGroup>
      {(options.multiplanarForceRender ||
        options.sliceType === SLICE_TYPE.RENDER) &&
        renderingSwitches}
    </Form>
  );

  return (
    <Panel>
      <PanelMain>
        <PanelMainBody>
          <div className={hideOnDesktop}>
            {mobileForm}
            <div className={css(Spacing.pbMd, Spacing.ptMd)}>
              <Divider />
            </div>
          </div>
          {form}
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

export type { SettingsTabProps };
export default SettingsTab;

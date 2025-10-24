import { Flex, FlexItem } from "@patternfly/react-core";
import type React from "react";
import type { Updater } from "use-immer";
import type { ChNVROptions } from "../models";
import DragModeDropdown from "./DragModeDropdown";
import RadiologcalConventionToggle from "./RadiologcalConventionToggle.tsx";
import SliceTypeButton from "./SliceTypeButton";

type HeaderOptionsBarProps = {
  options: ChNVROptions;
  setOptions: Updater<ChNVROptions>;
};

const HeaderOptionBar: React.FC<HeaderOptionsBarProps> = ({
  options,
  setOptions,
}) => {
  return (
    <Flex>
      <FlexItem>
        <RadiologcalConventionToggle
          options={options}
          setOptions={setOptions}
        />
      </FlexItem>
      <FlexItem>
        <div style={{ width: "8em" }}>
          <SliceTypeButton
            isBlock
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
        </div>
      </FlexItem>
      <FlexItem>
        <div style={{ width: "8em" }}>
          <DragModeDropdown
            selectedMode={options.dragMode}
            onSelect={(dragMode) => {
              setOptions((draft) => {
                draft.dragMode = dragMode;
              });
            }}
          />
        </div>
      </FlexItem>
    </Flex>
  );
};

export default HeaderOptionBar;

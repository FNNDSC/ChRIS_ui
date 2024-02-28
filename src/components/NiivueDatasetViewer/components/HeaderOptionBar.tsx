import React from "react";
import { ChNVROptions } from "../models";
import { Updater } from "use-immer";

import DragModeDropdown from "./DragModeDropdown";
import SliceTypeButton from "./SliceTypeButton";
import { Flex, FlexItem } from "@patternfly/react-core";

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
      <FlexItem>
        <div style={{ width: "8em" }}>
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
        </div>
      </FlexItem>
    </Flex>
  );
};

export default HeaderOptionBar;
